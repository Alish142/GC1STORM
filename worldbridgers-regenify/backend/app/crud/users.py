from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email))


def create_or_update_user(
    db: Session,
    *,
    email: str,
    name: str,
    password_hash: str | None = None,
    role: str = "user",
) -> User:
    user = get_user_by_email(db, email)
    if user:
        user.name = name
        user.role = role
        if password_hash is not None:
            user.password_hash = password_hash
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    user = User(email=email, name=name, password_hash=password_hash, role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
