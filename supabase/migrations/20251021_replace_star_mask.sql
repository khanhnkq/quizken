-- Migration: Replace '*' masks produced by earlier sanitizer with a stable placeholder "[removed]"
-- This fixes existing quiz rows where badwords were masked using sequences of '*' which
-- caused visible asterisks in returned quizzes. We replace runs of '*' with "[removed]".
-- Run with Supabase CLI or psql against your database.

BEGIN;

-- Titles
UPDATE quizzes
SET title = regexp_replace(coalesce(title, ''), '\*+', '[removed]', 'g')
WHERE coalesce(title, '') ~ '\*';

-- Descriptions
UPDATE quizzes
SET description = regexp_replace(coalesce(description, ''), '\*+', '[removed]', 'g')
WHERE coalesce(description, '') ~ '\*';

-- Prompt field (if stored)
UPDATE quizzes
SET prompt = regexp_replace(coalesce(prompt, ''), '\*+', '[removed]', 'g')
WHERE coalesce(prompt, '') ~ '\*';

-- Questions stored as JSONB: replace '*' runs inside the JSON text then cast back to jsonb
-- Note: This assumes the questions column is json/jsonb. If it's text, the cast still works.
UPDATE quizzes
SET questions = (regexp_replace(questions::text, '\*+', '[removed]', 'g'))::jsonb
WHERE questions::text ~ '\*';

COMMIT;
