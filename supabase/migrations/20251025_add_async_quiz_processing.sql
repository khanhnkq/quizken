-- Add async quiz processing support
-- Add status tracking columns to quizzes table

ALTER TABLE public.quizzes
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed'
  CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
ADD COLUMN IF NOT EXISTS session_id UUID,
ADD COLUMN IF NOT EXISTS progress TEXT,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
ADD COLUMN IF NOT EXISTS question_count INTEGER DEFAULT 15;

-- Add index for efficient status queries
CREATE INDEX IF NOT EXISTS idx_quizzes_status ON public.quizzes(status);
CREATE INDEX IF NOT EXISTS idx_quizzes_session_id ON public.quizzes(session_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON public.quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_status_user ON public.quizzes(user_id, status) WHERE user_id IS NOT NULL;

-- Update RLS policies to allow reading own quizzes for authenticated users
DROP POLICY IF EXISTS "Enable read access for all users" ON public.quizzes;
CREATE POLICY "Enable read access for all users" ON public.quizzes FOR SELECT USING (
  -- Anyone can read completed and public quizzes (existing logic)
  status = 'completed' OR
  -- Authenticated users can read their own quizzes in any status
  (user_id = auth.uid() AND user_id IS NOT NULL)
);

-- Update insert policy
DROP POLICY IF EXISTS "Enable insert for all users" ON public.quizzes;
CREATE POLICY "Enable insert for all users" ON public.quizzes FOR INSERT WITH CHECK (true);

-- Update update policy to allow users to update their own quizzes
DROP POLICY IF EXISTS "Enable update for all users" ON public.quizzes;
CREATE POLICY "Enable update for all users" ON public.quizzes FOR UPDATE USING (
  -- Anonymous users can still update for now (backwards compatibility)
  user_id IS NULL OR
  -- Authenticated users can update their own quizzes
  user_id = auth.uid()
);

-- Function to update updated_at timestamp on status changes
CREATE OR REPLACE FUNCTION update_quiz_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS quiz_status_updated_trigger ON public.quizzes;
CREATE TRIGGER quiz_status_updated_trigger
  BEFORE UPDATE OF status ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION update_quiz_updated_at();

-- Clean up function to handle expired quizzes
CREATE OR REPLACE FUNCTION cleanup_expired_quizzes()
RETURNS void AS $$
BEGIN
  -- Mark expired quizzes
  UPDATE public.quizzes
  SET status = 'expired', updated_at = TIMEZONE('utc'::text, NOW())
  WHERE expires_at < TIMEZONE('utc'::text, NOW())
    AND status NOT IN ('expired', 'failed');

  -- Delete very old quizzes (30+ days)
  DELETE FROM public.quizzes
  WHERE expires_at < (TIMEZONE('utc'::text, NOW()) - INTERVAL '30 days');
END;
$$ LANGUAGE plpgsql;

-- Create cleanup schedule (requires pg_cron or manual execution)
-- SELECT cron.schedule('cleanup-expired-quizzes', '0 2 * * *', 'SELECT cleanup_expired_quizzes();');

COMMENT ON COLUMN public.quizzes.status IS 'Quiz processing status: pending, processing, completed, failed, expired';
COMMENT ON COLUMN public.quizzes.session_id IS 'Unique session identifier for tracking quiz generations';
COMMENT ON COLUMN public.quizzes.progress IS 'Progress message for async quiz generation';
COMMENT ON COLUMN public.quizzes.user_id IS 'User who owns this quiz (for auth tracking)';
COMMENT ON COLUMN public.quizzes.updated_at IS 'Last status update timestamp';
