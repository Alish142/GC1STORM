from datetime import UTC, datetime, timedelta

from fastapi import Depends, HTTPException, Request, Response
from sqlalchemy import delete, select, text
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.rate_limit_event import RateLimitEvent


def _get_client_ip(req: Request) -> str:
    forwarded_for = req.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",", 1)[0].strip() or "unknown"
    if req.client and req.client.host:
        return req.client.host
    return "unknown"


def rate_limit(*, scope: str, limit: int, window_seconds: int):
    if not scope.strip():
        raise ValueError("rate_limit requires a non-empty scope.")
    if limit <= 0:
        raise ValueError("rate_limit requires limit > 0.")
    if window_seconds <= 0:
        raise ValueError("rate_limit requires window_seconds > 0.")

    window = timedelta(seconds=window_seconds)

    def dependency(req: Request, res: Response, db: Session = Depends(get_db)) -> None:
        now = datetime.now(UTC)
        cutoff = now - window
        client_ip = _get_client_ip(req)
        key = f"{scope}:{client_ip}"

        try:
            # Serialize updates per scope/client across app instances.
            db.execute(
                text("SELECT pg_advisory_xact_lock(hashtext(:lock_key))"),
                {"lock_key": key},
            )
            db.execute(
                delete(RateLimitEvent).where(
                    RateLimitEvent.scope == scope,
                    RateLimitEvent.client_key == client_ip,
                    RateLimitEvent.created_at <= cutoff,
                )
            )
            attempts = db.scalars(
                select(RateLimitEvent)
                .where(
                    RateLimitEvent.scope == scope,
                    RateLimitEvent.client_key == client_ip,
                )
                .order_by(RateLimitEvent.created_at.asc())
            ).all()

            if len(attempts) >= limit:
                retry_after = max(1, int((attempts[0].created_at + window - now).total_seconds()))
                db.rollback()
                res.headers["Retry-After"] = str(retry_after)
                raise HTTPException(
                    status_code=429,
                    detail="Too many requests. Please try again later.",
                    headers={"Retry-After": str(retry_after)},
                )

            db.add(
                RateLimitEvent(
                    scope=scope,
                    client_key=client_ip,
                    created_at=now,
                )
            )
            db.commit()
        except HTTPException:
            raise
        except Exception:
            db.rollback()
            raise

    return dependency
