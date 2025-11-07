-- Add user_id column to quizzes table to track quiz creators
-- This is needed for dashboard statistics

-- Add user_id column
ALTER TABLE public.quizzes 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for user_id
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON public.quizzes(user_id);

-- Update RLS policies to include user_id checks
DROP POLICY IF EXISTS "Enable read access for all users" ON public.quizzes;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.quizzes;
DROP POLICY IF EXISTS "Enable update for all users" ON public.quizzes;

-- New policies with user_id checks
CREATE POLICY "Users can view own quizzes" ON public.quizzes
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own quizzes" ON public.quizzes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quizzes" ON public.quizzes
  FOR UPDATE USING (auth.uid() = user_id);

-- Comment
COMMENT ON COLUMN public.quizzes.user_id IS 'Reference to the user who created this quiz';