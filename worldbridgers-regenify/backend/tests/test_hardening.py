import importlib
import os
import sys
import time
import unittest
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from unittest import mock

import jwt
from fastapi import HTTPException
from starlette.requests import Request
from starlette.responses import Response


DEFAULT_ENV = {
    "POSTGRES_DSN": "postgresql://user:pass@localhost:5432/regenify",
    "NEO4J_URI": "bolt://localhost:7687",
    "NEO4J_USER": "neo4j",
    "NEO4J_PASSWORD": "password",
    "JWT_SECRET": "a-strong-test-jwt-secret",
}

MODULES_TO_RESET = [
    "app.api.deps",
    "app.core.config",
    "app.core.security",
    "app.db",
    "app.db.postgres",
    "app.db.neo4j",
    "app.api.deps.rate_limit",
    "app.models",
    "app.models.base",
    "app.models.rate_limit_event",
]


def _reset_modules() -> None:
    for module_name in MODULES_TO_RESET:
        sys.modules.pop(module_name, None)


def _load_module(module_name: str, **env_overrides: str):
    previous_values: dict[str, str | None] = {}
    try:
        for key, value in {**DEFAULT_ENV, **env_overrides}.items():
            previous_values[key] = os.environ.get(key)
            os.environ[key] = value
        _reset_modules()
        return importlib.import_module(module_name)
    finally:
        for key, previous_value in previous_values.items():
            if previous_value is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = previous_value


class SessionTokenTests(unittest.TestCase):
    def test_create_session_token_honors_expiry_seconds(self) -> None:
        security = _load_module("app.core.security")

        before = int(time.time())
        token = security.create_session_token({"id": "user-123"}, expires_seconds=2)
        payload = jwt.decode(
            token,
            options={"verify_signature": False, "verify_exp": False},
        )
        after = int(time.time())

        self.assertGreaterEqual(payload["exp"], before + 1)
        self.assertLessEqual(payload["exp"], after + 3)


class PostgresStartupTests(unittest.TestCase):
    def test_init_postgres_raises_by_default_when_boot_fails(self) -> None:
        postgres = _load_module("app.db.postgres", ALLOW_DEGRADED_DB_STARTUP="false")

        with mock.patch.object(
            postgres.Base.metadata,
            "create_all",
            side_effect=RuntimeError("db boot failed"),
        ):
            with self.assertRaisesRegex(RuntimeError, "db boot failed"):
                postgres.init_postgres()

        health = postgres.postgres_health()
        self.assertEqual(health["status"], "error")
        self.assertIn("db boot failed", health["detail"])

    def test_init_postgres_allows_explicit_degraded_startup(self) -> None:
        postgres = _load_module("app.db.postgres", ALLOW_DEGRADED_DB_STARTUP="true")

        with mock.patch.object(
            postgres.Base.metadata,
            "create_all",
            side_effect=RuntimeError("db boot failed"),
        ):
            postgres.init_postgres()

        health = postgres.postgres_health()
        self.assertEqual(health["status"], "error")
        self.assertIn("db boot failed", health["detail"])


class GraphFallbackTests(unittest.TestCase):
    def test_graph_fallback_requires_explicit_opt_in(self) -> None:
        neo4j_module = _load_module("app.db.neo4j", ALLOW_MOCK_GRAPH_FALLBACK="false")

        with mock.patch.object(neo4j_module, "verify_neo4j", return_value=False):
            with self.assertRaises(HTTPException) as error:
                neo4j_module.get_graph_view_data_or_fallback()

        self.assertEqual(error.exception.status_code, 503)

    def test_graph_fallback_uses_mock_data_when_enabled(self) -> None:
        neo4j_module = _load_module("app.db.neo4j", ALLOW_MOCK_GRAPH_FALLBACK="true")

        with mock.patch.object(neo4j_module, "verify_neo4j", return_value=False):
            graph_data, graph_source = neo4j_module.get_graph_view_data_or_fallback()

        self.assertEqual(graph_source, "mock")
        self.assertEqual(graph_data, neo4j_module.GRAPH_DATA)


class _FakeScalarResult:
    def __init__(self, values):
        self._values = values

    def all(self):
        return list(self._values)


class _FakeDbSession:
    def __init__(self, attempts):
        self.attempts = attempts
        self.execute_calls = []
        self.added = []
        self.commit_called = False
        self.rollback_called = False

    def execute(self, statement, params=None):
        self.execute_calls.append((statement, params))
        return None

    def scalars(self, _statement):
        return _FakeScalarResult(self.attempts)

    def add(self, value):
        self.added.append(value)

    def commit(self):
        self.commit_called = True

    def rollback(self):
        self.rollback_called = True


class RateLimitTests(unittest.TestCase):
    def _build_request(self, ip_address: str = "127.0.0.1") -> Request:
        return Request(
            {
                "type": "http",
                "method": "POST",
                "path": "/api/auth/login",
                "headers": [],
                "client": (ip_address, 12345),
            }
        )

    def test_rate_limit_persists_allowed_attempt(self) -> None:
        rate_limit_module = _load_module("app.api.deps.rate_limit")
        dependency = rate_limit_module.rate_limit(scope="auth-login", limit=2, window_seconds=60)
        db = _FakeDbSession(attempts=[])
        req = self._build_request()
        res = Response()

        dependency(req=req, res=res, db=db)

        self.assertEqual(len(db.execute_calls), 2)
        self.assertEqual(len(db.added), 1)
        self.assertTrue(db.commit_called)
        self.assertFalse(db.rollback_called)
        self.assertEqual(db.added[0].scope, "auth-login")
        self.assertEqual(db.added[0].client_key, "127.0.0.1")

    def test_rate_limit_blocks_when_window_is_full(self) -> None:
        rate_limit_module = _load_module("app.api.deps.rate_limit")
        dependency = rate_limit_module.rate_limit(scope="auth-login", limit=2, window_seconds=60)
        oldest_attempt = SimpleNamespace(created_at=datetime.now(UTC) - timedelta(seconds=10))
        second_attempt = SimpleNamespace(created_at=datetime.now(UTC) - timedelta(seconds=5))
        db = _FakeDbSession(attempts=[oldest_attempt, second_attempt])
        req = self._build_request()
        res = Response()

        with self.assertRaises(HTTPException) as error:
            dependency(req=req, res=res, db=db)

        self.assertEqual(error.exception.status_code, 429)
        self.assertEqual(res.headers["Retry-After"], error.exception.headers["Retry-After"])
        self.assertEqual(len(db.added), 0)
        self.assertFalse(db.commit_called)
        self.assertTrue(db.rollback_called)


if __name__ == "__main__":
    unittest.main()
