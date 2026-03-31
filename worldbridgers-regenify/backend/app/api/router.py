from fastapi import APIRouter

from app.api.routes.auth import router as auth_router
from app.api.routes.data import router as data_router
from app.api.routes.graph_db import router as graph_db_router
from app.api.routes.health import router as health_router
from app.api.routes.integration import router as integration_router

api_router = APIRouter(prefix="/api")
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(data_router)
api_router.include_router(graph_db_router)
api_router.include_router(integration_router)
