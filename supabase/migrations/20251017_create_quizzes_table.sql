-- Create quizzes table for storing generated quiz data
CREATE TABLE public.quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL, -- Save the original user prompt
  questions JSONB NOT NULL, -- Store quiz questions as JSON
  -- Token usage tracking
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  candidates_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (TIMEZONE('utc'::text, NOW()) + INTERVAL '5 days') NOT NULL
);

-- Indexes for better performance
CREATE INDEX idx_quizzes_created_at ON public.quizzes(created_at DESC);
CREATE INDEX idx_quizzes_expires_at ON public.quizzes(expires_at);
-- Note: idx_quizzes_user_id will be created in the next migration after adding user_id column

-- RLS Policies
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read their own quizzes (we'll add user_id later when implementing auth)
-- For now, allow read access for all (since we don't have auth yet)
CREATE POLICY "Enable read access for all users" ON public.quizzes
  FOR SELECT USING (true);

-- Policy: Anyone can insert quizzes (for data generation)
CREATE POLICY "Enable insert for all users" ON public.quizzes
  FOR INSERT WITH CHECK (true);

-- Policy: Anyone can update their own quizzes
CREATE POLICY "Enable update for all users" ON public.quizzes
  FOR UPDATE USING (true);

-- Function to automatically delete expired quizzes
CREATE OR REPLACE FUNCTION delete_expired_quizzes()
RETURNS void AS $$
BEGIN
  DELETE FROM public.quizzes
  WHERE expires_at < TIMEZONE('utc'::text, NOW());
END;
$$ LANGUAGE plpgsql;

-- Setup a cron job to run cleanup daily (requires pg_cron extension)
-- SELECT cron.schedule('delete-expired-quizzes', '0 0 * * *', 'SELECT delete_expired_quizzes();');
