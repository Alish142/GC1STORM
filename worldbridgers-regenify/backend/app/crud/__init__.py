"""CRUD modules."""
from app.crud.visual_settings import (
    DEFAULT_GRAPH_EDGE_COLORS,
    DEFAULT_TABLE_DOT_COLORS,
    get_visual_config,
    update_visual_config,
)

__all__ = [
    "DEFAULT_GRAPH_EDGE_COLORS",
    "DEFAULT_TABLE_DOT_COLORS",
    "get_visual_config",
    "update_visual_config",
]
