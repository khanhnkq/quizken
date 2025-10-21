-- Change category from ENUM to TEXT for unlimited flexibility
-- Allow AI to generate any category name dynamically

-- Step 1: Add new TEXT column for flexible categories
ALTER TABLE public.quizzes 
ADD COLUMN IF NOT EXISTS category_text TEXT;

-- Step 2: Migrate existing enum data to text
UPDATE public.quizzes 
SET category_text = category::TEXT 
WHERE category IS NOT NULL;

-- Step 3: Set default for new records
ALTER TABLE public.quizzes 
ALTER COLUMN category_text SET DEFAULT 'general';

-- Step 4: Drop old enum column and constraint
ALTER TABLE public.quizzes 
DROP COLUMN IF EXISTS category CASCADE;

-- Step 5: Rename new column to category
ALTER TABLE public.quizzes 
RENAME COLUMN category_text TO category;

-- Step 6: Make it NOT NULL
ALTER TABLE public.quizzes 
ALTER COLUMN category SET NOT NULL;

-- Step 7: Drop the old enum type (no longer needed)
DROP TYPE IF EXISTS quiz_category CASCADE;

-- Step 8: Create index for the new text-based category
CREATE INDEX IF NOT EXISTS idx_quizzes_category_text ON public.quizzes(category);

-- Step 9: Add index for category filtering with is_public
CREATE INDEX IF NOT EXISTS idx_quizzes_category_public_text 
ON public.quizzes(category, is_public) 
WHERE is_public = true;

COMMENT ON COLUMN public.quizzes.category IS 'Chủ đề quiz - AI tự động generate (flexible TEXT, không giới hạn)';

-- Optional: Create a view for popular categories (analytics)
CREATE OR REPLACE VIEW popular_categories AS
SELECT 
  category,
  COUNT(*) as quiz_count,
  SUM(usage_count) as total_usage,
  AVG(usage_count) as avg_usage_per_quiz
FROM public.quizzes
WHERE is_public = true
GROUP BY category
ORDER BY quiz_count DESC;

COMMENT ON VIEW popular_categories IS 'Analytics view showing popular AI-generated categories';
