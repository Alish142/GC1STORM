from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel
from app.core.security import create_session_token, decode_session_token

COOKIE_NAME = "app_session_id"
DEMO_EMAIL = "demo@regenify.com"
DEMO_PASSWORD = "demo1234"
DEMO_ADMIN_EMAIL = "admin@regenify.com"
DEMO_ADMIN_PASSWORD = "admin1234"

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
    normalized_email = input_data.email.strip().lower()

    if normalized_email == DEMO_EMAIL and input_data.password == DEMO_PASSWORD:
        user_id = 0
        user_payload = {
            "id": user_id,
            "openId": "demo-regenify-user-9999",
            "email": DEMO_EMAIL,
            "name": "Demo User",
            "role": "user",
        }
    elif normalized_email == DEMO_ADMIN_EMAIL and input_data.password == DEMO_ADMIN_PASSWORD:
        user_id = 1
        user_payload = {
            "id": user_id,
            "openId": "demo-regenify-admin-0001",
            "email": DEMO_ADMIN_EMAIL,
            "name": "Demo Admin",
            "role": "admin",
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    # Keep demo auth independent from database availability so local demos
    # still work when Postgres is offline.
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
            "user": {
                "id": user_id,
                "name": user_payload["name"],
                "email": user_payload["email"],
                "role": user_payload["role"],
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
