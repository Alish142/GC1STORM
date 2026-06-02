from datetime import UTC, date, datetime
from decimal import Decimal
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Request, Response, UploadFile
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps.auth import require_admin_user, require_csrf_token, require_role
from app.crud.visual_settings import get_visual_config, update_visual_config
from app.db import get_db
from app.db.neo4j import (
    delete_index_node,
    delete_issuer_node,
    delete_offering_node,
    upsert_index_node,
    upsert_issuer_node,
    upsert_offering_node,
)
from app.models.audit_log import AuditLog
from app.models.document import Document
from app.models.document_member_state import DocumentMemberState
from app.models.issuer import Issuer
from app.models.market_index import MarketIndex
from app.models.offering import Offering
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


class IssuerPayload(BaseModel):
    name: str
    country: str
    region: str
    classification: str
    wbx_label: bool = Field(default=False, alias="wbxLabel")
    eu_taxonomy: bool = Field(default=False, alias="euTaxonomy")
    description: str | None = None
    founded_year: int | None = Field(default=None, alias="foundedYear")
    assets_amount: Decimal | None = Field(default=None, alias="assetsAmount")
    assets_currency: str | None = Field(default=None, alias="assetsCurrency")

    model_config = {
        "populate_by_name": True,
    }


class OfferingPayload(BaseModel):
    issuer_id: UUID = Field(alias="issuerId")
    type: str
    segment: str
    isin: str
    name: str
    issued_amount: Decimal | None = Field(default=None, alias="issuedAmount")
    currency: str
    listing_date: date | None = Field(default=None, alias="listingDate")
    wbx_classification: str | None = Field(default=None, alias="wbxClassification")
    coupon: Decimal | None = None
    last_price: Decimal | None = Field(default=None, alias="lastPrice")
    delisted: bool = False

    model_config = {
        "populate_by_name": True,
    }


class IndexPayload(BaseModel):
    type: str
    name: str
    currency: str
    last: Decimal | None = None
    change_percent: Decimal | None = Field(default=None, alias="changePercent")
    change: Decimal | None = None
    month_high: Decimal | None = Field(default=None, alias="monthHigh")
    month_low: Decimal | None = Field(default=None, alias="monthLow")
    year_high: Decimal | None = Field(default=None, alias="yearHigh")
    year_low: Decimal | None = Field(default=None, alias="yearLow")

    model_config = {
        "populate_by_name": True,
    }


def _clean_required_text(value: str, field_name: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise HTTPException(status_code=400, detail=f"{field_name} is required.")
    return cleaned


def _clean_optional_text(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


def _timestamp_now() -> datetime:
    return datetime.now(UTC)


def _serialize_issuer(row: Issuer) -> dict[str, object]:
    return {
        "id": str(row.id),
        "name": row.name,
        "country": row.country,
        "region": row.region,
        "classification": row.classification,
        "wbxLabel": row.wbx_label,
        "euTaxonomy": row.eu_taxonomy,
        "description": row.description or "",
        "foundedYear": row.founded_year,
        "assetsAmount": float(row.assets_amount) if row.assets_amount is not None else None,
        "assetsCurrency": row.assets_currency or "",
    }


def _serialize_offering(row: Offering, issuer_name: str | None = None) -> dict[str, object]:
    return {
        "id": str(row.id),
        "issuerId": str(row.issuer_id),
        "issuer": issuer_name,
        "type": row.type,
        "segment": row.segment,
        "isin": row.isin,
        "name": row.name,
        "issuedAmount": float(row.issued_amount) if row.issued_amount is not None else None,
        "currency": row.currency,
        "listingDate": row.listing_date.isoformat() if row.listing_date else "",
        "wbxClassification": row.wbx_classification or "",
        "coupon": float(row.coupon) if row.coupon is not None else None,
        "lastPrice": float(row.last_price) if row.last_price is not None else None,
        "delisted": row.delisted,
    }


def _serialize_index(row: MarketIndex) -> dict[str, object]:
    return {
        "id": str(row.id),
        "type": row.type,
        "name": row.name,
        "currency": row.currency,
        "last": float(row.last) if row.last is not None else None,
        "changePercent": float(row.change_percent) if row.change_percent is not None else None,
        "change": float(row.change) if row.change is not None else None,
        "monthHigh": float(row.month_high) if row.month_high is not None else None,
        "monthLow": float(row.month_low) if row.month_low is not None else None,
        "yearHigh": float(row.year_high) if row.year_high is not None else None,
        "yearLow": float(row.year_low) if row.year_low is not None else None,
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


@router.post("/issuers")
def create_issuer(
    req: Request,
    payload: IssuerPayload,
    user: User = Depends(require_admin_user),
    __: None = Depends(require_csrf_token),
    db: Session = Depends(get_db),
):
    issuer = Issuer(
        id=uuid4(),
        name=_clean_required_text(payload.name, "Issuer name"),
        country=_clean_required_text(payload.country, "Country"),
        region=_clean_required_text(payload.region, "Region"),
        classification=_clean_required_text(payload.classification, "Classification"),
        wbx_label=payload.wbx_label,
        eu_taxonomy=payload.eu_taxonomy,
        description=_clean_optional_text(payload.description),
        founded_year=payload.founded_year,
        assets_amount=payload.assets_amount,
        assets_currency=_clean_optional_text(payload.assets_currency),
    )
    db.add(issuer)
    db.commit()
    db.refresh(issuer)
    upsert_issuer_node(issuer)

    log_audit_event(
        db,
        action="admin.issuer.created",
        req=req,
        actor_user=user,
        resource_type="issuer",
        resource_id=str(issuer.id),
        details={"name": issuer.name},
    )
    return {"success": True, "issuer": _serialize_issuer(issuer)}


@router.patch("/issuers/{issuer_id}")
def update_issuer(
    issuer_id: UUID,
    req: Request,
    payload: IssuerPayload,
    user: User = Depends(require_admin_user),
    __: None = Depends(require_csrf_token),
    db: Session = Depends(get_db),
):
    issuer = db.get(Issuer, issuer_id)
    if issuer is None:
        raise HTTPException(status_code=404, detail="Issuer not found.")

    issuer.name = _clean_required_text(payload.name, "Issuer name")
    issuer.country = _clean_required_text(payload.country, "Country")
    issuer.region = _clean_required_text(payload.region, "Region")
    issuer.classification = _clean_required_text(payload.classification, "Classification")
    issuer.wbx_label = payload.wbx_label
    issuer.eu_taxonomy = payload.eu_taxonomy
    issuer.description = _clean_optional_text(payload.description)
    issuer.founded_year = payload.founded_year
    issuer.assets_amount = payload.assets_amount
    issuer.assets_currency = _clean_optional_text(payload.assets_currency)
    issuer.updated_at = _timestamp_now()
    db.add(issuer)
    db.commit()
    db.refresh(issuer)
    upsert_issuer_node(issuer)

    log_audit_event(
        db,
        action="admin.issuer.updated",
        req=req,
        actor_user=user,
        resource_type="issuer",
        resource_id=str(issuer.id),
        details={"name": issuer.name},
    )
    return {"success": True, "issuer": _serialize_issuer(issuer)}


@router.delete("/issuers/{issuer_id}", status_code=204)
def delete_issuer(
    issuer_id: UUID,
    req: Request,
    user: User = Depends(require_admin_user),
    __: None = Depends(require_csrf_token),
    db: Session = Depends(get_db),
):
    issuer = db.get(Issuer, issuer_id)
    if issuer is None:
        raise HTTPException(status_code=404, detail="Issuer not found.")

    issuer_name = issuer.name
    db.delete(issuer)
    db.commit()
    delete_issuer_node(str(issuer_id))
    log_audit_event(
        db,
        action="admin.issuer.deleted",
        req=req,
        actor_user=user,
        resource_type="issuer",
        resource_id=str(issuer_id),
        details={"name": issuer_name},
    )
    return Response(status_code=204)


@router.post("/offerings")
def create_offering(
    req: Request,
    payload: OfferingPayload,
    user: User = Depends(require_admin_user),
    __: None = Depends(require_csrf_token),
    db: Session = Depends(get_db),
):
    issuer = db.get(Issuer, payload.issuer_id)
    if issuer is None:
        raise HTTPException(status_code=404, detail="Issuer not found.")

    offering = Offering(
        id=uuid4(),
        issuer_id=payload.issuer_id,
        type=_clean_required_text(payload.type, "Offering type"),
        segment=_clean_required_text(payload.segment, "Segment"),
        isin=_clean_required_text(payload.isin, "ISIN"),
        name=_clean_required_text(payload.name, "Offering name"),
        issued_amount=payload.issued_amount,
        currency=_clean_required_text(payload.currency, "Currency"),
        listing_date=payload.listing_date,
        wbx_classification=_clean_optional_text(payload.wbx_classification),
        coupon=payload.coupon,
        last_price=payload.last_price,
        delisted=payload.delisted,
    )
    db.add(offering)
    db.commit()
    db.refresh(offering)
    upsert_offering_node(offering, issuer=issuer)

    log_audit_event(
        db,
        action="admin.offering.created",
        req=req,
        actor_user=user,
        resource_type="offering",
        resource_id=str(offering.id),
        details={"name": offering.name, "issuerId": str(offering.issuer_id)},
    )
    return {"success": True, "offering": _serialize_offering(offering, issuer.name)}


@router.patch("/offerings/{offering_id}")
def update_offering(
    offering_id: UUID,
    req: Request,
    payload: OfferingPayload,
    user: User = Depends(require_admin_user),
    __: None = Depends(require_csrf_token),
    db: Session = Depends(get_db),
):
    offering = db.get(Offering, offering_id)
    if offering is None:
        raise HTTPException(status_code=404, detail="Offering not found.")
    issuer = db.get(Issuer, payload.issuer_id)
    if issuer is None:
        raise HTTPException(status_code=404, detail="Issuer not found.")

    offering.issuer_id = payload.issuer_id
    offering.type = _clean_required_text(payload.type, "Offering type")
    offering.segment = _clean_required_text(payload.segment, "Segment")
    offering.isin = _clean_required_text(payload.isin, "ISIN")
    offering.name = _clean_required_text(payload.name, "Offering name")
    offering.issued_amount = payload.issued_amount
    offering.currency = _clean_required_text(payload.currency, "Currency")
    offering.listing_date = payload.listing_date
    offering.wbx_classification = _clean_optional_text(payload.wbx_classification)
    offering.coupon = payload.coupon
    offering.last_price = payload.last_price
    offering.delisted = payload.delisted
    offering.updated_at = _timestamp_now()
    db.add(offering)
    db.commit()
    db.refresh(offering)
    upsert_offering_node(offering, issuer=issuer)

    log_audit_event(
        db,
        action="admin.offering.updated",
        req=req,
        actor_user=user,
        resource_type="offering",
        resource_id=str(offering.id),
        details={"name": offering.name, "issuerId": str(offering.issuer_id)},
    )
    return {"success": True, "offering": _serialize_offering(offering, issuer.name)}


@router.delete("/offerings/{offering_id}", status_code=204)
def delete_offering(
    offering_id: UUID,
    req: Request,
    user: User = Depends(require_admin_user),
    __: None = Depends(require_csrf_token),
    db: Session = Depends(get_db),
):
    offering = db.get(Offering, offering_id)
    if offering is None:
        raise HTTPException(status_code=404, detail="Offering not found.")

    offering_name = offering.name
    db.delete(offering)
    db.commit()
    delete_offering_node(str(offering_id))
    log_audit_event(
        db,
        action="admin.offering.deleted",
        req=req,
        actor_user=user,
        resource_type="offering",
        resource_id=str(offering_id),
        details={"name": offering_name},
    )
    return Response(status_code=204)


@router.post("/indices")
def create_index(
    req: Request,
    payload: IndexPayload,
    user: User = Depends(require_admin_user),
    __: None = Depends(require_csrf_token),
    db: Session = Depends(get_db),
):
    index = MarketIndex(
        id=uuid4(),
        type=_clean_required_text(payload.type, "Index type"),
        name=_clean_required_text(payload.name, "Index name"),
        currency=_clean_required_text(payload.currency, "Currency"),
        last=payload.last,
        change_percent=payload.change_percent,
        change=payload.change,
        month_high=payload.month_high,
        month_low=payload.month_low,
        year_high=payload.year_high,
        year_low=payload.year_low,
    )
    db.add(index)
    db.commit()
    db.refresh(index)
    upsert_index_node(index)

    log_audit_event(
        db,
        action="admin.index.created",
        req=req,
        actor_user=user,
        resource_type="index",
        resource_id=str(index.id),
        details={"name": index.name},
    )
    return {"success": True, "index": _serialize_index(index)}


@router.patch("/indices/{index_id}")
def update_index(
    index_id: UUID,
    req: Request,
    payload: IndexPayload,
    user: User = Depends(require_admin_user),
    __: None = Depends(require_csrf_token),
    db: Session = Depends(get_db),
):
    index = db.get(MarketIndex, index_id)
    if index is None:
        raise HTTPException(status_code=404, detail="Index not found.")

    index.type = _clean_required_text(payload.type, "Index type")
    index.name = _clean_required_text(payload.name, "Index name")
    index.currency = _clean_required_text(payload.currency, "Currency")
    index.last = payload.last
    index.change_percent = payload.change_percent
    index.change = payload.change
    index.month_high = payload.month_high
    index.month_low = payload.month_low
    index.year_high = payload.year_high
    index.year_low = payload.year_low
    index.updated_at = _timestamp_now()
    db.add(index)
    db.commit()
    db.refresh(index)
    upsert_index_node(index)

    log_audit_event(
        db,
        action="admin.index.updated",
        req=req,
        actor_user=user,
        resource_type="index",
        resource_id=str(index.id),
        details={"name": index.name},
    )
    return {"success": True, "index": _serialize_index(index)}


@router.delete("/indices/{index_id}", status_code=204)
def delete_index(
    index_id: UUID,
    req: Request,
    user: User = Depends(require_admin_user),
    __: None = Depends(require_csrf_token),
    db: Session = Depends(get_db),
):
    index = db.get(MarketIndex, index_id)
    if index is None:
        raise HTTPException(status_code=404, detail="Index not found.")

    index_name = index.name
    db.delete(index)
    db.commit()
    delete_index_node(str(index_id))
    log_audit_event(
        db,
        action="admin.index.deleted",
        req=req,
        actor_user=user,
        resource_type="index",
        resource_id=str(index_id),
        details={"name": index_name},
    )
    return Response(status_code=204)


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
