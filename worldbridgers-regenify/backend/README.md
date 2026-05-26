# FastAPI Backend

## What This Includes
- FastAPI app at `app/main.py`
- PostgreSQL connection (SQLAlchemy)
- Neo4j connection (official driver)
- Auth cookie endpoints (`/api/auth/*`)
- Data endpoints matching old backend behavior (`/api/data/*`)

## Quick Start
1. Start databases:
```bash
docker compose -f backend/docker-compose.yml up -d
```
2. Create env file:
```bash
cp backend/.env.example backend/.env
```
Set real values for:
- `REGENIFY_POSTGRES_USER`
- `REGENIFY_POSTGRES_PASSWORD`
- `REGENIFY_POSTGRES_DB`
- `REGENIFY_NEO4J_AUTH`
- `POSTGRES_DSN`
- `NEO4J_URI`
- `NEO4J_USER`
- `NEO4J_PASSWORD`
- `JWT_SECRET`
- `SESSION_MAX_AGE_HOURS`
- `REMEMBER_SESSION_DAYS`
- `PASSWORD_RESET_TOKEN_HOURS`
- `LOGIN_RATE_LIMIT_ATTEMPTS`
- `LOGIN_RATE_LIMIT_WINDOW_SECONDS`
- `REGISTER_RATE_LIMIT_ATTEMPTS`
- `REGISTER_RATE_LIMIT_WINDOW_SECONDS`
- `FORGOT_PASSWORD_RATE_LIMIT_ATTEMPTS`
- `FORGOT_PASSWORD_RATE_LIMIT_WINDOW_SECONDS`
- `PUBLIC_FORM_RATE_LIMIT_ATTEMPTS`
- `PUBLIC_FORM_RATE_LIMIT_WINDOW_SECONDS`
- `FRONTEND_BASE_URL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `SMTP_FROM_EMAIL`
- `SMTP_FROM_NAME`
- `SMTP_STARTTLS`
- `SMTP_USE_SSL`

The backend no longer falls back to insecure built-in database credentials or a default JWT secret.
If SMTP is configured, forgot-password will send a real reset email. In `development`, if SMTP is not configured, the backend returns a development reset link instead.
Login, registration, forgot-password, and public support/contact/call submission routes are rate-limited per client IP.
Sensitive auth, admin, and request-submission actions are also written to the `audit_logs` table for review.

3. Install deps:
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```
4. Run API:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Key Endpoints
- `GET /api/health`
- `GET /api/auth/me`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/logout`
- `GET /api/admin/audit-logs`
- `GET /api/data/issuers`
- `GET /api/data/offerings`
- `GET /api/data/indices`
- `GET /api/data/documents`
- `GET /api/data/graph`
- `GET /api/graph-db/primary-themes`
- `GET /api/integration/theme/{theme_id}`
