from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db import get_db, verify_neo4j

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/neo4j")
def neo4j_health() -> dict[str, bool]:
    return {"connected": verify_neo4j()}


@router.get("/postgres")
def postgres_health(db: Session = Depends(get_db)) -> dict[str, object]:
    db.execute(text("select 1"))

    table_counts = {
        "issuers": db.execute(text("select count(*) from issuers")).scalar_one(),
        "offerings": db.execute(text("select count(*) from offerings")).scalar_one(),
        "indices": db.execute(text("select count(*) from indices")).scalar_one(),
        "documents": db.execute(text("select count(*) from documents")).scalar_one(),
    }

    return {"connected": True, "tableCounts": table_counts}
