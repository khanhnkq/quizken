-- Migration: Add function to get detailed quiz attempt information
-- This function will return comprehensive details about a quiz attempt including questions and user answers

-- Function to get detailed quiz attempt information
CREATE OR REPLACE FUNCTION get_quiz_attempt_detail(attempt_uuid UUID, user_uuid UUID)
RETURNS TABLE(
  attempt_id UUID,
  quiz_id UUID,
  quiz_title TEXT,
  quiz_description TEXT,
  quiz_prompt TEXT,
  quiz_questions JSONB,
  user_answers JSONB,
  score NUMERIC(5,2),
  total_questions INTEGER,
  correct_answers INTEGER,
  time_taken_seconds INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  quiz_category TEXT,
  quiz_difficulty TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    qa.id as attempt_id,
    qa.quiz_id,
    q.title as quiz_title,
    q.description as quiz_description,
    q.prompt as quiz_prompt,
    q.questions as quiz_questions,
    qa.answers as user_answers,
    qa.score,
    qa.total_questions,
    qa.correct_answers,
    qa.time_taken_seconds,
    qa.completed_at,
    qa.created_at,
    q.category as quiz_category,
    q.difficulty as quiz_difficulty
  FROM public.quiz_attempts qa
  JOIN public.quizzes q ON qa.quiz_id = q.id
  WHERE qa.id = attempt_uuid 
    AND qa.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_quiz_attempt_detail(UUID, UUID) TO authenticated;

COMMENT ON FUNCTION get_quiz_attempt_detail(UUID, UUID) IS 'Get detailed information about a specific quiz attempt including questions and user answers';