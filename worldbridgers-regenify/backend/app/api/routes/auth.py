from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel
from app.core.security import create_session_token, decode_session_token

COOKIE_NAME = "app_session_id"

router = APIRouter(prefix="/auth", tags=["auth"])


class DemoLoginInput(BaseModel):
    email: str
    password: str


def _cookie_secure(req: Request) -> bool:
    return req.url.scheme == "https"


@router.get("/me")
def me(req: Request):
    token = req.cookies.get(COOKIE_NAME)
    if not token:
        return None

    payload = decode_session_token(token)
    if not payload:
        return None

    return {
        "id": payload.get("id", 0),
        "openId": payload.get("openId", "demo-regenify-user-9999"),
        "email": payload.get("email"),
        "name": payload.get("name", "Demo User"),
        "role": payload.get("role", "user"),
    }


@router.post("/demo-login")
def demo_login(
    input_data: DemoLoginInput,
    req: Request,
    res: Response,
):
    valid = (
        (input_data.email == "demo@regenify.com" and input_data.password == "demo1234")
        or ("@" in input_data.email and len(input_data.password) >= 4)
    )
    if not valid:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    # Keep demo auth independent from database availability so local demos
    # still work when Postgres is offline.
    user_id = 0

    token = create_session_token(
        {
            "id": user_id,
            "openId": "demo-regenify-user-9999",
            "email": input_data.email,
            "name": "Demo User",
            "role": "user",
        }
    )
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
        "user": {
            "id": user_id,
            "name": "Demo User",
            "email": input_data.email,
            "role": "user",
        },
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
