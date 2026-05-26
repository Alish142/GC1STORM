from collections import deque
from datetime import UTC, datetime, timedelta
from threading import Lock

from fastapi import HTTPException, Request, Response


_RATE_LIMIT_WINDOWS: dict[str, deque[datetime]] = {}
_RATE_LIMIT_LOCK = Lock()


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

    def dependency(req: Request, res: Response) -> None:
        now = datetime.now(UTC)
        cutoff = now - window
        client_ip = _get_client_ip(req)
        key = f"{scope}:{client_ip}"

        with _RATE_LIMIT_LOCK:
            attempts = _RATE_LIMIT_WINDOWS.setdefault(key, deque())
            while attempts and attempts[0] <= cutoff:
                attempts.popleft()

            if len(attempts) >= limit:
                retry_after = max(1, int((attempts[0] + window - now).total_seconds()))
                res.headers["Retry-After"] = str(retry_after)
                raise HTTPException(
                    status_code=429,
                    detail="Too many requests. Please try again later.",
                    headers={"Retry-After": str(retry_after)},
                )

            attempts.append(now)

    return dependency
