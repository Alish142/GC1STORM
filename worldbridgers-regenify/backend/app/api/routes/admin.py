from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.deps.auth import require_admin_user
from app.crud.visual_settings import get_visual_config, update_visual_config
from app.db import get_db
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])


class VisualConfigUpdate(BaseModel):
    table_dots: dict[str, str] = Field(default_factory=dict, alias="tableDots")
    hover_line_color: str | None = Field(default=None, alias="hoverLineColor")

    model_config = {
        "populate_by_name": True,
    }


@router.get("/visual-config")
def admin_visual_config(
    _: User = Depends(require_admin_user),
    db: Session = Depends(get_db),
):
    return get_visual_config(db)


@router.patch("/visual-config")
def patch_visual_config(
    payload: VisualConfigUpdate,
    _: User = Depends(require_admin_user),
    db: Session = Depends(get_db),
):
    return update_visual_config(
        db,
        table_dots=payload.table_dots,
        hover_line_color=payload.hover_line_color,
    )
