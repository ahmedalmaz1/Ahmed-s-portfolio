-- Migration number: 0001 	 2026-11-11T14:00:15.183Z

CREATE TABLE profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT,
  bio TEXT,
  email TEXT,
  avatar_key TEXT,
  showreel_url TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO profile (id) VALUES (1);

CREATE TABLE social_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  toolkit TEXT DEFAULT '[]',
  youtube_url TEXT,
  cover_key TEXT,
  sort_order INTEGER DEFAULT 0,
  published INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_key TEXT NOT NULL,
  alt TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX idx_project_images_project ON project_images(project_id);