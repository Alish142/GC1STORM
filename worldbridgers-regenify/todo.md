# Worldbridgers Regenify — Project TODO

## Phase 1: Setup
- [x] Initialize project scaffold
- [x] Create todo.md
- [x] Set up global CSS design tokens (colors, fonts, spacing)
- [x] Update App.tsx with all routes and layout

## Phase 2: Public Landing Page
- [x] Animated hero section with canvas/SVG financial data flow
- [x] Public navigation bar with dropdown menus
- [x] ESG stats showcase section
- [x] Features section with feature cards
- [x] How it works section
- [x] CTA section
- [x] Footer with links

## Phase 3: Authentication
- [x] Login page with email/password form, validation, loading/error states
- [x] Protected route wrapper
- [x] Logout functionality
- [x] Redirect to dashboard after login

## Phase 4: Backend / Data Layer
- [x] tRPC router: issuers (list, filter, search, paginate)
- [x] tRPC router: offerings (list, filter, search, paginate)
- [x] tRPC router: indices (list, filter, search, paginate)
- [x] tRPC router: documents (list, filter, search, paginate)
- [x] tRPC router: graph (nodes and edges for visualization)
- [x] Mock seed data for all entities (20 issuers, 21 offerings, 15 indices, 18 documents, 23 graph nodes, 27 edges)

## Phase 5: Dashboard
- [x] Dashboard layout with logged-in header
- [x] Tabbed navigation (Issuers, Offerings, Indices, Documents)
- [x] Issuers table with left filter panel, search, sort, pagination
- [x] Offerings table with left filter panel, search, sort, pagination
- [x] Indices table with left filter panel, search, sort, pagination (green/red values)
- [x] Documents table with preview/download buttons

## Phase 6: Graph Visualization
- [x] Graph page with node-edge network display
- [x] Node types: Issuers, Investors, Opportunities, Projects, Markets
- [x] Click node to show detail panel
- [x] Filter by entity type and region
- [x] Legend for node colors and types
- [x] Zoom controls and pan interaction

## Phase 7: Polish & Tests
- [x] Responsive layout (desktop/tablet first)
- [x] Loading, empty, error states throughout
- [x] Hover states and transitions
- [x] Vitest unit tests (22 tests, 2 test files, all passing)
- [x] Final checkpoint


## Bugs & Fixes
- [x] Fix demo login not working — added auth cache invalidation and refresh after successful login
