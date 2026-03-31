from fastapi import APIRouter

from app.db import driver
from app.db.neo4j import get_primary_themes, seed_primary_themes

router = APIRouter(prefix="/graph-db", tags=["graph-db"])


@router.get("/sample")
def sample_graph_query():
    query = "RETURN 'neo4j-ok' AS status"
    try:
        with driver.session() as session:
            record = session.run(query).single()
            return {"status": record["status"] if record else "unknown"}
    except Exception as error:
        return {"status": "error", "detail": str(error)}


@router.post("/seed-primary-themes")
def seed_themes():
    try:
        stats = seed_primary_themes()
        return {"status": "ok", **stats}
    except Exception as error:
        return {"status": "error", "detail": str(error)}


@router.get("/primary-themes")
def list_primary_themes():
    try:
        themes = get_primary_themes()
        return {"status": "ok", "count": len(themes), "data": themes}
    except Exception as error:
        return {"status": "error", "detail": str(error)}
