from datetime import UTC, datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel
from sqlalchemy import delete, select
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.config import get_settings
from app.core.security import (
    create_session_token,
    decode_session_token,
    generate_reset_token,
    hash_reset_token,
    hash_password,
    verify_password,
)
from app.crud.users import create_or_update_user, get_user_by_email
from app.db import get_db
from app.models.password_reset_token import PasswordResetToken
from app.models.user import User

COOKIE_NAME = "app_session_id"
settings = get_settings()

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginInput(BaseModel):
    email: str
    password: str
    remember_me: bool = False


class RegisterInput(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    date_of_birth: str | None = None


class ForgotPasswordInput(BaseModel):
    email: str


class ResetPasswordInput(BaseModel):
    token: str
    password: str


def _cookie_secure(req: Request) -> bool:
    return req.url.scheme == "https"


def _session_max_age_seconds(remember_me: bool) -> int:
    if remember_me:
        return settings.remember_session_days * 24 * 60 * 60
    return settings.session_max_age_hours * 60 * 60


def _write_session_cookie(req: Request, res: Response, user_payload: dict, *, remember_me: bool) -> None:
    token = create_session_token(user_payload)
    secure = _cookie_secure(req)
    res.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="none" if secure else "lax",
        secure=secure,
        max_age=_session_max_age_seconds(remember_me),
        path="/",
    )


def _clear_session_cookie(req: Request, res: Response) -> None:
    secure = _cookie_secure(req)
    res.delete_cookie(
        key=COOKIE_NAME,
        httponly=True,
        samesite="none" if secure else "lax",
        secure=secure,
        path="/",
    )


def _serialize_user(user: User) -> dict:
    return {
        "id": str(user.id),
        "openId": f"user-{user.id}",
        "email": user.email,
        "name": user.name,
        "role": user.role,
    }


def _build_reset_url(req: Request, token: str) -> str:
    frontend_base = str(req.base_url).rstrip("/")
    configured_frontend = req.headers.get("origin") or frontend_base
    return f"{configured_frontend}/login?mode=reset-password&token={token}"


def _cookie_user_payload(req: Request, db: Session) -> dict | None:
    token = req.cookies.get(COOKIE_NAME)
    if not token:
        return None

    payload = decode_session_token(token)
    if not payload:
        return None

    user_id = payload.get("id")
    if user_id is None:
        return None

    try:
        user = db.get(User, UUID(str(user_id)))
    except (ValueError, TypeError):
        return None
    if user is None:
        return None

    return _serialize_user(user)


def _issue_password_reset_token(req: Request, db: Session, user: User) -> tuple[str, str]:
    db.execute(delete(PasswordResetToken).where(PasswordResetToken.user_id == user.id))

    token = generate_reset_token()
    token_record = PasswordResetToken(
        user_id=user.id,
        token_hash=hash_reset_token(token),
        expires_at=datetime.now(UTC) + timedelta(hours=settings.password_reset_token_hours),
    )
    db.add(token_record)
    db.commit()
    return token, _build_reset_url(req, token)


@router.get("/me")
def me(req: Request, res: Response, db: Session = Depends(get_db)):
    payload = _cookie_user_payload(req, db)
    if not payload:
        if req.cookies.get(COOKIE_NAME):
            _clear_session_cookie(req, res)
        return None

    return payload


@router.post("/register")
def register(
    input_data: RegisterInput,
    req: Request,
    res: Response,
    db: Session = Depends(get_db),
):
    normalized_email = input_data.email.strip().lower()
    if not normalized_email:
        raise HTTPException(status_code=400, detail="Email is required.")
    if len(input_data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    if get_user_by_email(db, normalized_email):
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    name = f"{input_data.first_name.strip()} {input_data.last_name.strip()}".strip()
    if not name:
        raise HTTPException(status_code=400, detail="Name is required.")

    user = create_or_update_user(
        db,
        email=normalized_email,
        name=name,
        password_hash=hash_password(input_data.password),
        role="user",
    )
    user_payload = _serialize_user(user)
    _write_session_cookie(req, res, user_payload, remember_me=True)
    return {
        "success": True,
        "user": user_payload,
    }


@router.post("/forgot-password")
def forgot_password(
    input_data: ForgotPasswordInput,
    req: Request,
    db: Session = Depends(get_db),
):
    normalized_email = input_data.email.strip().lower()
    user = get_user_by_email(db, normalized_email) if normalized_email else None

    response: dict[str, object] = {
        "success": True,
        "message": "If the account exists, password reset instructions have been generated.",
    }

    if user is None:
        return response

    token, reset_url = _issue_password_reset_token(req, db, user)

    if settings.app_env == "development":
        response["resetToken"] = token
        response["resetUrl"] = reset_url

    return response


@router.post("/login")
def login(
    input_data: LoginInput,
    req: Request,
    res: Response,
    db: Session = Depends(get_db),
):
    normalized_email = input_data.email.strip().lower()
    user = get_user_by_email(db, normalized_email)
    if user is None or not verify_password(input_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    user_payload = _serialize_user(user)
    _write_session_cookie(req, res, user_payload, remember_me=input_data.remember_me)
    return {
        "success": True,
        "user": user_payload,
    }


@router.post("/reset-password")
def reset_password(
    input_data: ResetPasswordInput,
    req: Request,
    res: Response,
    db: Session = Depends(get_db),
):
    if len(input_data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    token_hash = hash_reset_token(input_data.token.strip())
    token_record = db.scalar(
        select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash)
    )
    if token_record is None or token_record.used_at is not None:
        raise HTTPException(status_code=400, detail="This reset link is invalid or has already been used.")

    now = datetime.now(UTC)
    if token_record.expires_at <= now:
        db.delete(token_record)
        db.commit()
        raise HTTPException(status_code=400, detail="This reset link has expired.")

    user = db.get(User, token_record.user_id)
    if user is None:
        db.delete(token_record)
        db.commit()
        raise HTTPException(status_code=400, detail="This reset link is no longer valid.")

    user.password_hash = hash_password(input_data.password)
    token_record.used_at = now
    db.add(user)
    db.add(token_record)
    db.commit()
    db.refresh(user)

    user_payload = _serialize_user(user)
    _write_session_cookie(req, res, user_payload, remember_me=False)
    return {
        "success": True,
        "message": "Password updated successfully.",
        "user": user_payload,
    }


@router.post("/logout")
def logout(req: Request, res: Response):
    _clear_session_cookie(req, res)
    return {"success": True}
