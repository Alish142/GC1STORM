from datetime import date
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Request, UploadFile
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps.auth import require_admin_user, require_csrf_token, require_role
from app.crud.visual_settings import get_visual_config, update_visual_config
from app.db import get_db
from app.models.audit_log import AuditLog
from app.models.document import Document
from app.models.document_member_state import DocumentMemberState
from app.models.issuer import Issuer
from app.models.user import User
from app.services.audit import log_audit_event
from app.services.s3_documents import resolve_document_url, s3_documents_enabled, upload_document_bytes

router = APIRouter(prefix="/admin", tags=["admin"])


class VisualConfigUpdate(BaseModel):
    table_dots: dict[str, str] = Field(default_factory=dict, alias="tableDots")
    hover_line_color: str | None = Field(default=None, alias="hoverLineColor")

    model_config = {
        "populate_by_name": True,
    }


def _parse_member_states(member_states: str | None) -> list[str]:
    if not member_states:
        return []
    values = []
    for value in member_states.split(","):
        cleaned = value.strip().upper()
        if cleaned:
            values.append(cleaned)
    return values


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


@router.post("/documents")
async def upload_document(
    req: Request,
    type: str = Form(...),
    file: UploadFile = File(...),
    name: str | None = Form(default=None),
    sub_type: str | None = Form(default=None),
    issuer_id: UUID | None = Form(default=None),
    document_date: date | None = Form(default=None),
    member_states: str | None = Form(default=None),
    user: User = Depends(require_admin_user),
    __: None = Depends(require_csrf_token),
    db: Session = Depends(get_db),
):
    if not s3_documents_enabled():
        raise HTTPException(status_code=503, detail="S3 document storage is not configured.")

    cleaned_type = type.strip()
    if not cleaned_type:
        raise HTTPException(status_code=400, detail="Document type is required.")
    filename = (file.filename or "").strip()
    if not filename:
        raise HTTPException(status_code=400, detail="A document file is required.")

    issuer: Issuer | None = None
    if issuer_id is not None:
        issuer = db.get(Issuer, issuer_id)
        if issuer is None:
            raise HTTPException(status_code=404, detail="Issuer not found.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded document is empty.")

    uploaded = upload_document_bytes(
        filename=filename,
        content=content,
        content_type=file.content_type,
    )

    document = Document(
        id=uuid4(),
        issuer_id=issuer.id if issuer is not None else None,
        type=cleaned_type,
        sub_type=sub_type.strip() if sub_type and sub_type.strip() else None,
        name=name.strip() if name and name.strip() else filename,
        document_date=document_date,
        file_size_bytes=uploaded.size_bytes,
        file_url=uploaded.storage_ref,
    )
    db.add(document)

    parsed_member_states = _parse_member_states(member_states)
    for country_code in parsed_member_states:
        db.add(
            DocumentMemberState(
                id=uuid4(),
                document_id=document.id,
                country_code=country_code,
            )
        )

    db.commit()
    db.refresh(document)

    log_audit_event(
        db,
        action="admin.document.uploaded",
        req=req,
        actor_user=user,
        resource_type="document",
        resource_id=str(document.id),
        details={
            "name": document.name,
            "issuerId": str(document.issuer_id) if document.issuer_id else None,
            "memberStates": ",".join(parsed_member_states),
            "storageRef": document.file_url,
        },
    )

    return {
        "success": True,
        "document": {
            "id": str(document.id),
            "type": document.type,
            "subType": document.sub_type or "",
            "name": document.name,
            "issuerId": str(document.issuer_id) if document.issuer_id else None,
            "issuer": issuer.name if issuer is not None else None,
            "memberStates": parsed_member_states,
            "date": document.document_date.isoformat() if document.document_date else "",
            "fileSize": document.file_size_bytes,
            "fileUrl": resolve_document_url(document.file_url),
            "storageRef": document.file_url,
        },
    }


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
