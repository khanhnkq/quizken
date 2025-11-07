# 🔧 Hướng Dẫn Sửa Vấn Đề Dashboard

## 🚨 Vấn Đề: Dashboard Không Hiển Thị Dữ Liệu

Nếu dashboard không hiển thị số quiz đã làm và điểm cao nhất, hãy làm theo các bước sau:

## 📋 Nguyên Nhân

1. **RLS Policies chặn truy cập**: Policies hiện tại quá nghiêm ngặt
2. **Migration chưa được chạy đầy đủ**: Cần chạy migrations theo đúng thứ tự
3. **Seed data chưa được insert**: Test data chưa có trong database

## ✅ Các Bước Sửa

### Bước 1: Xóa RLS Policies Cũ

Vào Supabase Dashboard → SQL Editor → Chạy query sau:

```sql
-- Cách 1: Disable RLS tạm thời để debug (NHANH NHẤT)
ALTER TABLE public.quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts DISABLE ROW LEVEL SECURITY;
```

**Nếu gặp lỗi policy đã tồn tại, chỉ cần DROP tất cả policies cũ:**

```sql
-- Xóa tất cả policies trên quizzes
DROP POLICY IF EXISTS "Users can view own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can insert own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can update own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.quizzes;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.quizzes;
DROP POLICY IF EXISTS "Enable update for all users" ON public.quizzes;

-- Xóa tất cả policies trên quiz_attempts
DROP POLICY IF EXISTS "Users can view own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Users can insert own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Users can update own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Users can delete own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Enable update for all users" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.quiz_attempts;

-- Sau đó disable RLS
ALTER TABLE public.quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts DISABLE ROW LEVEL SECURITY;
```

### Bước 2: Kiểm Tra Seed Data

Vào SQL Editor và chạy:

```sql
-- Kiểm tra test user
SELECT id, email FROM auth.users WHERE id = 'test-user-id' LIMIT 1;

-- Kiểm tra quizzes
SELECT id, title, user_id FROM public.quizzes LIMIT 5;

-- Kiểm tra quiz_attempts
SELECT id, quiz_id, user_id, score FROM public.quiz_attempts LIMIT 10;

-- Kiểm tra function
SELECT * FROM get_user_statistics('test-user-id');
```

### Bước 3: Insert Seed Data Lại (QUAN TRỌNG)

**Kiểm tra xem seed data đã được insert chưa:**

```sql
-- Kiểm tra test user trong auth.users
SELECT id, email FROM auth.users WHERE email = 'test@quizken.local';

-- Nếu không có, data chưa được insert
-- Chạy seed file để insert tất cả dữ liệu
```

**Nếu seed data chưa có, chạy lại seed file:**

```bash
psql $SUPABASE_DB_URL -f supabase/seed_dashboard_data.sql
```

Hoặc copy nội dung `supabase/seed_dashboard_data.sql` và paste vào SQL Editor.

**Lưu ý**: File này sẽ tạo:

- ✅ 1 test user: `test@quizken.local` / `password123`
- ✅ 5 quizzes
- ✅ 10 quiz attempts

### Bước 4: Kiểm Tra User ID

Đảm bảo Dashboard.tsx dùng đúng user ID:

```tsx
// src/pages/Dashboard.tsx - Line 34
setUserId("test-user-id"); // Dùng test-user-id
```

### Bước 5: Kiểm Tra Network Requests

1. Mở DevTools (F12)
2. Vào tab Network
3. Truy cập `/dashboard`
4. Tìm requests đến `/functions/v1/get_user_statistics`
5. Kiểm tra response - có phải lỗi không?

## 🔍 Debug Tips

### Kiểm Tra Functions Hoạt Động

```sql
-- Test function trực tiếp
SELECT * FROM get_user_statistics('test-user-id');

-- Xem log errors
SELECT * FROM pg_stat_statements
WHERE query LIKE '%get_user_statistics%'
ORDER BY calls DESC;
```

### Kiểm Tra RLS Status

```sql
-- Xem RLS enabled/disabled status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname='public'
ORDER BY tablename;

-- Xem tất cả policies
SELECT tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public';
```

### Kiểm Tra Data Consistency

```sql
-- Đếm tất cả quiz
SELECT COUNT(*) as total_quizzes FROM public.quizzes;

-- Đếm quiz cho user test-user-id
SELECT COUNT(*) as user_quizzes FROM public.quizzes WHERE user_id = 'test-user-id';

-- Đếm attempts
SELECT COUNT(*) as total_attempts FROM public.quiz_attempts;

-- Đếm attempts cho user test-user-id
SELECT COUNT(*) as user_attempts FROM public.quiz_attempts WHERE user_id = 'test-user-id';

-- Highest score
SELECT MAX(score) as max_score FROM public.quiz_attempts WHERE user_id = 'test-user-id';
```

## 🚀 Giải Pháp Nhanh

Nếu vẫn không hoạt động, thử:

1. **Disable tất cả RLS**:

```sql
ALTER TABLE public.quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts DISABLE ROW LEVEL SECURITY;
```

2. **Refresh page** sau khi sửa

3. **Check browser console** cho error messages

4. **Clear cache**: Ctrl+F5 (Hard refresh)

## ⚠️ Lưu Ý

- **Development**: Có thể disable RLS tạm thời
- **Production**: Luôn enable RLS với policies đúng
- **SECURITY DEFINER Functions**: Bypass RLS, nên xài cho admin functions

## 📞 Nếu Vẫn Gặp Vấn Đề

1. Kiểm tra console log (F12)
2. Kiểm tra Supabase logs
3. Verify migrations chạy thành công
4. Verify seed data được insert
5. Test functions trong SQL Editor
