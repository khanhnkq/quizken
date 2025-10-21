-- Add usage tracking columns to quizzes table
-- Track how many times a quiz has been used and PDFs downloaded

ALTER TABLE public.quizzes 
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS pdf_download_count INTEGER DEFAULT 0 NOT NULL;

-- Create index for sorting by usage_count
CREATE INDEX IF NOT EXISTS idx_quizzes_usage_count ON public.quizzes(usage_count DESC);

-- Create index for sorting by pdf_download_count
CREATE INDEX IF NOT EXISTS idx_quizzes_pdf_download_count ON public.quizzes(pdf_download_count DESC);

-- Function to increment usage count
CREATE OR REPLACE FUNCTION increment_quiz_usage(quiz_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.quizzes
  SET usage_count = usage_count + 1
  WHERE id = quiz_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment PDF download count
CREATE OR REPLACE FUNCTION increment_quiz_pdf_download(quiz_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.quizzes
  SET pdf_download_count = pdf_download_count + 1
  WHERE id = quiz_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated and anon users
GRANT EXECUTE ON FUNCTION increment_quiz_usage(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION increment_quiz_pdf_download(UUID) TO authenticated, anon;

COMMENT ON COLUMN public.quizzes.usage_count IS 'Số lần quiz được sử dụng (click nút Sử dụng)';
COMMENT ON COLUMN public.quizzes.pdf_download_count IS 'Số lần PDF được tải xuống';
