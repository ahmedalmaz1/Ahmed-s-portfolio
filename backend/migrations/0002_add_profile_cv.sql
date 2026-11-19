-- Adds the CV (PDF) reference to the profile.
--
-- Safe by design:
--   * additive only: no existing column, row or index is touched
--   * nullable with no default: existing rows simply get NULL
--   * the PDF itself lives in R2 (cv/<uuid>.pdf); only its key is stored here
--
-- Not idempotent (SQLite has no "ADD COLUMN IF NOT EXISTS"): run it once.
-- Rename the 0002 prefix if your migrations folder already uses that number.
ALTER TABLE profile ADD COLUMN cv_key TEXT;
