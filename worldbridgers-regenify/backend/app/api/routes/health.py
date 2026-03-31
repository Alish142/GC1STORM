from fastapi import APIRouter

from app.db import verify_neo4j

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/neo4j")
def neo4j_health() -> dict[str, bool]:
    return {"connected": verify_neo4j()}

