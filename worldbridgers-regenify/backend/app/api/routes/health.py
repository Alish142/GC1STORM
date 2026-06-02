from fastapi import APIRouter

from app.db.postgres import postgres_health

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
def health() -> dict[str, object]:
    database = postgres_health()
    status = "ok" if database["status"] == "ok" else "degraded"
    return {
        "status": status,
        "database": database,
    }
