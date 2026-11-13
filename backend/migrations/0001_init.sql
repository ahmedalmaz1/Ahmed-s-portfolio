-- Portfolio schema (v1). Apply with: wrangler d1 migrations apply portfolio-db [--local|--remote]

CREATE TABLE profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),          -- single-row table
  name TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  email TEXT,
  avatar_key TEXT,
  showreel_key TEXT,                              -- mp4 stored in R2
  showreel_poster_key TEXT,                       -- image shown before the video plays
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO profile (id) VALUES (1);

CREATE TABLE social_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  toolkit TEXT NOT NULL DEFAULT '[]',             -- JSON array of tool names
  poster_key TEXT,
  poster_thumb_key TEXT,
  youtube_id TEXT,                                -- 11-char video id; the frontend builds the embed URL
  sort_order INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_projects_published_sort ON projects (published, sort_order, id);

CREATE TABLE project_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  image_key TEXT NOT NULL,
  thumb_key TEXT,
  width INTEGER,
  height INTEGER,
  alt TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_project_images_project ON project_images (project_id, sort_order, id);

-- Brute-force protection for POST /login (keyed by client IP)
CREATE TABLE login_attempts (
  ip TEXT PRIMARY KEY,
  failures INTEGER NOT NULL DEFAULT 0,
  locked_until INTEGER NOT NULL DEFAULT 0,        -- unix seconds
  updated_at INTEGER NOT NULL DEFAULT 0
);
