from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from fastapi import Request
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.user import User


def _get_client_ip(req: Request | None) -> str | None:
    if req is None:
        return None
    forwarded_for = req.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",", 1)[0].strip() or None
    if req.client and req.client.host:
        return req.client.host
    return None


def _clean_details(details: Mapping[str, Any] | None) -> dict[str, Any] | None:
    if not details:
        return None

    cleaned: dict[str, Any] = {}
    for key, value in details.items():
        if value is None or isinstance(value, (str, int, float, bool)):
            cleaned[key] = value
        else:
            cleaned[key] = str(value)
    return cleaned


def log_audit_event(
    db: Session,
    *,
    action: str,
    status: str = "success",
    req: Request | None = None,
    actor_user: User | None = None,
    actor_user_id: str | None = None,
    resource_type: str | None = None,
    resource_id: str | None = None,
    details: Mapping[str, Any] | None = None,
) -> AuditLog:
    record = AuditLog(
        actor_user_id=actor_user.id if actor_user is not None else actor_user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        status=status,
        ip_address=_get_client_ip(req),
        user_agent=req.headers.get("user-agent") if req is not None else None,
        details=_clean_details(details),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
