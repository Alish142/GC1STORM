from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.visual_setting import VisualSetting

DEFAULT_TABLE_DOT_COLORS: dict[str, str] = {
    "issuerName": "#22c55e",
    "wbxLabel": "#f59e0b",
    "offeringIssuer": "#3b82f6",
    "documentIssuer": "#3b82f6",
    "offeringType": "#f59e0b",
    "indexType": "#8b5cf6",
    "documentType": "#f43f5e",
}

DEFAULT_HOVER_LINE_COLOR = "#111111"


def _load_scope(db: Session, scope: str) -> dict[str, str]:
    rows = db.scalars(select(VisualSetting).where(VisualSetting.scope == scope)).all()
    return {row.target_key: row.color for row in rows}


def get_visual_config(db: Session) -> dict[str, object]:
    table_dots = {**DEFAULT_TABLE_DOT_COLORS, **_load_scope(db, "table_dot")}
    hover_line = _load_scope(db, "graph_hover").get("line", DEFAULT_HOVER_LINE_COLOR)
    return {
        "tableDots": table_dots,
        "hoverLineColor": hover_line,
    }


def update_visual_config(
    db: Session,
    *,
    table_dots: dict[str, str] | None = None,
    hover_line_color: str | None = None,
) -> dict[str, object]:
    for target_key, color in (table_dots or {}).items():
        existing = db.scalar(
            select(VisualSetting).where(
                VisualSetting.scope == "table_dot",
                VisualSetting.target_key == target_key,
            )
        )
        if existing:
            existing.color = color
        else:
            db.add(VisualSetting(scope="table_dot", target_key=target_key, color=color))

    if hover_line_color is not None:
        existing = db.scalar(
            select(VisualSetting).where(
                VisualSetting.scope == "graph_hover",
                VisualSetting.target_key == "line",
            )
        )
        if existing:
            existing.color = hover_line_color
        else:
            db.add(VisualSetting(scope="graph_hover", target_key="line", color=hover_line_color))

    db.commit()
    return get_visual_config(db)
