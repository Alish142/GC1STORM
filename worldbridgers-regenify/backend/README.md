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
- `POST /api/auth/demo-login`
- `POST /api/auth/logout`
- `GET /api/data/issuers`
- `GET /api/data/offerings`
- `GET /api/data/indices`
- `GET /api/data/documents`
- `GET /api/data/graph`
- `GET /api/graph-db/sample`
- `POST /api/graph-db/seed-primary-themes`
- `GET /api/graph-db/primary-themes`
- `POST /api/integration/seed-all-themes`
- `GET /api/integration/theme/{theme_id}`

## Seed Primary Theme Nodes
Use this once Neo4j is running:

```bash
curl -X POST http://localhost:8000/api/graph-db/seed-primary-themes
```

Check inserted theme nodes:

```bash
curl http://localhost:8000/api/graph-db/primary-themes
```

Seed both SQL and Neo4j with shared `theme_id`:

```bash
curl -X POST http://localhost:8000/api/integration/seed-all-themes
```

Check linkage for one theme:

```bash
curl http://localhost:8000/api/integration/theme/entrepreneurship
```
