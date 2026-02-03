# rift-stats
CSCE 548 Project — database and data layer for League-style match/team/player stats.

## Objective

This project models esports (League of Legends) competition data. The goal is to provide a **database and data access layer** that can be extended for the rest of the semester.

- **Data model**: Players, teams, team roster history, matches, and per-match/per-team stats (gold diff, kills, dragons, barons, etc.).
- **Database**: PostgreSQL (Supabase) with primary keys, foreign keys, and constraints.
- **Data access layer**: Python DAOs (team, player, team_roster, match, match_stats) with full CRUD.
- **Console front end**: A test harness that creates/reads/updates/deletes records and displays them in the terminal.

Deliverables include SQL scripts for schema and seed data (50+ rows), a working connection to Supabase, and a console app that retrieves and demonstrates CRUD operations.

## Supabase setup

1. Copy `.env.example` to `.env`.
2. In Supabase: **Project Settings → Database → Connection string** → choose **URI** and copy it.
3. Put it in `.env` as `DATABASE_URL=postgresql://...` (use your DB password).
4. In Supabase SQL Editor, run `table_creation.sql` to create tables, then `seed_data.sql` to load 50+ rows of test data.
5. From this repo: `pip install -r requirements.txt` then `python test_harness.py --no-seed` to display records in the console.
