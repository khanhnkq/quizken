-- Allow 'cancelled' status in quizzes table
ALTER TABLE public.quizzes DROP CONSTRAINT IF EXISTS quizzes_status_check;

ALTER TABLE public.quizzes ADD CONSTRAINT quizzes_status_check
  CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired', 'cancelled'));
