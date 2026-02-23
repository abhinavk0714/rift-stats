# rift-stats
CSCE 548 Project — Rift Stats (data layer, business layer, service layer, Docker).

## Architecture

- **Data layer** (`data/`): db, models, DAOs (team, player, team_roster, match, match_stats). Direct DB access, CRUD only.
- **Business layer** (`business/`): Services for Team, Player, Team Roster, Match, and Match Stats; wrap DAOs and enforce validation.
- **Service layer** (`api/`): FastAPI REST API; Pydantic models; 400/404/500 for errors. Endpoints: `/teams`, `/players`, `/roster`, `/matches`, `/match_stats`.
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
2. **Install**: `pip install -r requirements.txt`
3. **API**: `uvicorn api.main:app --reload` (serves at http://localhost:8000).
4. **Console client**: In another terminal, `python cli/console_client.py`. It runs full CRUD (create → get → update → delete → get 404) for teams, players, roster, matches, and match_stats.

## Run with Docker

A `Dockerfile` and `.dockerignore` are included so the API can be run in a container. Instructions:

1. **Build**: `docker build -t rift-stats-api .`
2. **Run**: `docker run --env-file .env -p 8000:8000 rift-stats-api`
3. **Docs**: Open http://localhost:8000/docs
4. **Console client** (on host): `python cli/console_client.py`

**Note — Docker in this environment:** Docker was not fully verified on the current setup due to environment constraints: Docker Desktop requires macOS 14+, and the Colima + QEMU path hit Homebrew issues (e.g. `formula.jws.json` / QEMU install failures on macOS 12). The service is hosted and tested locally with **uvicorn** (see “Run locally” above). For a future release, full Docker integration (build + run + screenshots) is planned once the environment supports it (e.g. OS update or resolved tooling).

## Project 1 (data layer only)

- **Test harness**: `python test_harness.py --no-seed` (uses `data/` and prints tables + one CRUD per DAO).
- **Capture output**: `python test_harness.py --no-seed 2>&1 | tee console_output.txt`

## Tests

```bash
pytest tests/ -v
```

Requires `DATABASE_URL` (or DB_* vars) for tests that hit the API.
