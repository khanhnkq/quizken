-- Fix anonymous usage race condition with atomic UPSERT
-- This migration adds a function to atomically increment anonymous usage
-- and prevent race conditions when multiple users hit quota limits simultaneously

-- Create function for atomic anonymous usage increment
CREATE OR REPLACE FUNCTION increment_anonymous_usage(
  p_ip text,
  p_fingerprint text,
  p_day_date date,
  p_user_agent text
)
RETURNS TABLE(count integer) AS $$
DECLARE
  result_count integer;
BEGIN
  -- Use atomic UPSERT to prevent race conditions
  -- This ensures only one request can increment the counter at a time
  INSERT INTO public.anonymous_usage (ip, fingerprint, day_date, count, user_agent, last_used_at)
  VALUES (p_ip, p_fingerprint, p_day_date, 1, p_user_agent, NOW())
  ON CONFLICT (ip, fingerprint, day_date) 
  DO UPDATE SET 
    count = anonymous_usage.count + 1,
    last_used_at = NOW(),
    user_agent = EXCLUDED.user_agent
  RETURNING anonymous_usage.count INTO result_count;
  
  -- Return the count for quota checking
  RETURN QUERY SELECT result_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service role (used by Edge Functions)
GRANT EXECUTE ON FUNCTION increment_anonymous_usage(text, text, date, text) TO service_role;

-- Add comment explaining the function's purpose
COMMENT ON FUNCTION increment_anonymous_usage(text, text, date, text) IS 
'Atomically increment anonymous usage count to prevent race conditions when multiple users hit quota limits simultaneously. Returns the new count after increment.';
