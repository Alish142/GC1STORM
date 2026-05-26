import secrets

from fastapi import Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.security import decode_session_token
from app.db import get_db
from app.models.user import User

COOKIE_NAME = "app_session_id"
CSRF_COOKIE_NAME = "app_csrf_token"


def is_secure_cookie(req: Request) -> bool:
    return req.url.scheme == "https"


def clear_session_cookie(req: Request, res: Response) -> None:
    secure = is_secure_cookie(req)
    res.delete_cookie(
        key=COOKIE_NAME,
        httponly=True,
        samesite="none" if secure else "lax",
        secure=secure,
        path="/",
    )
    res.delete_cookie(
        key=CSRF_COOKIE_NAME,
        httponly=False,
        samesite="none" if secure else "lax",
        secure=secure,
        path="/",
    )


def set_csrf_cookie(req: Request, res: Response, *, max_age: int) -> str:
    secure = is_secure_cookie(req)
    token = secrets.token_urlsafe(32)
    res.set_cookie(
        key=CSRF_COOKIE_NAME,
        value=token,
        httponly=False,
        samesite="none" if secure else "lax",
        secure=secure,
        max_age=max_age,
        path="/",
    )
    return token


def serialize_auth_user(user: User) -> dict[str, str]:
    return {
        "id": str(user.id),
        "openId": f"user-{user.id}",
        "email": user.email,
        "name": user.name,
        "role": user.role,
    }


def get_current_user(
    req: Request,
    res: Response,
    db: Session = Depends(get_db),
) -> User | None:
    token = req.cookies.get(COOKIE_NAME)
    if not token:
        return None

    payload = decode_session_token(token)
    if not payload:
        clear_session_cookie(req, res)
        return None

    user_id = payload.get("id")
    if user_id is None:
        clear_session_cookie(req, res)
        return None

    try:
        user = db.get(User, UUID(str(user_id)))
    except (ValueError, TypeError):
        clear_session_cookie(req, res)
        return None

    if user is None:
        clear_session_cookie(req, res)
        return None

    return user


def require_authenticated_user(
    user: User | None = Depends(get_current_user),
) -> User:
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication required.")
    return user


def require_admin_user(
    user: User = Depends(require_authenticated_user),
) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    return user


def require_csrf_token(
    req: Request,
    _: User = Depends(require_authenticated_user),
) -> None:
    cookie_token = req.cookies.get(CSRF_COOKIE_NAME)
    header_token = req.headers.get("X-CSRF-Token")

    if not cookie_token or not header_token or not secrets.compare_digest(cookie_token, header_token):
        raise HTTPException(status_code=403, detail="CSRF validation failed.")


def require_role(*allowed_roles: str):
    normalized_roles = tuple(role.strip().lower() for role in allowed_roles if role.strip())
    if not normalized_roles:
        raise ValueError("require_role needs at least one role.")

    def dependency(user: User = Depends(require_authenticated_user)) -> User:
        if user.role.strip().lower() not in normalized_roles:
            allowed = ", ".join(normalized_roles)
            raise HTTPException(status_code=403, detail=f"Requires one of these roles: {allowed}.")
        return user

    return dependency
