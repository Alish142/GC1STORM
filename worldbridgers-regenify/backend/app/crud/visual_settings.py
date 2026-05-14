from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.visual_setting import VisualSetting

DEFAULT_HOVER_LINE_COLOR = "#111111"


def _load_scope(db: Session, scope: str) -> dict[str, str]:
    rows = db.scalars(select(VisualSetting).where(VisualSetting.scope == scope)).all()
    return {row.target_key: row.color for row in rows}


def get_visual_config(db: Session) -> dict[str, str]:
    hover_line = _load_scope(db, "graph_hover").get("line", DEFAULT_HOVER_LINE_COLOR)
    return {"hoverLineColor": hover_line}


def update_visual_config(
    db: Session,
    *,
    hover_line_color: str | None = None,
) -> dict[str, str]:
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
