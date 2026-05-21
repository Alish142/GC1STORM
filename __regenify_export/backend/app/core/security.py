from datetime import UTC, datetime, timedelta
from typing import Any

import jwt

from app.core.config import get_settings

settings = get_settings()
ALGORITHM = "HS256"


def _secret() -> str:
    return settings.jwt_secret or "local-dev-jwt-secret"


def create_session_token(payload: dict[str, Any], expires_days: int = 7) -> str:
    exp = datetime.now(UTC) + timedelta(days=expires_days)
    data = {**payload, "exp": exp}
    return jwt.encode(data, _secret(), algorithm=ALGORITHM)


def decode_session_token(token: str) -> dict[str, Any] | None:
    try:
        return jwt.decode(token, _secret(), algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None
