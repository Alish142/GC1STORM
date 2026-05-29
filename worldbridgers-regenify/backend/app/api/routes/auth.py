import re
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
    require_authenticated_user,
    require_csrf_token,
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
from app.services.audit import log_audit_event
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


class ForgotPasswordInput(BaseModel):
    email: str


class ResetPasswordInput(BaseModel):
    token: str
    password: str


class ChangePasswordInput(BaseModel):
    current_password: str
    new_password: str


EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
NAME_PATTERN = re.compile(r"^[A-Za-z][A-Za-z\s'-]*[A-Za-z]$|^[A-Za-z]$")
PASSWORD_POLICY_PATTERN = re.compile(
    r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$"
)


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _validate_name_field(value: str, field_name: str) -> str:
    normalized_value = value.strip()
    if not normalized_value:
        raise HTTPException(status_code=400, detail=f"{field_name} is required.")
    if not NAME_PATTERN.fullmatch(normalized_value):
        raise HTTPException(
            status_code=400,
            detail=f"{field_name} must contain letters only, with optional spaces, hyphens, or apostrophes.",
        )
    return normalized_value


def _validate_email(email: str) -> str:
    normalized_email = _normalize_email(email)
    if not normalized_email:
        raise HTTPException(status_code=400, detail="Email is required.")
    if not EMAIL_PATTERN.fullmatch(normalized_email):
        raise HTTPException(status_code=400, detail="Enter a valid email address.")
    return normalized_email


def _validate_password_strength(password: str, *, field_label: str = "Password") -> None:
    if not PASSWORD_POLICY_PATTERN.fullmatch(password):
        raise HTTPException(
            status_code=400,
            detail=(
                f"{field_label} must be at least 8 characters and include uppercase, "
                "lowercase, number, and special character."
            ),
        )

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
    try:
        first_name = _validate_name_field(input_data.first_name, "First name")
        last_name = _validate_name_field(input_data.last_name, "Last name")
        normalized_email = _validate_email(input_data.email)
        _validate_password_strength(input_data.password)
    except HTTPException as exc:
        log_audit_event(
            db,
            action="auth.register",
            status="failure",
            req=req,
            details={"reason": "validation_failed", "email": _normalize_email(input_data.email)},
        )
        raise exc
    if get_user_by_email(db, normalized_email):
        log_audit_event(
            db,
            action="auth.register",
            status="failure",
            req=req,
            details={"reason": "duplicate_email", "email": normalized_email},
        )
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user = create_or_update_user(
        db,
        email=normalized_email,
        name=f"{first_name} {last_name}",
        password_hash=hash_password(input_data.password),
        role="user",
    )
    user_payload = serialize_auth_user(user)
    _write_session_cookie(req, res, user_payload, remember_me=True)
    log_audit_event(
        db,
        action="auth.register",
        req=req,
        actor_user=user,
        resource_type="user",
        resource_id=str(user.id),
        details={"email": user.email, "role": user.role},
    )
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

    normalized_email = _normalize_email(input_data.email)
    user = get_user_by_email(db, normalized_email) if normalized_email else None

    response: dict[str, object] = {
        "success": True,
        "message": "If the account exists, password reset instructions have been sent.",
    }

    if user is None:
        log_audit_event(
            db,
            action="auth.forgot_password",
            req=req,
            status="ignored",
            details={"email": normalized_email, "reason": "user_not_found"},
        )
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

    log_audit_event(
        db,
        action="auth.forgot_password",
        req=req,
        actor_user=user,
        resource_type="user",
        resource_id=str(user.id),
        details={"email": user.email},
    )

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
    normalized_email = _normalize_email(input_data.email)
    user = get_user_by_email(db, normalized_email)
    if user is None or not verify_password(input_data.password, user.password_hash):
        log_audit_event(
            db,
            action="auth.login",
            status="failure",
            req=req,
            details={"email": normalized_email},
        )
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    user_payload = serialize_auth_user(user)
    _write_session_cookie(req, res, user_payload, remember_me=input_data.remember_me)
    log_audit_event(
        db,
        action="auth.login",
        req=req,
        actor_user=user,
        resource_type="user",
        resource_id=str(user.id),
        details={"rememberMe": input_data.remember_me},
    )
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
    try:
        _validate_password_strength(input_data.password)
    except HTTPException as exc:
        log_audit_event(
            db,
            action="auth.reset_password",
            status="failure",
            req=req,
            details={"reason": "weak_password"},
        )
        raise exc

    token_hash = hash_reset_token(input_data.token.strip())
    token_record = db.scalar(
        select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash)
    )
    if token_record is None or token_record.used_at is not None:
        log_audit_event(
            db,
            action="auth.reset_password",
            status="failure",
            req=req,
            details={"reason": "invalid_or_used_token"},
        )
        raise HTTPException(status_code=400, detail="This reset link is invalid or has already been used.")

    now = datetime.now(UTC)
    if token_record.expires_at <= now:
        db.delete(token_record)
        db.commit()
        log_audit_event(
            db,
            action="auth.reset_password",
            status="failure",
            req=req,
            details={"reason": "expired_token"},
        )
        raise HTTPException(status_code=400, detail="This reset link has expired.")

    user = db.get(User, token_record.user_id)
    if user is None:
        db.delete(token_record)
        db.commit()
        log_audit_event(
            db,
            action="auth.reset_password",
            status="failure",
            req=req,
            details={"reason": "user_missing"},
        )
        raise HTTPException(status_code=400, detail="This reset link is no longer valid.")

    user.password_hash = hash_password(input_data.password)
    token_record.used_at = now
    db.add(user)
    db.add(token_record)
    db.commit()
    db.refresh(user)

    user_payload = serialize_auth_user(user)
    _write_session_cookie(req, res, user_payload, remember_me=False)
    log_audit_event(
        db,
        action="auth.reset_password",
        req=req,
        actor_user=user,
        resource_type="user",
        resource_id=str(user.id),
        details={"email": user.email},
    )
    return {
        "success": True,
        "message": "Password updated successfully.",
        "user": user_payload,
    }


@router.post("/change-password")
def change_password(
    input_data: ChangePasswordInput,
    req: Request,
    user: User = Depends(require_authenticated_user),
    __: None = Depends(require_csrf_token),
    db: Session = Depends(get_db),
):
    current_password = input_data.current_password
    new_password = input_data.new_password

    if not verify_password(current_password, user.password_hash):
        log_audit_event(
            db,
            action="auth.change_password",
            status="failure",
            req=req,
            actor_user=user,
            resource_type="user",
            resource_id=str(user.id),
            details={"reason": "invalid_current_password", "email": user.email},
        )
        raise HTTPException(status_code=400, detail="Current password is incorrect.")

    try:
        _validate_password_strength(new_password, field_label="New password")
    except HTTPException as exc:
        log_audit_event(
            db,
            action="auth.change_password",
            status="failure",
            req=req,
            actor_user=user,
            resource_type="user",
            resource_id=str(user.id),
            details={"reason": "weak_password", "email": user.email},
        )
        raise exc

    if current_password == new_password:
        log_audit_event(
            db,
            action="auth.change_password",
            status="failure",
            req=req,
            actor_user=user,
            resource_type="user",
            resource_id=str(user.id),
            details={"reason": "same_password", "email": user.email},
        )
        raise HTTPException(status_code=400, detail="New password must be different from the current password.")

    user.password_hash = hash_password(new_password)
    db.add(user)
    db.commit()
    db.refresh(user)

    log_audit_event(
        db,
        action="auth.change_password",
        req=req,
        actor_user=user,
        resource_type="user",
        resource_id=str(user.id),
        details={"email": user.email},
    )

    return {
        "success": True,
        "message": "Password updated successfully.",
    }


@router.post("/logout")
def logout(
    req: Request,
    res: Response,
    user: User | None = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user is not None:
        log_audit_event(
            db,
            action="auth.logout",
            req=req,
            actor_user=user,
            resource_type="user",
            resource_id=str(user.id),
            details={"email": user.email},
        )
    clear_session_cookie(req, res)
    return {"success": True}
