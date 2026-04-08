from datetime import datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy import DateTime, Numeric, Text, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class MarketIndex(Base):
    __tablename__ = "indices"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True)
    type: Mapped[str] = mapped_column(Text)
    name: Mapped[str] = mapped_column(Text)
    currency: Mapped[str] = mapped_column(Text)
    last: Mapped[Decimal | None] = mapped_column(Numeric(12, 4), nullable=True)
    change_percent: Mapped[Decimal | None] = mapped_column(Numeric(10, 4), nullable=True)
    change: Mapped[Decimal | None] = mapped_column(Numeric(12, 4), nullable=True)
    month_high: Mapped[Decimal | None] = mapped_column(Numeric(12, 4), nullable=True)
    month_low: Mapped[Decimal | None] = mapped_column(Numeric(12, 4), nullable=True)
    year_high: Mapped[Decimal | None] = mapped_column(Numeric(12, 4), nullable=True)
    year_low: Mapped[Decimal | None] = mapped_column(Numeric(12, 4), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
