-- Add idempotency key to prevent duplicate quiz creation
-- This prevents users from creating duplicate quizzes due to double-clicks or network issues

-- Add idempotency_key column to quizzes table
ALTER TABLE public.quizzes 
ADD COLUMN IF NOT EXISTS idempotency_key text;

-- Create unique index on idempotency_key to prevent duplicates
-- Only allow one quiz per idempotency key
CREATE UNIQUE INDEX IF NOT EXISTS idx_quizzes_idempotency_key 
ON public.quizzes (idempotency_key) 
WHERE idempotency_key IS NOT NULL;

-- Add comment explaining the column's purpose
COMMENT ON COLUMN public.quizzes.idempotency_key IS 
'Idempotency key to prevent duplicate quiz creation from double-clicks or network retries. Generated from user_id + prompt + timestamp_minute hash.';

-- Create function to check for recent duplicate requests
CREATE OR REPLACE FUNCTION check_duplicate_quiz_request(
  p_idempotency_key text,
  p_minutes_threshold integer DEFAULT 5
)
RETURNS TABLE(quiz_id uuid, created_at timestamptz) AS $$
BEGIN
  -- Check if a quiz with the same idempotency key was created recently
  RETURN QUERY
  SELECT q.id, q.created_at
  FROM public.quizzes q
  WHERE q.idempotency_key = p_idempotency_key
    AND q.created_at > NOW() - INTERVAL '1 minute' * p_minutes_threshold
  ORDER BY q.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service role (used by Edge Functions)
GRANT EXECUTE ON FUNCTION check_duplicate_quiz_request(text, integer) TO service_role;

-- Add comment explaining the function's purpose
COMMENT ON FUNCTION check_duplicate_quiz_request(text, integer) IS 
'Check if a quiz with the same idempotency key was created within the specified time threshold to prevent duplicate requests.';
