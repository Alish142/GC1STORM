from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.crud.themes import get_theme_by_theme_id
from app.db import get_db
from app.db.neo4j import get_primary_themes

router = APIRouter(prefix="/integration", tags=["integration"])


@router.get("/theme/{theme_id}")
def get_theme_integration(theme_id: str, db: Session = Depends(get_db)):
    sql_theme = get_theme_by_theme_id(db, theme_id)
    neo_rows = get_primary_themes()
    neo_theme = next((row for row in neo_rows if row["id"] == theme_id), None)

    return {
        "status": "ok",
        "theme_id": theme_id,
        "sql": (
            {
                "id": sql_theme.id,
                "theme_id": sql_theme.theme_id,
                "name": sql_theme.name,
                "curation": sql_theme.curation,
                "description": sql_theme.description,
            }
            if sql_theme
            else None
        ),
        "neo4j": neo_theme,
        "linked": bool(sql_theme and neo_theme),
    }
