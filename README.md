# rift-stats

LoL-style stats: teams, players, roster, matches, and match stats. Backend API + web dashboard.

## Tech

- **Backend**: Python, FastAPI, Pydantic. Postgres via SQLAlchemy-style access in `data/`.
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, React Query, Axios. Lives in `web/`.
- **Database**: PostgreSQL (e.g. Supabase or local).

## Architecture

- **Data layer** (`data/`): db, models, DAOs (team, player, team_roster, match, match_stats). Direct DB access, CRUD only.
- **Business layer** (`business/`): Services for Team, Player, Team Roster, Match, and Match Stats; wrap DAOs and enforce validation.
- **Service layer** (`api/`): FastAPI REST API; Pydantic models; 400/404/500 for errors. Endpoints: `/teams`, `/players`, `/roster`, `/matches`, `/match_stats`.
- **Web app** (`web/`): React + Vite + TypeScript + Tailwind frontend; dashboard, list/detail views, and filters for all entities. See `web/README.md` for details.
- **Console client** (`cli/console_client.py`): Calls API over HTTP and demonstrates full CRUD for all five entities.

## Environment

Create a `.env` file (do not commit). Example:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
API_HOST=0.0.0.0
API_PORT=8000
```

For Supabase, use the connection string from Project Settings → Database. If the password contains `#` or `@`, use the `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (and optional `DB_PORT`) variables instead (see `.env.example`).

## Run locally (no Docker)

1. **Database**: Run `table_creation.sql` and `seed_data.sql` in your Postgres/Supabase.
2. **Backend**: `pip install -r requirements.txt`, then `uvicorn api.main:app --reload` (serves at http://localhost:8000). API docs: http://localhost:8000/docs.
3. **Web app** (optional): In another terminal, `cd web`, then `npm install` and `npm run dev`. Frontend at http://localhost:5173. See `web/README.md` (e.g. `.env` and proxy).
4. **Console client** (optional): `python cli/console_client.py` for full CRUD from the CLI.

## Run with Docker

A `Dockerfile` and `.dockerignore` are included so the API can be run in a container. Instructions:

1. **Build**: `docker build -t rift-stats-api .`
2. **Run**: `docker run --env-file .env -p 8000:8000 rift-stats-api`
3. **Docs**: Open http://localhost:8000/docs
4. **Console client** (on host): `python cli/console_client.py`

Docker has not been fully verified on all setups; local run with uvicorn (see above) is the primary development path.

## Tests

```bash
pytest tests/ -v
```

Requires `DATABASE_URL` (or DB_* vars) for tests that hit the API.
