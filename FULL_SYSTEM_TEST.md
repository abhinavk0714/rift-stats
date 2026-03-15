# Full System Test — Rift Stats

This document describes the full system test used to verify all layers (data, business, service, client) and how to produce the screenshots and evidence for the **Full System Test PDF**.

## Requirements (assignment)

- Data and business layers are hosted via the **service layer** (API on your Project 2 platform).
- Client (front end) is hosted as appropriate (e.g. local dev or deployed).
- Test **all** functionality: **insert**, **update**, **get** (all + single). Delete is encouraged.
- Evidence: screenshots of the **client** and of **database/API** for: create, update, delete, get all, get one.

## Architecture under test

| Layer    | Component                          | How it’s exercised                    |
|----------|------------------------------------|----------------------------------------|
| Data     | Postgres + DAOs in `data/`         | API and DB queries                     |
| Business | Services in `business/`            | API endpoints                          |
| Service  | FastAPI in `api/` (e.g. port 8000) | HTTP requests from client and scripts  |
| Client   | React app in `web/` (e.g. :5173)   | Browser (Playwright)                   |

## How to run the test

1. **Start the backend** (from repo root):
   ```bash
   uvicorn api.main:app --reload
   ```
2. **Start the frontend** (in another terminal):
   ```bash
   cd web && npm install && npm run dev
   ```
   (Use `npm run dev:ipv4` if you see IPv6 connection errors.)
3. **Capture client screenshots** (in another terminal, from `web/`):
   ```bash
   cd web && npm run full-system-test
   ```
   Screenshots are written to **`system-test-screenshots/`** in the repo root.
4. **Optional — capture API (service layer) evidence**:
   ```bash
   cd web && node scripts/capture-api-evidence.mjs
   ```
   This writes `api-get-all-players.json` and `api-get-one-player.json` into `system-test-screenshots/`. You can screenshot these files or the terminal output to show service-layer responses.
5. **Database verification** (see below): run the listed SQL in your Postgres client (e.g. `psql` or Supabase SQL Editor) and take screenshots of the result sets.

## Screenshots produced by `full-system-test`

The Playwright script runs a full CRUD flow (create → get all → get one → update → delete) for **five entities**: **Players**, **Teams**, **Matches**, **Roster**, and **Match Stats**. Each step is chosen so screenshots are **visually distinct** (e.g. create form filled vs list vs detail vs edit form vs detail after update vs list after delete).

All files are saved under **`system-test-screenshots/`** with names like `{entity}-{step}.png`.

### Per-entity steps (6 screenshots each)

| Step | Filename pattern | Description (for PDF caption) |
|------|------------------|-------------------------------|
| 01 | `*-01-create-form-filled.png` | **Create** — Create form with data filled, before submit (clearly shows “create” UI). |
| 02 | `*-02-list-after-create.png` | **Get all** — List view with the new row visible. |
| 03 | `*-03-detail-get-one.png` | **Get one** — Detail view (read-only) for the created item. |
| 04 | `*-04-edit-form-update.png` | **Update** — Edit form with updated value visible (e.g. Nationality “Test Nation”, Notes “SysTest match notes”) before save. |
| 05 | `*-05-detail-after-update.png` | **Update (result)** — Detail view after save, showing the updated field. |
| 06 | `*-06-list-after-delete.png` | **Delete** — List view after delete (test row no longer present). |

### Entities and prefixes

| Prefix | Entity | Create/update details |
|--------|--------|------------------------|
| `players-*` | Players | Create: name, gamer tag, role MID. Update: Nationality → “Test Nation”. |
| `teams-*` | Teams | Create: name, short name, region. Update: Region → “SysTest Region”. |
| `matches-*` | Matches | Create: Team A/B, date. Update: Notes → “SysTest match notes”. |
| `roster-*` | Roster | Create: team + player + start date + role. Update: Role at team → “SysTest Role Updated”. |
| `match-stats-*` | Match Stats | Create: match + team + kills 10, deaths 2, assists 5, win. Update: Kills → 15. |

Use these images in your **Full System Test PDF** as proof of client-layer testing for all entities.

## Database / API evidence for the PDF

For each operation, you can add a “database or service layer” screenshot as follows.

### Get all

- **API:** Open `system-test-screenshots/api-get-all-players.json` (from `capture-api-evidence.mjs`) and screenshot the file or a snippet showing the array of players.
- **DB:** In `psql` or Supabase SQL Editor run:
  ```sql
  SELECT id, name, gamer_tag, role, nationality, age FROM players ORDER BY id DESC LIMIT 10;
  ```
  Screenshot the result set.

### Get one

- **API:** Open `system-test-screenshots/api-get-one-player.json` and screenshot the single player object.
- **DB:** Replace `:id` with a real player ID (e.g. the one you created):
  ```sql
  SELECT * FROM players WHERE id = :id;
  ```
  Screenshot the single row.

### Create

- After running the full system test, the script creates a player with a name like `SysTest-<timestamp>`. In the DB:
  ```sql
  SELECT * FROM players WHERE name LIKE 'SysTest-%' ORDER BY id DESC LIMIT 1;
  ```
  Screenshot the row (or run this right after the “after create” step before delete).

### Update

- After the update step (before delete), the same player row should show the updated field (e.g. `nationality = 'Test Nation'`):
  ```sql
  SELECT * FROM players WHERE name LIKE 'SysTest-%' ORDER BY id DESC LIMIT 1;
  ```
  Screenshot the row.

### Delete

- After the delete step, the test player should no longer exist:
  ```sql
  SELECT * FROM players WHERE name LIKE 'SysTest-%';
  ```
  Screenshot the empty result set.

## Assembling the Full System Test PDF

1. Put all images in **one PDF** in the **repo root**, e.g. `full_system_test.pdf`.
2. Suggested order:
   - Title page: “Full System Test — Rift Stats”
   - Short description: data/business/service/client hosted; insert, update, get, delete tested for Players, Teams, Matches, Roster, Match Stats.
   - For each entity (e.g. Players): `players-01-create-form-filled.png` through `players-06-list-after-delete.png`, optionally followed by DB/API evidence for that entity.
   - Or group by operation: all “create form” shots, then all “list after create”, then “detail get one”, then “edit form update”, then “detail after update”, then “list after delete”.
3. You can generate the PDF from the images using:
   - Word / Google Docs: insert images + captions, then Export as PDF.
   - `pandoc`: create a short Markdown file that references each image, then e.g. `pandoc full_system_test.md -o full_system_test.pdf`.
   - Any “Print to PDF” or “Combine images to PDF” tool.

## How to tell if the test succeeded

- **Client:** All 30 screenshots (6 × 5 entities) exist in `system-test-screenshots/` and show the expected UI: create forms filled, lists with new rows, detail views, edit forms with updated values, detail after save, lists after delete.
- **API:** `capture-api-evidence.mjs` runs without errors and the JSON files contain player data.
- **Backend:** `http://localhost:8000/docs` loads; GET endpoints return JSON.
- **Database:** The SQL queries above (and equivalent for other tables) return the expected rows (and empty set for the delete check).
