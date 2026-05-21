from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email))


def create_or_update_user(db: Session, *, email: str, name: str) -> User:
    user = get_user_by_email(db, email)
    if user:
        user.name = name
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    user = User(email=email, name=name, role="user")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

