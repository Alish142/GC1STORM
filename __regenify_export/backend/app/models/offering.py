from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, Text, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Offering(Base):
    __tablename__ = "offerings"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True)
    issuer_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("issuers.id", ondelete="CASCADE"))
    type: Mapped[str] = mapped_column(Text)
    segment: Mapped[str] = mapped_column(Text)
    isin: Mapped[str] = mapped_column(Text)
    name: Mapped[str] = mapped_column(Text)
    issued_amount: Mapped[Decimal | None] = mapped_column(Numeric(18, 2), nullable=True)
    currency: Mapped[str] = mapped_column(Text)
    listing_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    wbx_classification: Mapped[str | None] = mapped_column(Text, nullable=True)
    coupon: Mapped[Decimal | None] = mapped_column(Numeric(8, 4), nullable=True)
    last_price: Mapped[Decimal | None] = mapped_column(Numeric(12, 4), nullable=True)
    delisted: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
