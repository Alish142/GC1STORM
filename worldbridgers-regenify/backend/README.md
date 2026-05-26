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
- `POST /api/auth/logout`
- `GET /api/data/issuers`
- `GET /api/data/offerings`
- `GET /api/data/indices`
- `GET /api/data/documents`
- `GET /api/data/graph`
- `GET /api/graph-db/primary-themes`
- `GET /api/integration/theme/{theme_id}`
