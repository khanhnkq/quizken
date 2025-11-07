-- Create quiz_attempts table to track user quiz attempts and scores
-- This table will store each attempt a user makes at a quiz

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score DECIMAL(5,2) NOT NULL, -- Percentage score (0-100)
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  answers JSONB NOT NULL, -- Store user answers as JSON array
  time_taken_seconds INTEGER, -- Optional: time taken to complete quiz
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at ON public.quiz_attempts(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_score ON public.quiz_attempts(score DESC);

-- Composite index for user's recent attempts
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_completed ON public.quiz_attempts(user_id, completed_at DESC);

-- Enable RLS
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own attempts
CREATE POLICY "Users can view own quiz attempts" ON public.quiz_attempts
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own attempts
CREATE POLICY "Users can insert own quiz attempts" ON public.quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own attempts (if needed)
CREATE POLICY "Users can update own quiz attempts" ON public.quiz_attempts
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own attempts (if needed)
CREATE POLICY "Users can delete own quiz attempts" ON public.quiz_attempts
  FOR DELETE USING (auth.uid() = user_id);

-- Function to calculate user statistics
CREATE OR REPLACE FUNCTION get_user_statistics(user_uuid UUID)
RETURNS TABLE(
  total_quizzes_created BIGINT,
  total_quizzes_taken BIGINT,
  highest_score DECIMAL(5,2),
  average_score DECIMAL(5,2),
  total_time_taken_seconds BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::BIGINT FROM public.quizzes WHERE user_id = user_uuid) as total_quizzes_created,
    (SELECT COUNT(*)::BIGINT FROM public.quiz_attempts WHERE user_id = user_uuid) as total_quizzes_taken,
    COALESCE((SELECT MAX(score) FROM public.quiz_attempts WHERE user_id = user_uuid), 0) as highest_score,
    COALESCE((SELECT AVG(score) FROM public.quiz_attempts WHERE user_id = user_uuid), 0) as average_score,
    COALESCE((SELECT SUM(time_taken_seconds) FROM public.quiz_attempts WHERE user_id = user_uuid AND time_taken_seconds IS NOT NULL), 0) as total_time_taken_seconds;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's progress trend (last 30 days)
CREATE OR REPLACE FUNCTION get_user_progress_trend(user_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE(
  date DATE,
  quiz_count BIGINT,
  average_score DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(completed_at) as date,
    COUNT(*)::BIGINT as quiz_count,
    AVG(score) as average_score
  FROM public.quiz_attempts 
  WHERE user_id = user_uuid 
    AND completed_at >= TIMEZONE('utc'::text, NOW()) - INTERVAL '1 day' * days_back
  GROUP BY DATE(completed_at)
  ORDER BY date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's recent quiz attempts
CREATE OR REPLACE FUNCTION get_user_recent_attempts(user_uuid UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  attempt_id UUID,
  quiz_id UUID,
  quiz_title TEXT,
  score DECIMAL(5,2),
  total_questions INTEGER,
  correct_answers INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_taken_seconds INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    qa.id as attempt_id,
    qa.quiz_id,
    q.title as quiz_title,
    qa.score,
    qa.total_questions,
    qa.correct_answers,
    qa.completed_at,
    qa.time_taken_seconds
  FROM public.quiz_attempts qa
  JOIN public.quizzes q ON qa.quiz_id = q.id
  WHERE qa.user_id = user_uuid
  ORDER BY qa.completed_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_user_statistics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_progress_trend(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_recent_attempts(UUID, INTEGER) TO authenticated;

COMMENT ON TABLE public.quiz_attempts IS 'Track user quiz attempts with scores and completion data';
COMMENT ON FUNCTION get_user_statistics(UUID) IS 'Get comprehensive statistics for a user';
COMMENT ON FUNCTION get_user_progress_trend(UUID, INTEGER) IS 'Get user''s progress trend over specified days';
COMMENT ON FUNCTION get_user_recent_attempts(UUID, INTEGER) IS 'Get user''s recent quiz attempts';