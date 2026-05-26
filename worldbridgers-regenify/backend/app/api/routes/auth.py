from datetime import UTC, datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.api.deps.auth import (
    CSRF_COOKIE_NAME,
    COOKIE_NAME,
    clear_session_cookie,
    get_current_user,
    is_secure_cookie,
    serialize_auth_user,
    set_csrf_cookie,
)
from app.api.deps.rate_limit import rate_limit
from app.core.config import get_settings
from app.core.security import (
    create_session_token,
    generate_reset_token,
    hash_reset_token,
    hash_password,
    verify_password,
)
from app.crud.users import create_or_update_user, get_user_by_email
from app.db import get_db
from app.models.password_reset_token import PasswordResetToken
from app.models.user import User
from app.services.email import send_password_reset_email

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

def _session_max_age_seconds(remember_me: bool) -> int:
    if remember_me:
        return settings.remember_session_days * 24 * 60 * 60
    return settings.session_max_age_hours * 60 * 60


def _write_session_cookie(req: Request, res: Response, user_payload: dict, *, remember_me: bool) -> None:
    max_age = _session_max_age_seconds(remember_me)
    token = create_session_token(user_payload)
    secure = is_secure_cookie(req)
    res.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="none" if secure else "lax",
        secure=secure,
        max_age=max_age,
        path="/",
    )
    set_csrf_cookie(req, res, max_age=max_age)


def _build_reset_url(req: Request, token: str) -> str:
    configured_frontend = req.headers.get("origin") or settings.frontend_base_url
    configured_frontend = configured_frontend.rstrip("/")
    return f"{configured_frontend}/login?mode=reset-password&token={token}"


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
def me(user: User | None = Depends(get_current_user)):
    if not user:
        return None
    return {
        **serialize_auth_user(user),
        "csrfCookieName": CSRF_COOKIE_NAME,
    }


@router.post("/register")
def register(
    input_data: RegisterInput,
    req: Request,
    res: Response,
    _: None = Depends(
        rate_limit(
            scope="auth-register",
            limit=settings.register_rate_limit_attempts,
            window_seconds=settings.register_rate_limit_window_seconds,
        )
    ),
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
    user_payload = serialize_auth_user(user)
    _write_session_cookie(req, res, user_payload, remember_me=True)
    return {
        "success": True,
        "user": user_payload,
    }


@router.post("/forgot-password")
def forgot_password(
    input_data: ForgotPasswordInput,
    req: Request,
    _: None = Depends(
        rate_limit(
            scope="auth-forgot-password",
            limit=settings.forgot_password_rate_limit_attempts,
            window_seconds=settings.forgot_password_rate_limit_window_seconds,
        )
    ),
    db: Session = Depends(get_db),
):
    if not settings.smtp_enabled and settings.app_env != "development":
        raise HTTPException(status_code=503, detail="Password reset email delivery is not configured.")

    normalized_email = input_data.email.strip().lower()
    user = get_user_by_email(db, normalized_email) if normalized_email else None

    response: dict[str, object] = {
        "success": True,
        "message": "If the account exists, password reset instructions have been sent.",
    }

    if user is None:
        return response

    token, reset_url = _issue_password_reset_token(req, db, user)

    if settings.smtp_enabled:
        try:
            send_password_reset_email(
                to_email=user.email,
                recipient_name=user.name,
                reset_url=reset_url,
            )
        except Exception as exc:
            raise HTTPException(
                status_code=503,
                detail="Unable to send password reset email right now.",
            ) from exc
    elif settings.app_env == "development":
        response["message"] = "Password reset link generated for development."
        response["resetToken"] = token
        response["resetUrl"] = reset_url

    return response


@router.post("/login")
def login(
    input_data: LoginInput,
    req: Request,
    res: Response,
    _: None = Depends(
        rate_limit(
            scope="auth-login",
            limit=settings.login_rate_limit_attempts,
            window_seconds=settings.login_rate_limit_window_seconds,
        )
    ),
    db: Session = Depends(get_db),
):
    normalized_email = input_data.email.strip().lower()
    user = get_user_by_email(db, normalized_email)
    if user is None or not verify_password(input_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    user_payload = serialize_auth_user(user)
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

    user_payload = serialize_auth_user(user)
    _write_session_cookie(req, res, user_payload, remember_me=False)
    return {
        "success": True,
        "message": "Password updated successfully.",
        "user": user_payload,
    }


@router.post("/logout")
def logout(req: Request, res: Response):
    clear_session_cookie(req, res)
    return {"success": True}
