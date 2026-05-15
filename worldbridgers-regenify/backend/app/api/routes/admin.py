from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.routes.auth import COOKIE_NAME
from app.core.security import decode_session_token
from app.crud.visual_settings import get_visual_config, update_visual_config
from app.db import get_db

router = APIRouter(prefix="/admin", tags=["admin"])


class VisualConfigUpdate(BaseModel):
    hover_line_color: str | None = Field(default=None, alias="hoverLineColor")

    model_config = {
        "populate_by_name": True,
    }


def _require_admin(req: Request) -> dict:
    token = req.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required.")

    payload = decode_session_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid session.")

    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")

    return payload


@router.get("/visual-config")
def admin_visual_config(
    _: dict = Depends(_require_admin),
    db: Session = Depends(get_db),
):
    return get_visual_config(db)


@router.patch("/visual-config")
def patch_visual_config(
    payload: VisualConfigUpdate,
    _: dict = Depends(_require_admin),
    db: Session = Depends(get_db),
):
    return update_visual_config(
        db,
        hover_line_color=payload.hover_line_color,
    )
