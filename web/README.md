# Rift Stats — Web App

Frontend for the [Rift Stats](../) API (backend in the parent directory). React + Vite + TypeScript + Tailwind: dashboard plus full CRUD (create, read, update, delete) for players, teams, matches, roster, and match stats. Dark theme, green accent.

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

## API usage

The app talks to the backend (no `/api` prefix at the API; Vite proxies `/api` → `http://localhost:8000`). All five resources support **full CRUD**:

| Resource   | List (by team/match where applicable) | Single | Create | Update | Delete |
|------------|----------------------------------------|--------|--------|--------|--------|
| Players    | `GET /players`                        | `GET /players/:id` | POST on list page | Detail page | List + detail |
| Teams      | `GET /teams`                          | `GET /teams/:id`   | POST on list page | Detail page | List + detail |
| Matches    | `GET /matches`                        | `GET /matches/:id` | POST on list page | Detail page | List + detail |
| Roster     | `GET /roster/team/:teamId`            | `GET /roster/:id`  | POST when team selected | Detail page | List + detail |
| Match stats| `GET /match_stats/match/:matchId`     | `GET /match_stats/:id` | POST when match selected | Detail page | List + detail |

List endpoints support `?limit=`. Filtering (e.g. players by role, matches by date) is **client-side**. Backend runs on **port 8000**; proxy target in `vite.config.ts` is `http://127.0.0.1:8000`.

## Project structure

- `src/api/` — Axios client and per-resource modules (players, teams, matches, roster, matchStats) with full CRUD.
- `src/components/` — Layout, Sidebar, DataTable, LoadingSpinner, ErrorMessage.
- `src/pages/` — Dashboard, *Page (list + create form + search/filter), *DetailPage (single + edit/delete).
- `src/App.tsx` — Router and React Query provider.
- Theme: dark background, green accent; see `tailwind.config.cjs`.

## Verify locally

1. **Start backend** (repo root):  
   `uvicorn api.main:app --reload`  
   Confirm API at `http://localhost:8000` (e.g. `http://localhost:8000/docs`).

2. **In `web/`:**  
   `npm install` then `npm run dev`

3. Open **http://localhost:5173**.  
   Check the dashboard, then each section (Players, Teams, Matches, Roster, Match Stats): lists load, row click opens detail, create forms work, edit/delete work on detail pages (and delete on list rows).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (default port 5173). Use `npm run dev:ipv4` if you see IPv6 connection errors to the backend. |
| `npm run build` | Production build → `dist/`. |
| `npm run screenshots` | Capture GET-only views (dashboard, list/single per resource) into `web/screenshots/`. Requires backend + frontend running. One-time: `npx playwright install chromium` (install Chromium for Playwright). |
| `npm run full-system-test` | Run full CRUD flow (create → get all → get one → update → delete) for all five entities; saves screenshots to repo root `system-test-screenshots/`. Requires backend + frontend running. |
