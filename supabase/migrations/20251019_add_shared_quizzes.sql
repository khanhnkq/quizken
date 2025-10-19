-- Thêm tính năng bài tập dùng chung cho multiple users
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Tạo index để tìm kiếm quiz public nhanh hơn
CREATE INDEX IF NOT EXISTS idx_quizzes_is_public ON public.quizzes(is_public) WHERE is_public = true;

-- Cập nhật RLS policies để cho phép users xem quiz public (không bao gồm quiz private của họ)
-- Note: này sẽ override policies cũ, nhưng giữ logic cũ cho quiz private

-- Drop các policies cũ cho quiz
DROP POLICY IF EXISTS "Users can view own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can insert own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can update own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can delete own quizzes" ON public.quizzes;

-- Policy mới: Users có thể xem quiz public + quiz của mình
CREATE POLICY "Users can view public quizzes and own quizzes" ON public.quizzes
  FOR SELECT USING (
    is_public = true OR
    user_id = auth.uid()
  );

-- Policy: Users chỉ có thể tạo quiz cho chính mình
CREATE POLICY "Users can insert own quizzes" ON public.quizzes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users chỉ có thể update quiz của mình
CREATE POLICY "Users can update own quizzes" ON public.quizzes
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users chỉ có thể delete quiz của mình
CREATE POLICY "Users can delete own quizzes" ON public.quizzes
  FOR DELETE USING (auth.uid() = user_id);
