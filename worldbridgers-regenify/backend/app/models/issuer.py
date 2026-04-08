from datetime import datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy import Boolean, DateTime, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Issuer(Base):
    __tablename__ = "issuers"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True)
    name: Mapped[str] = mapped_column(Text)
    country: Mapped[str] = mapped_column(Text)
    region: Mapped[str] = mapped_column(Text)
    classification: Mapped[str] = mapped_column(Text)
    wbx_label: Mapped[bool] = mapped_column(Boolean, default=False)
    eu_taxonomy: Mapped[bool] = mapped_column(Boolean, default=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    founded_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    assets_amount: Mapped[Decimal | None] = mapped_column(Numeric(18, 2), nullable=True)
    assets_currency: Mapped[str | None] = mapped_column(String(16), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
