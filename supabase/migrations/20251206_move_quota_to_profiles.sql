-- Add daily quiz quota tracking columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS daily_quiz_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_daily_reset DATE DEFAULT CURRENT_DATE;

-- Create index for performance might be overkill for this, but good practice if needed later
-- CREATE INDEX IF NOT EXISTS idx_profiles_quota ON public.profiles(user_id); 
-- (Actually user_id is PK so it's indexed)

COMMENT ON COLUMN public.profiles.daily_quiz_count IS 'Tracks number of quizzes created today';
COMMENT ON COLUMN public.profiles.last_daily_reset IS 'Date of the last quota reset';
