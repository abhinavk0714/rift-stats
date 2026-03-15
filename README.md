# rift-stats

API and web dashboard for tracking teams, players, roster, matches, and match statistics — with full create, read, update, and delete for every entity.

**In this repo:** `api/`, `business/`, `data/` (backend), `web/` (frontend), `cli/` (console client), `Dockerfile` and `docker-compose.yml`, and `table_creation.sql` / `seed_data.sql` for the database.

## Tech

- **Backend**: Python, FastAPI, Pydantic. Postgres via SQLAlchemy in `data/`.
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, React Query, Axios. Lives in `web/`.
- **Database**: PostgreSQL (e.g. Supabase or local).

## Architecture

- **Data layer** (`data/`): db, models, DAOs (team, player, team_roster, match, match_stats). Direct DB access, full CRUD.
- **Business layer** (`business/`): Services for Team, Player, Team Roster, Match, and Match Stats; wrap DAOs and enforce validation.
- **Service layer** (`api/`): FastAPI REST API; Pydantic models; 400/404/500 for errors. Endpoints: `/teams`, `/players`, `/roster`, `/matches`, `/match_stats`.
- **Web app** (`web/`): React + Vite + TypeScript + Tailwind frontend; dashboard, list/detail views, create/edit/delete for all five entities. See [web/README.md](web/README.md) for details.
- **Console client** (`cli/console_client.py`): Calls API over HTTP and demonstrates full CRUD for all five entities.

## Getting started

For full setup instructions (prerequisites, database, backend, frontend, and Docker), see the [deployment document](DEPLOYMENT_DOCUMENT.pdf).

**Quick summary:** You need PostgreSQL (or Supabase). Copy `.env.example` to `.env` and set your database URL. Run `table_creation.sql` and `seed_data.sql` in your database, then start the backend (`uvicorn api.main:app --reload`) and optionally the frontend (`cd web && npm install && npm run dev`). Or run the API in Docker with `docker compose up --build` (database must be reachable; see [deployment document](DEPLOYMENT_DOCUMENT.pdf) for details). For frontend-only setup (proxy, env, scripts), see [web/README.md](web/README.md).

## Environment

Create a `.env` file (do not commit). Copy from `.env.example` and set `DATABASE_URL` (or `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`). See [DEPLOYMENT_DOCUMENT.pdf](DEPLOYMENT_DOCUMENT.pdf) for details.

## Tests

```bash
pytest tests/ -v
```

Requires a configured database (`DATABASE_URL` or `DB_*` in `.env`).
