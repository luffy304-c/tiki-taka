-- Legacy reference only; active application uses local JSON storage. See README.md.
-- ════════════════════════════════════════════════════════
-- TikiTaka — Supabase SQL Schema
-- Запусти это в Supabase → SQL Editor → New Query
-- ════════════════════════════════════════════════════════

-- ─────────────── LEAGUES ───────────────
CREATE TABLE IF NOT EXISTS leagues (
  id          TEXT PRIMARY KEY,           -- 'premier_league', 'la_liga' etc
  name        TEXT NOT NULL,
  country     TEXT NOT NULL,
  logo_url    TEXT,
  color       TEXT DEFAULT '#00e676',
  tier        INT  DEFAULT 1,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────── TEAMS ───────────────
CREATE TABLE IF NOT EXISTS teams (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  short_name   TEXT NOT NULL,
  country      TEXT NOT NULL,
  league       TEXT NOT NULL,
  league_id    TEXT REFERENCES leagues(id),
  founded      INT,
  stadium      TEXT,
  capacity     INT,
  manager      TEXT,
  trophies     INT  DEFAULT 0,
  color        TEXT DEFAULT '#ffffff',
  squad_value  TEXT,
  description  TEXT,
  logo_url     TEXT,
  website      TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────── PLAYERS ───────────────
CREATE TABLE IF NOT EXISTS players (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  full_name        TEXT,
  position         TEXT NOT NULL,
  position_detail  TEXT,             -- 'Left Winger', 'Right Winger' etc
  nationality      TEXT,
  second_nationality TEXT,
  age              INT,
  date_of_birth    DATE,
  team_id          TEXT REFERENCES teams(id),
  jersey_number    INT,
  foot             TEXT DEFAULT 'Right',
  height_cm        INT,
  weight_kg        INT,
  photo_url        TEXT,

  -- Transfermarkt
  market_value     TEXT,             -- '€200M'
  market_value_num NUMERIC,          -- 200 (millions) for sorting/filtering
  contract_until   TEXT,

  -- Season stats 2025/26
  appearances      INT  DEFAULT 0,
  starts           INT  DEFAULT 0,
  minutes_played   INT  DEFAULT 0,
  goals            INT  DEFAULT 0,
  assists          INT  DEFAULT 0,
  clean_sheets     INT  DEFAULT 0,   -- for GK/DEF

  -- Advanced stats
  xg               NUMERIC DEFAULT 0,
  xa               NUMERIC DEFAULT 0,
  shots_per_game   NUMERIC DEFAULT 0,
  pass_accuracy    NUMERIC DEFAULT 0,
  dribbles_per_game NUMERIC DEFAULT 0,
  tackles_per_game NUMERIC DEFAULT 0,
  interceptions_pg NUMERIC DEFAULT 0,
  aerial_won_pct   NUMERIC DEFAULT 0,

  -- Ratings
  rating           NUMERIC DEFAULT 7.0,
  sofascore_rating NUMERIC,
  whoscored_rating NUMERIC,

  -- Career
  career_goals     INT DEFAULT 0,
  career_assists   INT DEFAULT 0,
  career_apps      INT DEFAULT 0,
  senior_caps      INT DEFAULT 0,
  international_goals INT DEFAULT 0,

  -- Meta
  tags             TEXT[],
  description      TEXT,
  injury_status    TEXT DEFAULT 'Fit',  -- 'Fit', 'Doubtful', 'Injured'
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────── NEWS ───────────────
CREATE TABLE IF NOT EXISTS news (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title        TEXT NOT NULL,
  excerpt      TEXT,
  content      TEXT,
  category     TEXT,
  author       TEXT DEFAULT 'TikiTaka',
  cover_url    TEXT,
  tags         TEXT[],
  trending     BOOLEAN DEFAULT FALSE,
  read_time    INT DEFAULT 3,
  ai_insight   TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────── INDEXES ───────────────
CREATE INDEX IF NOT EXISTS idx_players_team       ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_position   ON players(position);
CREATE INDEX IF NOT EXISTS idx_players_rating     ON players(rating DESC);
CREATE INDEX IF NOT EXISTS idx_players_value      ON players(market_value_num DESC);
CREATE INDEX IF NOT EXISTS idx_teams_league       ON teams(league);
CREATE INDEX IF NOT EXISTS idx_news_published     ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_trending      ON news(trending) WHERE trending = true;

-- ─────────────── ROW LEVEL SECURITY ───────────────
-- Публичное чтение для всех
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams   ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE news    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read leagues" ON leagues FOR SELECT USING (true);
CREATE POLICY "Public read teams"   ON teams   FOR SELECT USING (true);
CREATE POLICY "Public read players" ON players FOR SELECT USING (true);
CREATE POLICY "Public read news"    ON news    FOR SELECT USING (true);

-- Запись только через service_role (API сервер)
CREATE POLICY "Service write leagues" ON leagues FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write teams"   ON teams   FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write players" ON players FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write news"    ON news    FOR ALL USING (auth.role() = 'service_role');

-- ─────────────── STORAGE BUCKET ───────────────
-- Создай через Supabase Dashboard → Storage → New bucket
-- Bucket name: tiki-taka-media
-- Public: YES

-- ─────────────── SEED: LEAGUES ───────────────
INSERT INTO leagues (id, name, country, color) VALUES
  ('la_liga',        'La Liga',        'Spain',   '#EE2737'),
  ('premier_league', 'Premier League', 'England', '#3D185A'),
  ('bundesliga',     'Bundesliga',     'Germany', '#D50000'),
  ('serie_a',        'Serie A',        'Italy',   '#003189'),
  ('ligue_1',        'Ligue 1',        'France',  '#0055A4')
ON CONFLICT (id) DO NOTHING;
