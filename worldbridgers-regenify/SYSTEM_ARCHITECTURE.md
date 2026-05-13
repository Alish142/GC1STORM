# System Architecture

This document describes the combined architecture of the `worldbridgers-regenify` website, including the React frontend, the Express + tRPC server, shared modules, and the secondary FastAPI backend service with PostgreSQL and Neo4j.

## Architecture Diagram

```mermaid
graph LR
  subgraph Frontend
    Browser[Browser / User Agent]
    ReactSPA[React SPA]
    AppShell[App.tsx Shell]
    UI[UI Providers]
    Router[Wouter Router]
    RouteComponents[Route Components / Pages]
    CommonComponents[Common UI Components]

    Browser --> ReactSPA
    ReactSPA --> AppShell
    AppShell --> UI
    UI --> ErrorBoundary[ErrorBoundary]
    UI --> ThemeProvider[ThemeProvider]
    UI --> TooltipProvider[TooltipProvider]
    UI --> Toaster[Toaster]
    AppShell --> Router
    Router --> RouteComponents
    RouteComponents --> CommonComponents
    CommonComponents --> DataTable[DataTable]
    CommonComponents --> DashboardHeader[DashboardHeader]
    CommonComponents --> DashboardLayout[DashboardLayout]
    CommonComponents --> SidebarFilters[SidebarFilters]
    CommonComponents --> HeroCanvas[HeroCanvas]
    CommonComponents --> AIChatBox[AIChatBox]
    CommonComponents --> Map[Map]
  end

  subgraph WebServer
    Express[Express HTTP Server]
    ViteDev[Vite Dev Middleware / Static Serve]
    TRPC[/api/trpc]
    OAuthCallback[/api/oauth/callback]
    Context[Request Context / sdk.authenticateRequest]
    AppRouter[appRouter]
    SystemRouter[systemRouter]
    AuthRouter[auth router]
    IssuersRouter[issuers router]
    OfferingsRouter[offerings router]
    IndicesRouter[indices router]
    DocumentsRouter[documents router]
    GraphRouter[graph router]
    SDK[sdk (OAuth + JWT + Session)]
    Cookies[Session Cookie Management]
    DBUpsert[db.upsertUser]

    ReactSPA -->|API calls| TRPC
    Express --> ViteDev
    Express --> TRPC
    Express --> OAuthCallback
    TRPC --> AppRouter
    AppRouter --> SystemRouter
    AppRouter --> AuthRouter
    AppRouter --> IssuersRouter
    AppRouter --> OfferingsRouter
    AppRouter --> IndicesRouter
    AppRouter --> DocumentsRouter
    AppRouter --> GraphRouter
    OAuthCallback --> SDK
    TRPC -->|auth context| Context
    Context --> SDK
    AuthRouter --> Cookies
    AuthRouter --> SDK
    SDK --> DBUpsert
  end

  subgraph SharedModules
    SharedConst[@shared/const.ts]
    SharedTypes[@shared/types.ts]
    Drizzle[drizzle/schema.ts, relations.ts]
  end

  subgraph SecondaryBackend
    FastAPI[FastAPI Backend Service]
    Postgres[PostgreSQL]
    Neo4j[Neo4j]
    FastAPI -->|REST endpoints| APIData[/api/data/* & /api/graph-db/* & /api/integration/*]
    FastAPI -->|Auth endpoints| APIAuth[/api/auth/*]
    Postgres --> FastAPI
    Neo4j --> FastAPI
    DBUpsert -->|optional shared data| Postgres
  end

  OAuthCallback -->|session cookie set| Browser
  Browser -->|requests assets| ViteDev
  Browser -->|calls REST/tRPC| Express
  Browser -->|calls REST| FastAPI
  SharedConst --> AppRouter
  SharedTypes --> AppRouter
  Drizzle --> FastAPI
```

## Key Components

- **Frontend**
  - React SPA at `client/src/App.tsx`
  - Route pages: `Home`, `Discover`, `Login`, `Dashboard`, `GraphView`, `Logout`, `Account`, `Search`, `NotFound`
  - Shared UI components: `AIChatBox`, `DashboardHeader`, `DashboardLayout`, `DataTable`, `SidebarFilters`, `HeroCanvas`, `Map`

- **Main Backend**
  - Express server in `server/_core/index.ts`
  - tRPC API endpoint at `/api/trpc`
  - Router tree in `server/routers.ts`
  - Auth, issuers, offerings, indices, documents, graph APIs
  - OAuth callback in `server/_core/oauth.ts`
  - Session and JWT handling in `server/_core/sdk.ts`

- **Shared Modules**
  - Shared constants in `shared/const.ts`
  - Shared types in `shared/types.ts`
  - Drizzle schema and relations in `drizzle/schema.ts` and `drizzle/relations.ts`

- **Secondary FastAPI Service**
  - Backend service in `backend/app/main.py`
  - PostgreSQL and Neo4j data stores via `backend/docker-compose.yml`
  - REST endpoints for `/api/auth/*`, `/api/data/*`, `/api/graph-db/*`, `/api/integration/*`

## Data Flow Summary

- Browser loads the React SPA
- React SPA requests data via `/api/trpc` to the main Express server
- Authenticated requests pass through `sdk.authenticateRequest`
- OAuth login is handled by `/api/oauth/callback`
- Separate FastAPI backend provides additional data and auth endpoints backed by PostgreSQL and Neo4j
- Shared modules and schema definitions are used across the app for consistency
