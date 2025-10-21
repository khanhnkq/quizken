-- Add category system to quizzes table
-- Support multiple categories/tags per quiz

-- Create enum type for predefined categories
CREATE TYPE quiz_category AS ENUM (
  'education',      -- Học tập
  'research',       -- Nghiên cứu
  'science',        -- Khoa học
  'entertainment',  -- Giải trí
  'trivia',         -- Đố vui
  'language',       -- Ngôn ngữ
  'math',           -- Toán học
  'history',        -- Lịch sử
  'geography',      -- Địa lý
  'literature',     -- Văn học
  'technology',     -- Công nghệ
  'business',       -- Kinh doanh
  'health',         -- Sức khỏe
  'sports',         -- Thể thao
  'arts',           -- Nghệ thuật
  'music',          -- Âm nhạc
  'general'         -- Tổng hợp
);

-- Add category column (single primary category)
ALTER TABLE public.quizzes 
ADD COLUMN IF NOT EXISTS category quiz_category DEFAULT 'general' NOT NULL;

-- Add tags column (multiple tags as JSONB array)
ALTER TABLE public.quizzes 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add difficulty level
ALTER TABLE public.quizzes 
ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium';

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS idx_quizzes_category ON public.quizzes(category);
CREATE INDEX IF NOT EXISTS idx_quizzes_tags ON public.quizzes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_quizzes_difficulty ON public.quizzes(difficulty);

-- Create index for category + is_public (common query pattern)
CREATE INDEX IF NOT EXISTS idx_quizzes_category_public ON public.quizzes(category, is_public) WHERE is_public = true;

COMMENT ON COLUMN public.quizzes.category IS 'Chủ đề chính của quiz';
COMMENT ON COLUMN public.quizzes.tags IS 'Các tag/từ khóa bổ sung cho quiz';
COMMENT ON COLUMN public.quizzes.difficulty IS 'Độ khó: easy, medium, hard';
