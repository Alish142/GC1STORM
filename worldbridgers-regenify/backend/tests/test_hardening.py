import importlib
import os
import sys
import time
import unittest
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from unittest import mock
from uuid import uuid4

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
    "app.api.deps.auth",
    "app.api.routes.auth",
    "app.api.routes.support",
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
        module = sys.modules.get(module_name)
        if module_name == "app.db.neo4j" and module and hasattr(module, "close_neo4j"):
            try:
                module.close_neo4j()
            except Exception:
                pass
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


class AuthDependencyTests(unittest.TestCase):
    def _build_request(self, *, cookies: dict[str, str] | None = None, headers: dict[str, str] | None = None) -> Request:
        raw_headers = []
        for key, value in (headers or {}).items():
            raw_headers.append((key.lower().encode("latin-1"), value.encode("latin-1")))
        if cookies:
            cookie_header = "; ".join(f"{key}={value}" for key, value in cookies.items())
            raw_headers.append((b"cookie", cookie_header.encode("latin-1")))
        return Request(
            {
                "type": "http",
                "method": "POST",
                "scheme": "https",
                "path": "/api/auth/change-password",
                "headers": raw_headers,
                "client": ("127.0.0.1", 12345),
            }
        )

    def test_require_csrf_token_rejects_mismatch(self) -> None:
        auth_deps = _load_module("app.api.deps.auth")
        req = self._build_request(
            cookies={auth_deps.CSRF_COOKIE_NAME: "cookie-token"},
            headers={"X-CSRF-Token": "header-token"},
        )

        with self.assertRaises(HTTPException) as error:
            auth_deps.require_csrf_token(req=req, _=SimpleNamespace(id="user-1"))

        self.assertEqual(error.exception.status_code, 403)

    def test_get_current_user_clears_invalid_cookie(self) -> None:
        auth_deps = _load_module("app.api.deps.auth")
        req = self._build_request(cookies={auth_deps.COOKIE_NAME: "bad-token"})
        res = Response()

        with mock.patch.object(auth_deps, "decode_session_token", return_value=None):
            user = auth_deps.get_current_user(req=req, res=res, db=SimpleNamespace())

        self.assertIsNone(user)
        set_cookie_headers = ",".join(res.headers.getlist("set-cookie"))
        self.assertIn(f"{auth_deps.COOKIE_NAME}=\"\"", set_cookie_headers)
        self.assertIn(f"{auth_deps.CSRF_COOKIE_NAME}=\"\"", set_cookie_headers)


class AuthRouteTests(unittest.TestCase):
    def _build_request(self, *, origin: str = "https://frontend.example") -> Request:
        return Request(
            {
                "type": "http",
                "method": "POST",
                "scheme": "https",
                "path": "/api/auth/login",
                "headers": [(b"origin", origin.encode("latin-1"))],
                "client": ("127.0.0.1", 12345),
            }
        )

    def test_login_rejects_invalid_credentials(self) -> None:
        auth_module = _load_module("app.api.routes.auth")
        req = self._build_request()
        res = Response()
        input_data = auth_module.LoginInput(email="person@example.com", password="wrong", remember_me=False)

        with mock.patch.object(auth_module, "get_user_by_email", return_value=None), mock.patch.object(
            auth_module, "log_audit_event"
        ) as log_audit_event, mock.patch.object(auth_module, "_write_session_cookie") as write_cookie:
            with self.assertRaises(HTTPException) as error:
                auth_module.login(input_data=input_data, req=req, res=res, _=None, db=SimpleNamespace())

        self.assertEqual(error.exception.status_code, 401)
        write_cookie.assert_not_called()
        log_audit_event.assert_called_once()

    def test_write_session_cookie_sets_matching_cookie_lifetime(self) -> None:
        auth_module = _load_module("app.api.routes.auth")
        req = self._build_request()
        res = Response()

        with mock.patch.object(auth_module, "create_session_token", return_value="signed-token") as create_token:
            auth_module._write_session_cookie(
                req,
                res,
                {"id": "user-1", "email": "person@example.com", "name": "Person", "role": "user"},
                remember_me=True,
            )

        expected_max_age = auth_module.settings.remember_session_days * 24 * 60 * 60
        create_token.assert_called_once()
        self.assertEqual(create_token.call_args.kwargs["expires_seconds"], expected_max_age)
        set_cookie_headers = ",".join(res.headers.getlist("set-cookie"))
        self.assertIn("signed-token", set_cookie_headers)
        self.assertIn(f"Max-Age={expected_max_age}", set_cookie_headers)


class _FakeAuthDb:
    def __init__(self):
        self.users_by_email = {}
        self.users_by_id = {}
        self.reset_tokens_by_hash = {}
        self.deleted_tokens = []

    def add(self, value):
        if hasattr(value, "token_hash"):
            self.reset_tokens_by_hash[value.token_hash] = value
        elif hasattr(value, "email"):
            self.users_by_email[value.email] = value
            self.users_by_id[value.id] = value

    def commit(self):
        return None

    def refresh(self, _value):
        return None

    def get(self, model, value):
        if getattr(model, "__name__", "") == "User":
            return self.users_by_id.get(value)
        return None

    def scalar(self, _statement):
        return next(iter(self.reset_tokens_by_hash.values()), None)

    def execute(self, _statement):
        self.reset_tokens_by_hash.clear()

    def delete(self, value):
        if hasattr(value, "token_hash"):
            self.deleted_tokens.append(value.token_hash)
            self.reset_tokens_by_hash.pop(value.token_hash, None)


class AuthLifecycleTests(unittest.TestCase):
    def _build_request(
        self,
        *,
        path: str,
        origin: str = "https://frontend.example",
        scheme: str = "https",
        cookies: dict[str, str] | None = None,
        headers: dict[str, str] | None = None,
    ) -> Request:
        raw_headers = [(b"origin", origin.encode("latin-1"))]
        for key, value in (headers or {}).items():
            raw_headers.append((key.lower().encode("latin-1"), value.encode("latin-1")))
        if cookies:
            cookie_header = "; ".join(f"{key}={value}" for key, value in cookies.items())
            raw_headers.append((b"cookie", cookie_header.encode("latin-1")))
        return Request(
            {
                "type": "http",
                "method": "POST",
                "scheme": scheme,
                "path": path,
                "headers": raw_headers,
                "client": ("127.0.0.1", 12345),
            }
        )

    def test_full_auth_lifecycle_register_login_change_reset_logout(self) -> None:
        auth_module = _load_module("app.api.routes.auth")
        db = _FakeAuthDb()

        def fake_get_user_by_email(_db, email):
            return db.users_by_email.get(email)

        def fake_create_or_update_user(_db, *, email, name, password_hash=None, role="user"):
            user = db.users_by_email.get(email)
            if user is None:
                user = SimpleNamespace(
                    id=uuid4(),
                    email=email,
                    name=name,
                    password_hash=password_hash,
                    role=role,
                )
            else:
                user.name = name
                user.role = role
                if password_hash is not None:
                    user.password_hash = password_hash
            db.add(user)
            return user

        with mock.patch.object(auth_module, "get_user_by_email", side_effect=fake_get_user_by_email), mock.patch.object(
            auth_module, "create_or_update_user", side_effect=fake_create_or_update_user
        ), mock.patch.object(auth_module, "log_audit_event"):
            register_req = self._build_request(path="/api/auth/register")
            register_res = Response()
            register_response = auth_module.register(
                input_data=auth_module.RegisterInput(
                    first_name="Casey",
                    last_name="Example",
                    email="casey@example.com",
                    password="Str0ng!Pass",
                ),
                req=register_req,
                res=register_res,
                _=None,
                db=db,
            )

            created_user = db.users_by_email["casey@example.com"]
            self.assertTrue(register_response["success"])
            self.assertEqual(register_response["user"]["email"], "casey@example.com")
            self.assertTrue(auth_module.verify_password("Str0ng!Pass", created_user.password_hash))
            self.assertIn(auth_module.COOKIE_NAME, ",".join(register_res.headers.getlist("set-cookie")))

            login_req = self._build_request(path="/api/auth/login")
            login_res = Response()
            login_response = auth_module.login(
                input_data=auth_module.LoginInput(
                    email="casey@example.com",
                    password="Str0ng!Pass",
                    remember_me=False,
                ),
                req=login_req,
                res=login_res,
                _=None,
                db=db,
            )
            self.assertTrue(login_response["success"])

            me_response = auth_module.me(user=created_user)
            self.assertEqual(me_response["email"], "casey@example.com")
            self.assertEqual(me_response["csrfCookieName"], auth_module.CSRF_COOKIE_NAME)

            change_req = self._build_request(path="/api/auth/change-password")
            change_response = auth_module.change_password(
                input_data=auth_module.ChangePasswordInput(
                    current_password="Str0ng!Pass",
                    new_password="EvenStr0nger!2",
                ),
                req=change_req,
                user=created_user,
                __=None,
                db=db,
            )
            self.assertTrue(change_response["success"])
            self.assertTrue(auth_module.verify_password("EvenStr0nger!2", created_user.password_hash))

            forgot_req = self._build_request(path="/api/auth/forgot-password")
            with mock.patch.object(auth_module, "generate_reset_token", return_value="fixed-reset-token"), mock.patch.object(
                auth_module.settings, "smtp_host", None
            ), mock.patch.object(auth_module.settings, "smtp_from_email", None):
                forgot_response = auth_module.forgot_password(
                    input_data=auth_module.ForgotPasswordInput(email="casey@example.com"),
                    req=forgot_req,
                    _=None,
                    db=db,
                )
            self.assertEqual(forgot_response["resetToken"], "fixed-reset-token")
            self.assertIn("mode=reset-password", forgot_response["resetUrl"])

            reset_req = self._build_request(path="/api/auth/reset-password")
            reset_res = Response()
            reset_response = auth_module.reset_password(
                input_data=auth_module.ResetPasswordInput(
                    token="fixed-reset-token",
                    password="Ult1mate!Pass",
                ),
                req=reset_req,
                res=reset_res,
                db=db,
            )
            self.assertTrue(reset_response["success"])
            self.assertTrue(auth_module.verify_password("Ult1mate!Pass", created_user.password_hash))
            stored_token = next(iter(db.reset_tokens_by_hash.values()))
            self.assertIsNotNone(stored_token.used_at)

            old_login_req = self._build_request(path="/api/auth/login")
            with self.assertRaises(HTTPException) as old_login_error:
                auth_module.login(
                    input_data=auth_module.LoginInput(
                        email="casey@example.com",
                        password="EvenStr0nger!2",
                        remember_me=False,
                    ),
                    req=old_login_req,
                    res=Response(),
                    _=None,
                    db=db,
                )
            self.assertEqual(old_login_error.exception.status_code, 401)

            new_login_response = auth_module.login(
                input_data=auth_module.LoginInput(
                    email="casey@example.com",
                    password="Ult1mate!Pass",
                    remember_me=True,
                ),
                req=self._build_request(path="/api/auth/login"),
                res=Response(),
                _=None,
                db=db,
            )
            self.assertTrue(new_login_response["success"])

            logout_req = self._build_request(path="/api/auth/logout")
            logout_res = Response()
            logout_response = auth_module.logout(
                req=logout_req,
                res=logout_res,
                user=created_user,
                db=db,
            )
            self.assertTrue(logout_response["success"])
            self.assertIn(f"{auth_module.COOKIE_NAME}=\"\"", ",".join(logout_res.headers.getlist("set-cookie")))


class SupportRouteTests(unittest.TestCase):
    def _build_request(self) -> Request:
        return Request(
            {
                "type": "http",
                "method": "POST",
                "scheme": "https",
                "path": "/api/support/call-requests",
                "headers": [],
                "client": ("127.0.0.1", 12345),
            }
        )

    def test_create_call_request_uses_authenticated_user_defaults(self) -> None:
        support_module = _load_module("app.api.routes.support")
        req = self._build_request()
        payload = support_module.CallRequestInput(
            full_name=None,
            email=None,
            organisation=" Worldbridgers ",
            preferred_time=" Morning ",
            notes=" Need a walkthrough ",
        )
        current_user = SimpleNamespace(
            id="user-123",
            name="Casey Example",
            email="casey@example.com",
        )
        created_record = SimpleNamespace(
            id="call-1",
            user_id="user-123",
            full_name="Casey Example",
            email="casey@example.com",
            organisation="Worldbridgers",
            preferred_time="Morning",
            notes="Need a walkthrough",
            status="new",
            created_at=datetime(2026, 1, 1, tzinfo=UTC),
        )
        db = SimpleNamespace(
            add=mock.Mock(),
            commit=mock.Mock(),
            refresh=mock.Mock(side_effect=lambda record: record.__dict__.update(created_record.__dict__)),
        )

        with mock.patch.object(support_module, "log_audit_event") as log_audit_event:
            response = support_module.create_call_request(
                payload=payload,
                req=req,
                _=None,
                current_user=current_user,
                db=db,
            )

        db.add.assert_called_once()
        db.commit.assert_called_once()
        db.refresh.assert_called_once()
        log_audit_event.assert_called_once()
        self.assertEqual(response["request"]["fullName"], "Casey Example")
        self.assertEqual(response["request"]["email"], "casey@example.com")
        self.assertEqual(response["request"]["organisation"], "Worldbridgers")


if __name__ == "__main__":
    unittest.main()
