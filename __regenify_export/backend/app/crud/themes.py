from sqlalchemy import select
from sqlalchemy.orm import Session

from app.data.primary_themes import PRIMARY_THEMES
from app.models.theme import Theme


def get_theme_by_theme_id(db: Session, theme_id: str) -> Theme | None:
    return db.scalar(select(Theme).where(Theme.theme_id == theme_id))


def upsert_theme(
    db: Session,
    *,
    theme_id: str,
    name: str,
    curation: str,
    description: str,
) -> Theme:
    existing = get_theme_by_theme_id(db, theme_id)
    if existing:
        existing.name = name
        existing.curation = curation
        existing.description = description
        db.add(existing)
        db.commit()
        db.refresh(existing)
        return existing

    row = Theme(
        theme_id=theme_id,
        name=name,
        curation=curation,
        description=description,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def seed_sql_primary_themes(db: Session) -> int:
    count = 0
    for item in PRIMARY_THEMES:
        upsert_theme(
            db,
            theme_id=item["id"],
            name=item["name"],
            curation=item["curation"],
            description=item["description"],
        )
        count += 1
    return count

