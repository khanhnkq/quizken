-- Migration: Add attempts and last_attempt_at to quizzes table
-- Run with Supabase CLI or psql against your database
BEGIN;

ALTER TABLE IF EXISTS quizzes
  ADD COLUMN IF NOT EXISTS attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_attempt_at timestamp with time zone NULL;

-- Optional: add index to speed queries filtering by attempts or last attempt
CREATE INDEX IF NOT EXISTS idx_quizzes_last_attempt_at ON quizzes (last_attempt_at);

COMMIT;
