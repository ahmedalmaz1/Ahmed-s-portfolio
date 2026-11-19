PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE IF NOT EXISTS "d1_migrations"(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(1,'0001_init.sql','2026-11-13 19:40:45');
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
INSERT INTO "profile" ("id","name","bio","email","avatar_key","showreel_key","showreel_poster_key","updated_at") VALUES(1,'Ahmed Almaz',replace('I''m Ahmed Almaz, an environment artist focused on cinematic scenes and real-time worlds. I care about atmosphere: how a wet street reflects a neon sign, how fog swallows a distant skyline.\n\nFrom blockout and lighting to final cinematic camera work, I take scenes from the first idea to a polished shot that feels like a frame from a film.','\n',char(10)),'ahmedalmaz@ahmedalmaz.com','avatars/28c66764-0b72-4942-b4ea-7742b9980cb6.webp','showreel/b02557b5-edfc-47df-95eb-d61fe5bdcf3a.mp4',NULL,'2026-11-16 13:13:08');
CREATE TABLE social_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "social_links" ("id","platform","url","sort_order") VALUES(6,'ArtStation','https://www.artstation.com/ahmedalmaz',0);
INSERT INTO "social_links" ("id","platform","url","sort_order") VALUES(7,'LinkedIn','https://www.linkenin.com/ahmedalmaz',1);
INSERT INTO "social_links" ("id","platform","url","sort_order") VALUES(8,'Instagram','https://www.instagram.com/ahmedalmaz3d/',2);
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
INSERT INTO "projects" ("id","slug","title","description","toolkit","poster_key","poster_thumb_key","youtube_id","sort_order","published","created_at","updated_at") VALUES(2,'neonalley','Black Ops 6','A rain-soaked back street where wet asphalt and flickering signs carry the whole mood of the shot.','["Unreal Engine 5","Lumen","Sequencer","Blender"]','projects/ab18b1f1-4ee7-4f24-a517-9b05a0e00ce2.webp','projects/ab18b1f1-4ee7-4f24-a517-9b05a0e00ce2_thumb.webp','lzzSor1NSu8',0,1,'2026-11-15 16:40:22','2026-11-15 18:36:31');
INSERT INTO "projects" ("id","slug","title","description","toolkit","poster_key","poster_thumb_key","youtube_id","sort_order","published","created_at","updated_at") VALUES(3,'zome-clean','Zome Clean','Test Project','["Unreal Engine","Blender"]','projects/6488d1d6-0f5d-4ffc-87ad-e6f92e95b3a6.webp','projects/6488d1d6-0f5d-4ffc-87ad-e6f92e95b3a6_thumb.webp','VJKqROFFI3M',1,1,'2026-11-15 18:42:06','2026-11-15 18:42:06');
INSERT INTO "projects" ("id","slug","title","description","toolkit","poster_key","poster_thumb_key","youtube_id","sort_order","published","created_at","updated_at") VALUES(4,'test','Test','This is a test project','["Unreal Engine"]','projects/b9a00321-12cb-4e7c-b5cc-5472f06bf4a2.webp','projects/b9a00321-12cb-4e7c-b5cc-5472f06bf4a2_thumb.webp',NULL,2,1,'2026-11-15 19:29:46','2026-11-15 20:15:25');
INSERT INTO "projects" ("id","slug","title","description","toolkit","poster_key","poster_thumb_key","youtube_id","sort_order","published","created_at","updated_at") VALUES(5,'test11','Test11','','[]','projects/647dda93-53b3-4345-b3d2-0b8bd6ee2a39.webp','projects/647dda93-53b3-4345-b3d2-0b8bd6ee2a39_thumb.webp',NULL,3,1,'2026-11-15 20:15:45','2026-11-15 20:15:45');
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
INSERT INTO "project_images" ("id","project_id","image_key","thumb_key","width","height","alt","sort_order") VALUES(1,2,'projects/b299f58b-7dd8-4cb3-b1bd-4b089043fd62.webp','projects/b299f58b-7dd8-4cb3-b1bd-4b089043fd62_thumb.webp',1920,1080,'',3);
INSERT INTO "project_images" ("id","project_id","image_key","thumb_key","width","height","alt","sort_order") VALUES(2,2,'projects/a92eab18-1049-4520-b326-2cebf4d940e8.webp','projects/a92eab18-1049-4520-b326-2cebf4d940e8_thumb.webp',1920,1080,'',0);
INSERT INTO "project_images" ("id","project_id","image_key","thumb_key","width","height","alt","sort_order") VALUES(3,2,'projects/ecba4a0c-64d9-4ec1-953a-eb79e5413dcb.webp','projects/ecba4a0c-64d9-4ec1-953a-eb79e5413dcb_thumb.webp',1920,823,'',2);
CREATE TABLE login_attempts (
  ip TEXT PRIMARY KEY,
  failures INTEGER NOT NULL DEFAULT 0,
  locked_until INTEGER NOT NULL DEFAULT 0,        -- unix seconds
  updated_at INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "login_attempts" ("ip","failures","locked_until","updated_at") VALUES('197.43.218.235',1,0,1794706571);
INSERT INTO "login_attempts" ("ip","failures","locked_until","updated_at") VALUES('154.176.83.138',1,0,1794847169);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('d1_migrations',1);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('projects',5);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('social_links',10);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('project_images',4);
CREATE INDEX idx_projects_published_sort ON projects (published, sort_order, id);
CREATE INDEX idx_project_images_project ON project_images (project_id, sort_order, id);
