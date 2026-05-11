# Troubleshooting Guide

Common issues and solutions for local development and production deployments.

---

## 1. Backend Does Not Start

### Symptoms
- FastAPI fails to initialize
- `ERROR: Application startup failed`
- Port binding errors

### Solutions

**Check Python environment:**
```bash
# Activate virtual environment
cd backend
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # macOS/Linux

# Verify Python
python --version

# Reinstall dependencies
pip install -r requirements.txt
```

**Check port availability:**
```bash
# Windows
netstat -ano | findstr :8000

# macOS/Linux
lsof -i :8000
```

**View full error logs:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Common causes:**
- Database connection fails (see "Supabase connection fails")
- Neo4j unavailable (see "Neo4j is unavailable")
- Missing dependencies: `pip install -r requirements.txt`
- Invalid `JWT_SECRET` environment variable

---

## 2. Supabase Connection Fails

### Symptoms
- `psycopg: connection failed`
- `could not translate host name`
- `FATAL: password authentication failed`
- 502 Bad Gateway on backend API calls

### Solutions

**Verify PostgreSQL is running locally:**
```bash
# Check if docker container is running
docker compose -f backend/docker-compose.yml ps

# Start containers if stopped
docker compose -f backend/docker-compose.yml up -d

# Verify connection
psql postgresql://postgres:postgres@localhost:5432/regenify
```

**Validate environment variable format:**
```bash
# Backend should have POSTGRES_DSN set
# Format: postgresql+psycopg://user:password@host:port/database
# DO NOT use postgresql:// (missing the +psycopg driver)

# Check your .env file
cat backend/.env
```

**For production (Render/Supabase):**
1. Copy the full connection string from Supabase dashboard
2. In Render environment variables, paste as `POSTGRES_DSN`
3. Format check: `postgresql+psycopg://` prefix required
4. Verify credentials include user, password, host, port, database name
5. Test connection string manually if possible

**If using local PostgreSQL:**
- Ensure port 5432 is accessible
- Default credentials: `postgres:postgres`
- Database name: `regenify`

---

## 3. POSTGRES_DSN Is Wrong

### Symptoms
- Backend starts but database queries fail
- `could not connect to server`
- Auth endpoints return 500 Internal Server Error

### Verify Format
Correct format for `POSTGRES_DSN`:
```
postgresql+psycopg://username:password@host:port/database
```

Common mistakes:
```bash
# ❌ WRONG - missing driver
postgresql://postgres:password@localhost:5432/regenify

# ❌ WRONG - missing port
postgresql+psycopg://postgres:password@localhost/regenify

# ✓ CORRECT
postgresql+psycopg://postgres:password@localhost:5432/regenify

# ✓ CORRECT - Supabase format
postgresql+psycopg://postgres.xxxxx:password@db.xxxxx.supabase.co:5432/postgres
```

**Debug steps:**
1. Check [backend/app/core/config.py](backend/app/core/config.py) - shows default format
2. Print the DSN value:
```python
from app.core.config import get_settings
settings = get_settings()
print(settings.postgres_dsn)
```
3. Test connection string with `psql`:
```bash
psql "postgresql://user:password@host:5432/database"
```

---

## 4. CORS Error Between Frontend and Backend

### Symptoms
- Browser console shows: `Access to XMLHttpRequest blocked by CORS policy`
- `No 'Access-Control-Allow-Origin' header`
- Requests sent with `Origin` header are rejected

### Solutions

**1. Add frontend URL to backend CORS:**

Backend uses `CORS_ORIGINS` environment variable (comma-separated).

**Locally:**
```bash
# backend/.env
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

**Production (Render):**
1. Go to Render environment variables
2. Set `CORS_ORIGINS` to include your Cloudflare Pages URL:
   ```
   https://regenify-demo.pages.dev
   ```
3. Redeploy the backend

**2. Verify frontend is sending correct Origin:**
```javascript
// browser DevTools - Network tab
// Check "Origin" header on request
// Should match one in CORS_ORIGINS list
```

**3. Check if credentials are needed:**
```javascript
// If requests include cookies/auth:
fetch(url, {
  credentials: 'include',  // Must be set
  headers: {
    'Content-Type': 'application/json'
  }
})
```

**4. Backend config check:**
In [render.yaml](render.yaml), `CORSMiddleware` is configured with:
- `allow_origins` from `CORS_ORIGINS` env var
- `allow_credentials: True`
- `allow_methods: ["*"]`
- `allow_headers: ["*"]`

---

## 5. Frontend Shows Fallback Data Instead of Real Backend Data

### Symptoms
- Dashboard displays mock/hardcoded data
- Backend API requests fail silently
- "No real data" appears on screen

### Solutions

**1. Check backend is running:**
```bash
# Health check endpoint
curl http://localhost:8000/api/health
# Should return: {"status":"ok"}
```

**2. Verify frontend backend URL:**

Check [client/src/lib/backendApi.ts](client/src/lib/backendApi.ts):
```typescript
// Should point to backend URL
const BACKEND_URL = process.env.VITE_BACKEND_API_BASE_URL || 'http://localhost:8000'
```

**Locally:**
- Frontend runs on: `http://localhost:5173`
- Backend runs on: `http://localhost:8000`
- Default `VITE_BACKEND_API_BASE_URL` should already point to 8000

**Production (Cloudflare Pages):**
- Set `VITE_BACKEND_API_BASE_URL=https://<your-render-app>.onrender.com`
- Verify no trailing slash

**3. Check browser network tab:**
- Are API requests being sent?
- What's the response status? (200, 404, 500, etc.)
- Check response body for error messages

**4. Check frontend fallback logic:**

In [client/src/lib/frontendFallbackData.ts](client/src/lib/frontendFallbackData.ts), if API fails, mock data is returned. This is intentional but indicates backend failure.

**5. Run frontend dev server properly:**
```bash
cd worldbridgers-regenify
pnpm dev
# Should start on http://localhost:5173
# And try to connect to http://localhost:8000
```

---

## 6. Neo4j Is Unavailable

### Symptoms
- Graph endpoints return errors
- `Could not connect to 'localhost:7687'`
- Seed endpoints fail (`/api/graph-db/seed-primary-themes`)

### Solutions

**Start Neo4j locally:**
```bash
docker compose -f backend/docker-compose.yml up -d neo4j
# Or start all services
docker compose -f backend/docker-compose.yml up -d
```

**Verify Neo4j is running:**
```bash
# Check container
docker ps | grep neo4j

# Access Neo4j browser (local)
# http://localhost:7474
# Username: neo4j
# Password: See docker-compose.yml
```

**Check Neo4j connection in backend config:**
[backend/app/core/config.py](backend/app/core/config.py) default values:
```python
neo4j_uri: str = "bolt://localhost:7687"
neo4j_user: str = "neo4j"
neo4j_password: str = "password123"
```

**Override via environment variables:**
```bash
# backend/.env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password123
```

**Production (Neo4j Aura):**
1. Create Neo4j Aura Free instance
2. Copy connection string (format: `neo4j+s://...`)
3. In Render environment variables, set:
   - `NEO4J_URI=neo4j+s://xxxx`
   - `NEO4J_USER=neo4j`
   - `NEO4J_PASSWORD=<your-password>`
4. Redeploy backend
5. Seed data: `POST https://<render-app>.onrender.com/api/graph-db/seed-primary-themes`

**Debug Neo4j connection:**
```bash
# Test connection from backend
cd backend
python -c "
from app.db.neo4j import init_neo4j, close_neo4j
init_neo4j()
# If no error, connection works
close_neo4j()
"
```

---

## 7. Seed SQL Causes Duplicate Data

### Symptoms
- Running seed endpoints multiple times creates duplicates
- Dashboard shows repeated entries
- `ERROR: duplicate key value`

### Solutions

**1. Seed endpoints are designed to be idempotent:**

- `POST /api/graph-db/seed-primary-themes` - Seeds Neo4j themes (should check for existing)
- `POST /api/integration/seed-all-themes` - Seeds both SQL and Neo4j

**2. If duplicates exist, clean database:**

**For PostgreSQL:**
```bash
# Connect to database
psql postgresql://postgres:postgres@localhost:5432/regenify

# Clear tables before reseeding
DELETE FROM themes;
DELETE FROM issuers;
DELETE FROM offerings;
```

**For Neo4j:**
```bash
# Via Neo4j browser (http://localhost:7474) or CLI
MATCH (n) DETACH DELETE n;  # Clear all nodes
```

**3. Prevention:**

- Only run seed endpoints once per environment
- If reseeding needed, clear data first
- Production: Use migration tools (Alembic for SQL, Neo4j migrations) instead of manual seeds

**4. Check seed logic:**

Backend seed endpoints in [backend/app/api/routes/](backend/app/api/routes/) should:
- Check if data exists before inserting
- Use `INSERT ... ON CONFLICT DO NOTHING` (PostgreSQL)
- Use Cypher `MERGE` instead of `CREATE` (Neo4j)

---

## 8. Environment Variable Not Loading

### Symptoms
- Backend uses default values instead of .env values
- `VITE_` prefixed variables not available in frontend
- Error says "undefined" for config values

### Solutions

**1. Backend (.env file location and format):**

[backend/app/core/config.py](backend/app/core/config.py) looks for:
```python
env_file=("../.env", ".env")
```

Create file at **either** location:
- `worldbridgers-regenify/.env` (root)
- `worldbridgers-regenify/backend/.env` (backend directory)

**Format:**
```bash
# .env file - no quotes needed
APP_ENV=development
POSTGRES_DSN=postgresql+psycopg://user:pass@host:5432/db
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password123
CORS_ORIGINS=http://localhost:5173
JWT_SECRET=your-secret-key
```

**2. Frontend (.env file location and format):**

Vite looks for `.env` files in [vite.config.ts](vite.config.ts):
```typescript
envDir: path.resolve(import.meta.dirname)  // Root directory
```

Create file at: `worldbridgers-regenify/.env`

**Format:**
```bash
# .env file - MUST be prefixed with VITE_
VITE_BACKEND_API_BASE_URL=http://localhost:8000
VITE_APP_ID=your-app-id
VITE_OAUTH_PORTAL_URL=https://oauth-provider.com
```

**3. Restart dev server after creating .env:**
```bash
# Frontend
pnpm dev

# Backend
uvicorn app.main:app --reload
```

**4. Debug which .env is being loaded:**

**Backend:**
```python
from app.core.config import get_settings
settings = get_settings()
print(settings.dict())  # Shows all loaded values
```

**Frontend:**
```javascript
console.log(import.meta.env.VITE_BACKEND_API_BASE_URL)
// Or access all:
console.log(import.meta.env)
```

**5. Production (Render/Cloudflare):**

Environment variables are set in the platform UI, not .env files:
- **Render:** Settings → Environment
- **Cloudflare Pages:** Settings → Environment variables

Don't commit `.env` files with secrets to GitHub!

---

## 9. Port 8000 or 5173 Already in Use

### Symptoms
- `ERROR: [Errno 48] Address already in use`
- `error listen EADDRINUSE :::5173`
- Cannot start backend or frontend dev server

### Solutions

**Option A: Kill process using the port**

**Windows:**
```bash
# Find process using port 8000
netstat -ano | findstr :8000
# Returns: TCP    127.0.0.1:8000  ... PID xxxxx

# Kill by PID
taskkill /PID xxxxx /F

# For port 5173
netstat -ano | findstr :5173
taskkill /PID xxxxx /F
```

**macOS/Linux:**
```bash
# Find and kill port 8000
lsof -ti:8000 | xargs kill -9

# For port 5173
lsof -ti:5173 | xargs kill -9
```

**Option B: Use different ports**

**Backend:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001
# Update CORS_ORIGINS in backend/.env if frontend is affected
```

**Frontend:**
```bash
pnpm dev -- --port 5174
# Use VITE_BACKEND_API_BASE_URL to point to backend
```

**Option C: Check what's using the port**

```bash
# Windows
netstat -ano | findstr :8000

# macOS/Linux
lsof -i :8000
```

Common culprits:
- Another dev server instance still running
- Docker container still running
- Previous `npm/pnpm dev` process not fully terminated

---

## Quick Checklist

After adjusting configuration, verify:

- [ ] Backend health: `GET http://localhost:8000/api/health` → `{"status":"ok"}`
- [ ] Frontend loads: `http://localhost:5173` → No console errors
- [ ] API requests work: Check Network tab shows 200 responses
- [ ] CORS headers present: Check response headers include `Access-Control-Allow-Origin`
- [ ] Database connected: Backend doesn't error on startup
- [ ] Neo4j accessible: Seed endpoint works
- [ ] Environment variables loaded: `console.log()` both frontend and backend values

---

## Still Having Issues?

1. **Check logs:** Terminal output usually has the real error message
2. **Inspect network:** Browser DevTools → Network tab shows request/response details
3. **Verify .env files:** Cat out the files to confirm variables are present
4. **Test endpoints manually:**
   ```bash
   curl http://localhost:8000/api/health
   curl http://localhost:8000/api/data/issuers
   ```
5. **Clean cache:** Delete `node_modules`, `.venv`, and rebuild:
   ```bash
   pnpm install
   pip install -r requirements.txt
   ```
