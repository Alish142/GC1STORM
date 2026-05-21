from datetime import datetime

from sqlalchemy import DateTime, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class VisualSetting(Base):
    __tablename__ = "visual_settings"
    __table_args__ = (UniqueConstraint("scope", "target_key", name="uq_visual_settings_scope_target"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    scope: Mapped[str] = mapped_column(String(64), index=True)
    target_key: Mapped[str] = mapped_column(String(128), index=True)
    color: Mapped[str] = mapped_column(String(32))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
