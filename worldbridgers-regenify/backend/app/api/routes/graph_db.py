from fastapi import APIRouter, HTTPException

from app.db.neo4j import get_primary_themes

router = APIRouter(prefix="/graph-db", tags=["graph-db"])


@router.get("/primary-themes")
def list_primary_themes():
    try:
        themes = get_primary_themes()
        return {"status": "ok", "count": len(themes), "data": themes}
    except Exception as error:
        raise HTTPException(status_code=503, detail="Graph database is unavailable.") from error
