# Rift Stats — Web App

React + Vite + TypeScript + Tailwind web app for the Rift Stats API (backend in this repo). Dashboard, players, teams, matches, roster, and match stats with dark theme and green accent.

## Stack

- **React 18** + **TypeScript**
- **Vite** (dev server, build)
- **Tailwind CSS** (dark theme, green accent)
- **Axios** (HTTP client)
- **TanStack React Query** (server state, caching)
- **React Router DOM** (routing)
- **ESLint** + **Prettier** (lint/format)
- **npm** (package manager)

## Backend

The API runs with **uvicorn** on **port 8000** (no `/api` prefix at the backend).

From the **repo root** (not inside `web/`):

```bash
# Ensure deps and DB are set up, then:
uvicorn api.main:app --reload
```

- API base: `http://localhost:8000`
- OpenAPI docs: `http://localhost:8000/docs`

## Running the frontend

1. **Copy env and set API base URL**

   ```bash
   cp .env.example .env
   ```

   For local dev, keep:

   ```env
   VITE_API_BASE_URL=/api
   ```

   So the frontend calls `/api/*` and Vite proxies to the backend (see below).

2. **Install and run**

   ```bash
   npm install
   npm run dev
   ```

   Frontend is at **http://localhost:5173** (or the port Vite prints).

3. **If you see `ECONNREFUSED ::1:8000`** (macOS often resolves localhost to IPv6):  
   Stop the dev server (Ctrl+C), then run:
   ```bash
   npm run dev:ipv4
   ```
   This forces Node to prefer IPv4. Also ensure the backend is running (`uvicorn api.main:app --reload` from repo root).

## Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Base URL for API requests. In dev use `/api` so the Vite proxy handles forwarding. In production set your deployed API URL (e.g. `https://api.example.com`). |

## Proxy (development)

`vite.config.ts` proxies `/api` to `http://localhost:8000` and **strips** the `/api` prefix so the backend receives paths like `/teams`, `/players`, etc. No secrets are stored in the repo; use `.env` and `.env.example` only.

## Endpoints used (discovered from backend)

All are GET unless noted. Backend has no `/api` prefix.

| Resource | List | Single | Subset / filter |
|----------|------|--------|------------------|
| Teams | `GET /teams` (?limit=) | `GET /teams/:id` | Client-side filter by region (TODO: server when available) |
| Players | `GET /players` (?limit=) | `GET /players/:id` | Client-side filter by role (TODO: server when available) |
| Matches | `GET /matches` (?limit=) | `GET /matches/:id` | Client-side filter by date/team (TODO: server when available) |
| Roster | — | `GET /roster/:id` | `GET /roster/team/:teamId` (list by team) |
| Match stats | — | `GET /match_stats/:id` | `GET /match_stats/match/:matchId` (list by match) |

**Assumptions / TODOs**

- Filtering for players (role) and matches (date, team) is **client-side**; backend only supports `?limit=` on list endpoints. TODO in code: switch to server-side filtering when the API supports it.
- Backend runs on **port 8000**; frontend dev proxy target is `http://localhost:8000`.

## Project structure

- `src/api/` — axios client and per-resource API modules (return parsed JSON).
- `src/components/` — Layout, Sidebar, Navbar, DataTable, LoadingSpinner, ErrorMessage, ModalConfirm.
- `src/pages/` — Dashboard, *Page (list + filter), *DetailPage (single).
- `src/App.tsx` — Router and React Query provider.
- Theme: dark background (`#0f172a`, `#1e293b`), accent green (`#22c55e`), hover `#16a34a`; see `tailwind.config.cjs`.

## Verify locally

1. **Start backend** (repo root):  
   `uvicorn api.main:app --reload`  
   Confirm API at `http://localhost:8000` (e.g. `http://localhost:8000/docs`).

2. **In `web/`**  
   `npm install`  
   `npm run dev`

3. Open **http://localhost:5173**.  
   Confirm Dashboard (counts for players, teams, matches), Players, Teams, Matches, Roster (select team), Match Stats (select match) load and show data.  
   Click rows to open detail pages.

## Screenshots (optional)

With the backend and frontend running, you can capture all main GET views (dashboard, list/single/subset per table) in one go:

```bash
cd web
npm install
npx playwright install
npm run screenshots
```

(First time only: `npx playwright install` downloads the browser.)

Screenshots are saved under `web/screenshots/` (e.g. `01-dashboard.png`, `02-players-list.png`). You need at least one record per table (e.g. seed data) for single views. The folder is gitignored.
