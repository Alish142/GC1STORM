from datetime import date, datetime
from uuid import UUID

from sqlalchemy import BigInteger, Date, DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True)
    issuer_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("issuers.id", ondelete="SET NULL"), nullable=True
    )
    type: Mapped[str] = mapped_column(Text)
    sub_type: Mapped[str | None] = mapped_column(Text, nullable=True)
    name: Mapped[str] = mapped_column(Text)
    document_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    file_size_bytes: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    file_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
