# Quickest Client Demo Deployment (No Cost)

This uses:
- Frontend: Cloudflare Pages
- Backend API: Render (Free web service)
- Graph DB: Neo4j Aura Free

## 1) Deploy FastAPI to Render

1. Push this repo to GitHub.
2. In Render, create a new **Web Service** from the repo.
3. Render will read [`render.yaml`](./render.yaml) automatically.
4. Set these environment variables in Render:
   - `POSTGRES_DSN` (your hosted PostgreSQL URL, or temporary local replacement)
   - `NEO4J_URI` (Aura connection URI, usually `neo4j+s://...`)
   - `NEO4J_USER`
   - `NEO4J_PASSWORD`
   - `CORS_ORIGINS` (add your Cloudflare Pages URL, e.g. `https://regenify-demo.pages.dev`)
5. Deploy and confirm:
   - `GET https://<your-render-app>.onrender.com/api/health` returns `{"status":"ok"}`.

## 2) Create Neo4j Aura Free

1. Create an Aura Free DB instance.
2. Copy connection values (`URI`, `username`, `password`) into Render env vars.
3. Seed graph data once backend is live:
   - `POST https://<your-render-app>.onrender.com/api/graph-db/seed-primary-themes`

## 3) Deploy Frontend to Cloudflare Pages

Use these settings:
- Framework preset: `Vite`
- Build command: `pnpm install --frozen-lockfile && pnpm exec vite build`
- Build output directory: `dist/public`
- Root directory: `worldbridgers-regenify`

Set Cloudflare Pages environment variables:
- `VITE_BACKEND_API_BASE_URL=https://<your-render-app>.onrender.com`
- (Optional) `VITE_OAUTH_PORTAL_URL`
- (Optional) `VITE_APP_ID`
- (Optional analytics) `VITE_ANALYTICS_ENDPOINT`, `VITE_ANALYTICS_WEBSITE_ID`

Routing fallback for SPA is already included via:
- [`client/public/_redirects`](./client/public/_redirects)

## 4) Final Wiring

1. Copy your Cloudflare Pages URL.
2. Update Render `CORS_ORIGINS` to include:
   - the production URL (example: `https://regenify-demo.pages.dev`)
   - your preview URL(s) if needed.
3. Redeploy Render.

## 5) Demo Checklist

- Home page loads from Cloudflare URL.
- Login works with demo user.
- Dashboard pages navigate directly via URL refresh (SPA fallback).
- Graph page loads from backend and shows seeded nodes.

## Notes

- Render free services can sleep when idle; first request may take longer.
- If you do not have hosted PostgreSQL yet, the API still demonstrates graph and mock endpoints, but SQL-backed flows may be limited.
