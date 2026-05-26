from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings
from app.core.security import hash_password
from app.models.base import Base
from app.models.user import User
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


def _ensure_auth_schema() -> None:
    with engine.begin() as connection:
        connection.execute(
            text("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)")
        )


def _bootstrap_admin() -> None:
    if not settings.bootstrap_admin_email or not settings.bootstrap_admin_password:
        return

    db = SessionLocal()
    try:
        normalized_email = settings.bootstrap_admin_email.strip().lower()
        user = db.query(User).filter(User.email == normalized_email).one_or_none()
        password_hash = hash_password(settings.bootstrap_admin_password)

        if user:
            user.name = settings.bootstrap_admin_name
            user.role = "admin"
            user.password_hash = password_hash
        else:
            user = User(
                email=normalized_email,
                name=settings.bootstrap_admin_name,
                role="admin",
                password_hash=password_hash,
            )
            db.add(user)

        db.commit()
    finally:
        db.close()


def init_postgres() -> None:
    try:
        Base.metadata.create_all(bind=engine)
        _ensure_auth_schema()
        _bootstrap_admin()
        with engine.connect() as connection:
            connection.execute(text("select 1"))
        print("[Database] Postgres connection OK")
    except Exception as exc:
        # Keep API running for demo mode even if SQL DB isn't reachable yet.
        print(f"[Database] Postgres init skipped: {exc}")
