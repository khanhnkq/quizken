-- Create a table to track user daily usage
CREATE TABLE IF NOT EXISTS public.user_daily_usage (
    user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
    daily_count INTEGER DEFAULT 0,
    last_reset_date DATE DEFAULT CURRENT_DATE
);

-- Enable RLS
ALTER TABLE public.user_daily_usage ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own usage
CREATE POLICY "Users can read own daily usage"
    ON public.user_daily_usage
    FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role (Edge Functions) can update usage
-- (Implicitly managed by service role key bypassing RLS, but explicit denial for users is good practice if needed, though default is deny all for update)

-- Function to check and increment usage
CREATE OR REPLACE FUNCTION check_and_increment_user_usage(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_count INTEGER;
    last_date DATE;
    limit_val INTEGER := 5; -- Daily limit
    result_json JSONB;
BEGIN
    -- Get current usage record, initializing if not exists
    SELECT daily_count, last_reset_date INTO current_count, last_date
    FROM public.user_daily_usage
    WHERE user_id = p_user_id;

    -- If no record, insert and set count to 1 (first use)
    IF NOT FOUND THEN
        INSERT INTO public.user_daily_usage (user_id, daily_count, last_reset_date)
        VALUES (p_user_id, 1, CURRENT_DATE);
        RETURN jsonb_build_object('allowed', true, 'count', 1, 'remaining', limit_val - 1);
    END IF;

    -- If date changed, reset count
    IF last_date < CURRENT_DATE THEN
        UPDATE public.user_daily_usage
        SET daily_count = 1, last_reset_date = CURRENT_DATE
        WHERE user_id = p_user_id;
        RETURN jsonb_build_object('allowed', true, 'count', 1, 'remaining', limit_val - 1);
    END IF;

    -- Check limit
    IF current_count >= limit_val THEN
        RETURN jsonb_build_object('allowed', false, 'count', current_count, 'remaining', 0);
    ELSE
        UPDATE public.user_daily_usage
        SET daily_count = current_count + 1
        WHERE user_id = p_user_id;
        RETURN jsonb_build_object('allowed', true, 'count', current_count + 1, 'remaining', limit_val - (current_count + 1));
    END IF;
END;
$$;
