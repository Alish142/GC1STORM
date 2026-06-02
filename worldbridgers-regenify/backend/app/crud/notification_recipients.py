from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.notification_recipient import NotificationRecipient


def list_notification_recipients(db: Session) -> list[str]:
    rows = db.scalars(select(NotificationRecipient).order_by(NotificationRecipient.created_at.asc())).all()
    return [r.email for r in rows]


def replace_notification_recipients(db: Session, recipients: list[str]) -> list[str]:
    # Delete existing entries
    existing = db.scalars(select(NotificationRecipient)).all()
    for r in existing:
        db.delete(r)
    # Insert new
    for email in recipients:
        cleaned = email.strip()
        if not cleaned:
            continue
        db.add(NotificationRecipient(email=cleaned))
    db.commit()
    return list_notification_recipients(db)
