from fastapi import APIRouter, Depends, Query, Request
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps.auth import require_admin_user, require_csrf_token, require_role
from app.crud.visual_settings import get_visual_config, update_visual_config
from app.db import get_db
from app.models.audit_log import AuditLog
from app.models.user import User
from app.services.audit import log_audit_event

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
    req: Request,
    payload: VisualConfigUpdate,
    user: User = Depends(require_admin_user),
    __: None = Depends(require_csrf_token),
    db: Session = Depends(get_db),
):
    next_config = update_visual_config(
        db,
        table_dots=payload.table_dots,
        hover_line_color=payload.hover_line_color,
    )
    log_audit_event(
        db,
        action="admin.visual_config.updated",
        req=req,
        actor_user=user,
        resource_type="visual_config",
        resource_id="global",
        details={
            "tableDotKeys": ",".join(sorted(payload.table_dots.keys())),
            "hoverLineColor": payload.hover_line_color,
        },
    )
    return next_config


@router.get("/audit-logs")
def list_audit_logs(
    limit: int = Query(default=100, ge=1, le=500),
    _: User = Depends(require_admin_user),
    db: Session = Depends(get_db),
):
    records = db.scalars(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit)).all()
    return {
        "data": [
            {
                "id": str(record.id),
                "actorUserId": str(record.actor_user_id) if record.actor_user_id else None,
                "action": record.action,
                "resourceType": record.resource_type,
                "resourceId": record.resource_id,
                "status": record.status,
                "ipAddress": record.ip_address,
                "userAgent": record.user_agent,
                "details": record.details,
                "createdAt": record.created_at.isoformat(),
            }
            for record in records
        ]
    }


@router.get("/role-check")
def admin_or_editor_role_check(
    user: User = Depends(require_role("admin", "editor")),
):
    return {
        "ok": True,
        "role": user.role,
    }
