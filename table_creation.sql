-- teams, players, team_roster, matches, match_stats

-- 1) Players (create first)
CREATE TABLE IF NOT EXISTS players (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(120) NOT NULL,
  gamer_tag    VARCHAR(60) NOT NULL UNIQUE,
  nationality  VARCHAR(50),
  role         VARCHAR(20) NOT NULL CHECK (role IN ('TOP','JG','MID','ADC','SUP')),
  age          INT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_players_gamertag ON players(gamer_tag);

-- 2) Teams
CREATE TABLE IF NOT EXISTS teams (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(100) NOT NULL UNIQUE,
  short_name   VARCHAR(20),
  region       VARCHAR(50) NOT NULL DEFAULT 'LCK',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teams_region ON teams(region);

-- 3) Team roster history
CREATE TABLE IF NOT EXISTS team_roster (
  id           SERIAL PRIMARY KEY,
  team_id      INT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id    INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  start_date   DATE NOT NULL,
  end_date     DATE,                 -- NULL = currently active
  role_at_team VARCHAR(20),
  UNIQUE(team_id, player_id, start_date)
);

CREATE INDEX IF NOT EXISTS idx_roster_team ON team_roster(team_id);

-- 4) Matches (one row per game)
CREATE TABLE IF NOT EXISTS matches (
  id             SERIAL PRIMARY KEY,
  series_id      INT,                           -- optional grouping for BO3/BO5
  region         VARCHAR(50) NOT NULL DEFAULT 'LCK',
  season         VARCHAR(50),
  match_date     TIMESTAMPTZ NOT NULL,
  team_a_id      INT NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  team_b_id      INT NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  best_of        INT NOT NULL DEFAULT 1 CHECK (best_of IN (1,3,5)),
  game_number    INT NOT NULL DEFAULT 1,
  winner_team_id INT REFERENCES teams(id) ON DELETE SET NULL,
  patch          VARCHAR(30),
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (team_a_id <> team_b_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_region ON matches(region);

-- 5) Match stats: per (match, team)
CREATE TABLE IF NOT EXISTS match_stats (
  id            SERIAL PRIMARY KEY,
  match_id      INT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  team_id       INT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  gold_diff_15  INT,
  kills         INT,
  deaths        INT,
  assists       INT,
  towers_taken  INT,
  dragons_taken INT,
  barons_taken  INT,
  first_blood   BOOLEAN,
  win           BOOLEAN NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (match_id, team_id)
);

CREATE INDEX IF NOT EXISTS idx_match_stats_match ON match_stats(match_id);
CREATE INDEX IF NOT EXISTS idx_match_stats_team ON match_stats(team_id);
