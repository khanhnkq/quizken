-- Thêm user_id column và cập nhật policies cho authentication
ALTER TABLE public.quizzes ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Tạo index cho user_id để tối ưu performance
CREATE INDEX idx_quizzes_user_id ON public.quizzes(user_id);

-- Cập nhật RLS policies để bảo mật theo user
DROP POLICY "Enable read access for all users" ON public.quizzes;
DROP POLICY "Enable insert for all users" ON public.quizzes;
DROP POLICY "Enable update for all users" ON public.quizzes;

-- Policy: Users chỉ có thể xem quiz của chính mình
CREATE POLICY "Users can view own quizzes" ON public.quizzes
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users chỉ có thể tạo quiz cho chính mình
CREATE POLICY "Users can insert own quizzes" ON public.quizzes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users chỉ có thể sửa quiz của chính mình
CREATE POLICY "Users can update own quizzes" ON public.quizzes
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users chỉ có thể xóa quiz của chính mình
CREATE POLICY "Users can delete own quizzes" ON public.quizzes
  FOR DELETE USING (auth.uid() = user_id);

-- Tạo function để cleanup expired quizzes của user đã xóa
CREATE OR REPLACE FUNCTION delete_expired_and_orphaned_quizzes()
RETURNS void AS $$
BEGIN
  -- Xóa quiz hết hạn
  DELETE FROM public.quizzes
  WHERE expires_at < TIMEZONE('utc'::text, NOW());

  -- Xóa quiz của users đã bị xóa khỏi auth.users
  DELETE FROM public.quizzes q
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = q.user_id
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION delete_expired_and_orphaned_quizzes() IS 'Clean up expired quizzes and quizzes from deleted users';
