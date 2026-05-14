from collections.abc import Mapping

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.visual_setting import VisualSetting

DEFAULT_TABLE_DOT_COLORS: dict[str, str] = {
    "issuerName": "#22c55e",
    "wbxLabel": "#f59e0b",
    "issuer": "#3b82f6",
}

DEFAULT_GRAPH_EDGE_COLORS: dict[str, str] = {
    "FUNDS": "#22c55e",
    "DEVELOPS": "#3b82f6",
    "MANAGES": "#8b5cf6",
    "INVESTS_IN": "#f59e0b",
    "INCLUDES": "#14b8a6",
    "LISTED_ON": "#f43f5e",
}


def _load_scope(db: Session, scope: str) -> dict[str, str]:
    rows = db.scalars(select(VisualSetting).where(VisualSetting.scope == scope)).all()
    return {row.target_key: row.color for row in rows}


def get_visual_config(db: Session) -> dict[str, dict[str, str]]:
    table_dots = {**DEFAULT_TABLE_DOT_COLORS, **_load_scope(db, "table_dot")}
    graph_edges = {**DEFAULT_GRAPH_EDGE_COLORS, **_load_scope(db, "graph_edge")}
    return {
        "tableDots": table_dots,
        "graphEdges": graph_edges,
    }


def update_visual_config(
    db: Session,
    *,
    table_dots: Mapping[str, str] | None = None,
    graph_edges: Mapping[str, str] | None = None,
) -> dict[str, dict[str, str]]:
    updates_by_scope = {
        "table_dot": table_dots or {},
        "graph_edge": graph_edges or {},
    }

    for scope, updates in updates_by_scope.items():
        for target_key, color in updates.items():
            existing = db.scalar(
                select(VisualSetting).where(
                    VisualSetting.scope == scope,
                    VisualSetting.target_key == target_key,
                )
            )
            if existing:
                existing.color = color
            else:
                db.add(VisualSetting(scope=scope, target_key=target_key, color=color))

    db.commit()
    return get_visual_config(db)
