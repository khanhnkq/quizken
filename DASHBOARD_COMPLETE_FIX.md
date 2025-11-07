# 🚀 Hướng Dẫn Hoàn Chỉnh - Dashboard Không Hiển Thị Dữ Liệu

## 📋 Tình Trạng

- ✅ RLS policies đã disable
- ❌ Dashboard vẫn không hiển thị dữ liệu

## 🔍 Nguyên Nhân Chính

**Seed data chưa được insert vào database!**

Bước này QUAN TRỌNG - nếu không có test data, dashboard sẽ hiển thị trống.

## ✅ Giải Pháp - 3 Bước

### Bước 1: Kiểm Tra Test User Có Tồn Tại

Vào **Supabase Dashboard → SQL Editor** và chạy:

```sql
SELECT id, email FROM auth.users WHERE email = 'test@quizken.local';
```

**Nếu không trả về hàng nào = Seed data chưa được insert**

### Bước 2: Kiểm Tra Quizzes

```sql
SELECT COUNT(*) as total_quizzes FROM public.quizzes;
SELECT COUNT(*) as user_quizzes FROM public.quizzes WHERE user_id = 'test-user-id';
```

**Nếu kết quả = 0 = Cần insert seed data**

### Bước 3: Insert Seed Data

#### Cách 1: Dùng psql Command (Nếu Có Terminal)

```bash
# Trong terminal, chạy:
psql $SUPABASE_DB_URL -f supabase/seed_dashboard_data.sql
```

#### Cách 2: Copy-Paste Vào SQL Editor (Khuyến Nghị)

1. Mở file: `supabase/seed_dashboard_data.sql`
2. Copy **TẤT CẢ** nội dung
3. Vào **Supabase Dashboard → SQL Editor**
4. Paste toàn bộ nội dung
5. Click **Run** (hoặc Ctrl+Enter)

#### Cách 3: Insert Từng Phần

Nếu gặp lỗi, chạy từng phần:

```sql
-- Phần 1: Tạo test user
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, confirmed_at
) VALUES (
  'test-user-id',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'test@quizken.local',
  '$2a$10$K8ZpdrjwzUWSTmtyYoNb6uj1.kNc3RQHQ3p3qNIYFvXJhBczQ1yO',
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Test User"}',
  false,
  NOW(),
  NOW(),
  NOW()
);

-- Phần 2: Tạo 5 quizzes
INSERT INTO public.quizzes (id, title, description, prompt, questions, prompt_tokens, candidates_tokens, total_tokens, user_id, created_at, expires_at) VALUES
  ('550e8400-e29b-4d34-b602-805ebf1c123', 'Toán Lớp 1', 'Quiz về toán cơ bản lớp 1', NULL, '[{"question": "1 + 1 = ?", "options": ["1", "2", "3", "4"], "correctAnswer": 1, "explanation": "1 + 1 = 2"}]', 100, 200, 300, 'test-user-id', NOW() - INTERVAL '5 days', NOW() + INTERVAL '5 days'),
  ('550e8400-e29b-4d34-b602-805ebf1c124', 'Vật Lý Lớp 2', 'Quiz về vật lý lớp 2', NULL, '[{"question": "Lực là gì?", "options": ["Đẩy", "Kéo", "Quay", "Nén"], "correctAnswer": 0, "explanation": "Lực là tác nhân gây ra sự thay đổi chuyển động"}]', 150, 250, 400, 'test-user-id', NOW() - INTERVAL '4 days', NOW() + INTERVAL '5 days'),
  ('550e8400-e29b-4d34-b602-805ebf1c125', 'Hóa Học Lớp 3', 'Quiz về hóa học lớp 3', NULL, '[{"question": "H2O là gì?", "options": ["Nước", "Oxi", "Hidro", "CO2"], "correctAnswer": 0, "explanation": "H2O là công thức hóa của nước"}]', 120, 180, 300, 'test-user-id', NOW() - INTERVAL '3 days', NOW() + INTERVAL '5 days'),
  ('550e8400-e29b-4d34-b602-805ebf1c126', 'Lịch Sử Lớp 4', 'Quiz về lịch sử lớp 4', NULL, '[{"question": "Năm nào Bác Hồ qua đời?", "options": ["1890", "1940", "1969", "1975"], "correctAnswer": 1, "explanation": "Bác Hồ qua đời năm 1890"}]', 80, 120, 200, 'test-user-id', NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days'),
  ('550e8400-e29b-4d34-b602-805ebf1c127', 'Địa Lý Lớp 5', 'Quiz về địa lý lớp 5', NULL, '[{"question": "Thủ đô của Việt Nam là gì?", "options": ["Hà Nội", "TP.HCM", "Đà Nẵng", "Hải Phòng"], "correctAnswer": 0, "explanation": "Thủ đô của Việt Nam là Hà Nội"}]', 90, 150, 240, 'test-user-id', NOW() - INTERVAL '1 day', NOW() + INTERVAL '5 days');

-- Phần 3: Tạo 10 quiz attempts
INSERT INTO public.quiz_attempts (id, quiz_id, user_id, score, total_questions, correct_answers, answers, time_taken_seconds, completed_at, created_at) VALUES
  ('attempt-001', '550e8400-e29b-4d34-b602-805ebf1c123', 'test-user-id', 85.0, 1, 1, '[1]', 180, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('attempt-002', '550e8400-e29b-4d34-b602-805ebf1c124', 'test-user-id', 70.0, 1, 1, '[0]', 120, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  ('attempt-003', '550e8400-e29b-4d34-b602-805ebf1c125', 'test-user-id', 92.5, 1, 1, '[0]', 240, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('attempt-004', '550e8400-e29b-4d34-b602-805ebf1c126', 'test-user-id', 60.0, 1, 1, '[1]', 150, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  ('attempt-005', '550e8400-e29b-4d34-b602-805ebf1c127', 'test-user-id', 95.0, 1, 1, '[0]', 90, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('attempt-006', '550e8400-e29b-4d34-b602-805ebf1c124', 'test-user-id', 88.0, 1, 1, '[0]', 200, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours'),
  ('attempt-007', '550e8400-e29b-4d34-b602-805ebf1c125', 'test-user-id', 75.0, 1, 1, '[0]', 165, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),
  ('attempt-008', '550e8400-e29b-4d34-b602-805ebf1c126', 'test-user-id', 82.5, 1, 1, '[1]', 195, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),
  ('attempt-009', '550e8400-e29b-4d34-b602-805ebf1c127', 'test-user-id', 90.0, 1, 1, '[0]', 135, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
  ('attempt-010', '550e8400-e29b-4d34-b602-805ebf1c124', 'test-user-id', 87.5, 1, 1, '[0]', 210, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour');
```

## 🔄 Sau Khi Insert Seed Data

1. **Refresh Dashboard**: `Ctrl+F5` hoặc `Cmd+Shift+R`
2. **Xóa browser cache** nếu cần
3. **Reload page**

## ✅ Kiểm Tra Lại

Chạy query này để xác minh dữ liệu:

```sql
-- Xác minh tất cả dữ liệu đã insert
SELECT
  (SELECT COUNT(*) FROM auth.users WHERE email = 'test@quizken.local') as users_count,
  (SELECT COUNT(*) FROM public.quizzes WHERE user_id = 'test-user-id') as quizzes_count,
  (SELECT COUNT(*) FROM public.quiz_attempts WHERE user_id = 'test-user-id') as attempts_count,
  (SELECT MAX(score) FROM public.quiz_attempts WHERE user_id = 'test-user-id') as max_score;
```

**Kết quả mong đợi:**

- users_count = 1
- quizzes_count = 5
- attempts_count = 10
- max_score = 95.0

## 🎯 Dashboard Sẽ Hiển Thị

Sau khi insert seed data thành công:

- **Quiz đã tạo**: 5 ✅
- **Quiz đã làm**: 10 ✅
- **Điểm cao nhất**: 95.0% ✅
- **Biểu đồ xu hướng**: Các data points từ quá khứ
- **Danh sách gần đây**: 10 quiz attempts

## ⚠️ Lỗi Có Thể Gặp

### Lỗi: "duplicate key value violates unique constraint"

**Nguyên nhân**: Dữ liệu đã tồn tại
**Giải pháp**: Xóa dữ liệu cũ trước

```sql
DELETE FROM public.quiz_attempts WHERE user_id = 'test-user-id';
DELETE FROM public.quizzes WHERE user_id = 'test-user-id';
DELETE FROM auth.users WHERE id = 'test-user-id';
```

Sau đó chạy lại insert seed data.

### Lỗi: "ERROR: role 'postgres' does not have access"

**Nguyên nhân**: Permissions chưa được set
**Giải pháp**: Sử dụng SQL Editor trong Supabase Dashboard (không dùng psql)

## 📞 Nếu Vẫn Gặp Vấn Đề

1. Kiểm tra browser console (F12) có error không?
2. Kiểm tra Supabase logs
3. Verify seed data đã được insert: `SELECT * FROM public.quizzes LIMIT 1;`
4. Verify functions hoạt động: `SELECT * FROM get_user_statistics('test-user-id');`
5. Hard refresh page
