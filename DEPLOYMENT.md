# Rift Stats — Deployment Document

This document gives step-by-step instructions to go from the GitHub repository to a fully running project: database, backend (data, business, and service layers), and frontend (client). It is intended for someone unfamiliar with the project.

---

## 1. Prerequisites

Install and have available:

| Prerequisite | Purpose | Notes |
|--------------|---------|--------|
| **PostgreSQL** | Database for teams, players, matches, roster, match stats | Use a local install or a hosted service (e.g. [Supabase](https://supabase.com), Neon, Railway). |
| **Python 3** (3.9+) | Backend API (FastAPI, uvicorn) | Verify with `python3 --version`. |
| **Node.js** (18+) and **npm** | Frontend (Vite, React) | Verify with `node -v` and `npm -v`. |
| **Git** (optional) | Clone the repo | Or download the repo as a ZIP and unpack. |
| **Code editor / IDE** (optional) | Edit config and run commands | Any editor (VS Code, Cursor, etc.) or terminal only. |

### Optional for full system test

- **Playwright** (installed via npm in `web/`): used to capture screenshots for the Full System Test PDF. One-time browser install: `cd web && npx playwright install chromium` (see `web/README.md`).

---

## 2. Get the code

**Option A — Clone with Git**

```bash
git clone https://github.com/YOUR_USERNAME/rift-stats.git
cd rift-stats
```

Replace `YOUR_USERNAME` and the repo URL with the actual GitHub URL.

**Option B — Download ZIP**

1. On GitHub, click **Code** → **Download ZIP**.
2. Unpack the ZIP to a folder (e.g. `rift-stats`).
3. Open a terminal and go into that folder:
   ```bash
   cd /path/to/rift-stats
   ```

---

## 3. Database setup

The application uses PostgreSQL. All tables are created from SQL files in the repo.

### 3.1 Create a database

- **Local Postgres:** Create a database, e.g. `createdb riftstats` or create one via `psql` or pgAdmin.
- **Supabase:** Create a project; the database URL is in **Project Settings → Database**. You can run SQL in the **SQL Editor**.

### 3.2 Set the connection details

You will need either:

- A **connection string**: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`
- Or separate **host, user, password, database** (and optionally port).

Keep these for the next step (backend `.env`).

### 3.3 Run the schema and seed data

From the **repo root** directory, run the SQL files **in order** against your database.

**Using `psql` (local or remote):**

```bash
# If you have DATABASE_URL in the environment:
psql "$DATABASE_URL" -f table_creation.sql
psql "$DATABASE_URL" -f seed_data.sql
```

Or with explicit connection:

```bash
psql -h HOST -U USER -d DATABASE -f table_creation.sql
psql -h HOST -U USER -d DATABASE -f seed_data.sql
```

**Using Supabase:** Open the SQL Editor, paste the contents of `table_creation.sql`, run it; then paste and run `seed_data.sql`.

**Result:** Tables `players`, `teams`, `team_roster`, `matches`, `match_stats` exist and contain seed data.

---

## 4. Backend (service, business, and data layers)

The backend is a FastAPI app. It hosts the **service layer** (REST API), which uses the **business layer** (in `business/`), which uses the **data layer** (DAOs and DB in `data/`).

### 4.1 Go to the repo root

All backend commands below are run from the **project root** (where `api/`, `business/`, `data/`, and `requirements.txt` are).

```bash
cd /path/to/rift-stats
```

### 4.2 Create a virtual environment (recommended)

```bash
python3 -m venv .venv
source .venv/bin/activate   # On Windows: .venv\Scripts\activate
```

### 4.3 Install dependencies

```bash
pip install -r requirements.txt
```

### 4.4 Configure environment

Copy the example env file and edit it with your database and optional API settings:

```bash
cp .env.example .env
```

Edit `.env`:

**Option A — Single connection string** (password must not contain `#` or `@`, or URL-encode them):

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

**Option B — Separate variables** (use this if the password has `#` or `@`):

```env
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-password
DB_NAME=your-db-name
DB_PORT=5432
```

Optional (defaults are fine for local run):

```env
API_HOST=0.0.0.0
API_PORT=8000
```

Save the file. **Do not commit `.env`** (it is in `.gitignore`).

### 4.5 Start the API server

```bash
uvicorn api.main:app --reload
```

You should see something like:

```
Uvicorn running on http://127.0.0.1:8000
```

### 4.6 Verify the backend

- Open in a browser: **http://localhost:8000/docs**  
  You should see the Swagger UI with endpoints for `/teams`, `/players`, `/matches`, `/roster`, `/match_stats`.
- Try: **http://localhost:8000/players** — you should get JSON (a list of players).

If both work, the **service, business, and data layers** are running correctly.

---

## 5. Frontend (client layer)

The client is a React app in the `web/` directory. In development it talks to the backend via a Vite proxy.

### 5.1 Go to the web app directory

```bash
cd web
```

### 5.2 Install dependencies

```bash
npm install
```

### 5.3 Configure environment

```bash
cp .env.example .env
```

For **local development**, keep:

```env
VITE_API_BASE_URL=/api
```

This makes the app call `/api/*`; Vite’s proxy forwards those requests to the backend (see `web/vite.config.ts`). No need to change this if the backend is at `http://localhost:8000`.

### 5.4 Start the development server

```bash
npm run dev
```

If you see connection errors to `::1:8000` (IPv6), stop the server (Ctrl+C) and run:

```bash
npm run dev:ipv4
```

Note the URL in the terminal (usually **http://localhost:5173**).

### 5.5 Verify the frontend

- Open **http://localhost:5173** in a browser.
- You should see the Rift Stats dashboard with navigation to Players, Teams, Matches, Roster, Match Stats.
- Click **Players**: the list should load from the API. Click a player to see the detail page.

If the dashboard and list/detail views load, the **client layer** is working and talking to the backend.

---

## 6. How to tell if setup succeeded

| Check | What to do | Success |
|-------|------------|---------|
| Database | Run `SELECT COUNT(*) FROM players;` in your SQL client | Returns a number (e.g. from seed data). |
| Backend | Open http://localhost:8000/docs | Swagger UI loads; you can try `GET /players`. |
| Backend | Open http://localhost:8000/players | JSON array of players. |
| Frontend | Open http://localhost:5173 | Dashboard loads. |
| Full stack | From the app, open Players, create/edit a player | Data appears and persists (refresh or reopen list). |

---

## 7. Optional: production build and hosting

### Backend (production)

- Run without `--reload`, e.g.:
  ```bash
  uvicorn api.main:app --host 0.0.0.0 --port 8000
  ```
- Or use **gunicorn** with a uvicorn worker (add `gunicorn` to `requirements.txt` and run `gunicorn api.main:app -w 1 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000`).
- Deploy to your chosen platform (e.g. Railway, Render, Fly.io) and set `DATABASE_URL` (or `DB_*`) in the platform’s environment.

### Frontend (production)

1. Set `VITE_API_BASE_URL` to your **deployed API URL** (e.g. `https://your-api.example.com`) in `web/.env` or the build environment.
2. Build:
   ```bash
   cd web && npm run build
   ```
3. Serve the contents of `web/dist/` with any static host (e.g. Nginx, Netlify, Vercel, GitHub Pages). The app is a SPA; point all routes to `index.html` if required.

---

## 8. Troubleshooting

| Issue | Suggestion |
|-------|------------|
| `ModuleNotFoundError: No module named 'api'` | Run uvicorn from the **repo root**, not from `api/` or `web/`. |
| Database connection errors | Check `.env`: correct host, port, user, password, database name. For Supabase, use the connection string from Project Settings → Database (or DB_* if the password has special characters). |
| Frontend shows “Failed to fetch” or network errors | Ensure the backend is running on port 8000. If on macOS and you see `::1:8000`, run `npm run dev:ipv4` in `web/`. |
| Port 8000 or 5173 already in use | Stop the other process using that port, or change `API_PORT` / Vite’s `port` in `web/vite.config.ts`. |

---

## 9. Generating this document as a PDF

To produce **deployment_document.pdf** in the repo root:

- **Using Pandoc:**  
  `pandoc DEPLOYMENT.md -o deployment_document.pdf`
- **Using a Markdown/PDF tool:** Open `DEPLOYMENT.md` in an editor or viewer that supports “Export to PDF” or “Print to PDF”.
- **Using a browser:** Open the repo on GitHub and use the browser’s Print → Save as PDF on the rendered Markdown.

Save the PDF in the project root (e.g. `deployment_document.pdf`) for submission.
