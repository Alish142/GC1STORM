from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings
from app.models.base import Base
import app.models  # noqa: F401

settings = get_settings()


def _normalize_postgres_dsn(dsn: str) -> str:
    if dsn.startswith("postgres://"):
        return dsn.replace("postgres://", "postgresql+psycopg://", 1)
    if dsn.startswith("postgresql://") and "+psycopg" not in dsn:
        return dsn.replace("postgresql://", "postgresql+psycopg://", 1)
    return dsn


engine = create_engine(_normalize_postgres_dsn(settings.postgres_dsn), pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_postgres() -> None:
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as exc:
        # Keep API running for demo mode even if SQL DB isn't reachable yet.
        print(f"[Database] Postgres init skipped: {exc}")
