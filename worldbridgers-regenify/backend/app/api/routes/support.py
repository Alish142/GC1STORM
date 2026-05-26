from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_user, require_admin_user
from app.db import get_db
from app.models.call_request import CallRequest
from app.models.contact_request import ContactRequest
from app.models.support_request import SupportRequest
from app.models.user import User

router = APIRouter(prefix="/support", tags=["support"])


class SupportRequestInput(BaseModel):
    full_name: str
    email: str
    topic: str
    message: str


class ContactRequestInput(BaseModel):
    full_name: str
    company_name: str | None = None
    email: str
    phone_number: str | None = None
    message: str


class CallRequestInput(BaseModel):
    full_name: str | None = None
    email: str | None = None
    organisation: str | None = None
    preferred_time: str | None = None
    notes: str


def _require_text(value: str, field_name: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise HTTPException(status_code=400, detail=f"{field_name} is required.")
    return cleaned


def _normalize_email(value: str, field_name: str) -> str:
    cleaned = value.strip().lower()
    if not cleaned or "@" not in cleaned or "." not in cleaned.split("@", 1)[-1]:
        raise HTTPException(status_code=400, detail=f"{field_name} must be a valid email address.")
    return cleaned


def _serialize_support_request(record: SupportRequest) -> dict[str, str]:
    return {
        "id": str(record.id),
        "fullName": record.full_name,
        "email": record.email,
        "topic": record.topic,
        "message": record.message,
        "status": record.status,
        "createdAt": record.created_at.isoformat(),
    }


def _serialize_contact_request(record: ContactRequest) -> dict[str, str | None]:
    return {
        "id": str(record.id),
        "fullName": record.full_name,
        "companyName": record.company_name,
        "email": record.email,
        "phoneNumber": record.phone_number,
        "message": record.message,
        "status": record.status,
        "createdAt": record.created_at.isoformat(),
    }


def _serialize_call_request(record: CallRequest) -> dict[str, str | None]:
    return {
        "id": str(record.id),
        "userId": str(record.user_id) if record.user_id else None,
        "fullName": record.full_name,
        "email": record.email,
        "organisation": record.organisation,
        "preferredTime": record.preferred_time,
        "notes": record.notes,
        "status": record.status,
        "createdAt": record.created_at.isoformat(),
    }


@router.post("/support-requests")
def create_support_request(
    payload: SupportRequestInput,
    db: Session = Depends(get_db),
):
    record = SupportRequest(
        full_name=_require_text(payload.full_name, "Full name"),
        email=_normalize_email(payload.email, "Email"),
        topic=_require_text(payload.topic, "Support topic"),
        message=_require_text(payload.message, "Message"),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return {
        "success": True,
        "requestId": str(record.id),
        "request": _serialize_support_request(record),
    }


@router.post("/contact-requests")
def create_contact_request(
    payload: ContactRequestInput,
    db: Session = Depends(get_db),
):
    record = ContactRequest(
        full_name=_require_text(payload.full_name, "Full name"),
        company_name=payload.company_name.strip() if payload.company_name and payload.company_name.strip() else None,
        email=_normalize_email(payload.email, "Email"),
        phone_number=payload.phone_number.strip() if payload.phone_number and payload.phone_number.strip() else None,
        message=_require_text(payload.message, "Message"),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return {
        "success": True,
        "requestId": str(record.id),
        "request": _serialize_contact_request(record),
    }


@router.post("/call-requests")
def create_call_request(
    payload: CallRequestInput,
    current_user: User | None = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    full_name = payload.full_name.strip() if payload.full_name and payload.full_name.strip() else None
    email = _normalize_email(payload.email, "Email") if payload.email else None

    if current_user is not None:
        full_name = full_name or current_user.name
        email = email or current_user.email

    record = CallRequest(
        user_id=current_user.id if current_user else None,
        full_name=full_name,
        email=email,
        organisation=payload.organisation.strip() if payload.organisation and payload.organisation.strip() else None,
        preferred_time=payload.preferred_time.strip() if payload.preferred_time and payload.preferred_time.strip() else None,
        notes=_require_text(payload.notes, "Notes"),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return {
        "success": True,
        "requestId": str(record.id),
        "request": _serialize_call_request(record),
    }


@router.get("/support-requests")
def list_support_requests(
    _: User = Depends(require_admin_user),
    db: Session = Depends(get_db),
):
    records = db.scalars(select(SupportRequest).order_by(SupportRequest.created_at.desc())).all()
    return {"data": [_serialize_support_request(record) for record in records]}


@router.get("/contact-requests")
def list_contact_requests(
    _: User = Depends(require_admin_user),
    db: Session = Depends(get_db),
):
    records = db.scalars(select(ContactRequest).order_by(ContactRequest.created_at.desc())).all()
    return {"data": [_serialize_contact_request(record) for record in records]}


@router.get("/call-requests")
def list_call_requests(
    _: User = Depends(require_admin_user),
    db: Session = Depends(get_db),
):
    records = db.scalars(select(CallRequest).order_by(CallRequest.created_at.desc())).all()
    return {"data": [_serialize_call_request(record) for record in records]}
