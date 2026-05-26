from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import (
    create_session_token,
    decode_session_token,
    hash_password,
    verify_password,
)
from app.crud.users import create_or_update_user, get_user_by_email
from app.db import get_db
from app.models.user import User

COOKIE_NAME = "app_session_id"

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginInput(BaseModel):
    email: str
    password: str


class RegisterInput(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    date_of_birth: str | None = None


def _cookie_secure(req: Request) -> bool:
    return req.url.scheme == "https"


def _serialize_user(user: User) -> dict:
    return {
        "id": user.id,
        "openId": f"user-{user.id}",
        "email": user.email,
        "name": user.name,
        "role": user.role,
    }


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

    user = db.get(User, user_id)
    if user is None:
        return None

    return _serialize_user(user)


@router.get("/me")
def me(req: Request, db: Session = Depends(get_db)):
    payload = _cookie_user_payload(req, db)
    if not payload:
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
    token = create_session_token(user_payload)
    secure = _cookie_secure(req)
    res.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="none" if secure else "lax",
        secure=secure,
        max_age=7 * 24 * 60 * 60,
        path="/",
    )
    return {
        "success": True,
        "user": user_payload,
    }


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
    token = create_session_token(user_payload)
    secure = _cookie_secure(req)
    res.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="none" if secure else "lax",
        secure=secure,
        max_age=7 * 24 * 60 * 60,
        path="/",
    )
    return {
        "success": True,
        "user": user_payload,
    }


@router.post("/logout")
def logout(req: Request, res: Response):
    secure = _cookie_secure(req)
    res.delete_cookie(
        key=COOKIE_NAME,
        httponly=True,
        samesite="none" if secure else "lax",
        secure=secure,
        path="/",
    )
    return {"success": True}
