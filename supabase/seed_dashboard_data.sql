-- Seed data for testing dashboard functionality
-- This file creates sample data for a test user

-- Insert sample quizzes for testing dashboard
INSERT INTO public.quizzes (
  id, title, description, prompt, questions,
  prompt_tokens, candidates_tokens, total_tokens,
  user_id, created_at, expires_at
) VALUES
  ('550e8400-e29b-4d34-b602-805ebf1c123', 'Toán Lớp 1', 'Quiz về toán cơ bản lớp 1',
   NULL,
   '[{"question": "1 + 1 = ?", "options": ["1", "2", "3", "4"], "correctAnswer": 1, "explanation": "1 + 1 = 2"}]',
   100, 200, 300,
   'test-user-id', NOW() - INTERVAL '5 days', NOW() + INTERVAL '5 days'),

  ('550e8400-e29b-4d34-b602-805ebf1c124', 'Vật Lý Lớp 2', 'Quiz về vật lý lớp 2',
   NULL,
   '[{"question": "Lực là gì?", "options": ["Đẩy", "Kéo", "Quay", "Nén"], "correctAnswer": 0, "explanation": "Lực là tác nhân gây ra sự thay đổi chuyển động"}]',
   150, 250, 400,
   'test-user-id', NOW() - INTERVAL '4 days', NOW() + INTERVAL '5 days'),

  ('550e8400-e29b-4d34-b602-805ebf1c125', 'Hóa Học Lớp 3', 'Quiz về hóa học lớp 3',
   NULL,
   '[{"question": "H2O là gì?", "options": ["Nước", "Oxi", "Hidro", "CO2"], "correctAnswer": 0, "explanation": "H2O là công thức hóa của nước"}]',
   120, 180, 300,
   'test-user-id', NOW() - INTERVAL '3 days', NOW() + INTERVAL '5 days'),

  ('550e8400-e29b-4d34-b602-805ebf1c126', 'Lịch Sử Lớp 4', 'Quiz về lịch sử lớp 4',
   NULL,
   '[{"question": "Năm nào Bác Hồ qua đời?", "options": ["1890", "1940", "1969", "1975"], "correctAnswer": 1, "explanation": "Bác Hồ qua đời năm 1890"}]',
   80, 120, 200,
   'test-user-id', NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days'),

  ('550e8400-e29b-4d34-b602-805ebf1c127', 'Địa Lý Lớp 5', 'Quiz về địa lý lớp 5',
   NULL,
   '[{"question": "Thủ đô của Việt Nam là gì?", "options": ["Hà Nội", "TP.HCM", "Đà Nẵng", "Hải Phòng"], "correctAnswer": 0, "explanation": "Thủ đô của Việt Nam là Hà Nội"}]',
   90, 150, 240,
   'test-user-id', NOW() - INTERVAL '1 day', NOW() + INTERVAL '5 days');

-- Insert sample quiz attempts
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

-- Create a test user in auth.users (this would normally be done via auth)
-- Note: In production, this would be created through the normal auth flow
-- For testing purposes, we'll assume the user ID exists: test-user-id
-- Create a test user in auth.users (this would normally be done via auth)
-- Note: In production, this would be created through the normal auth flow
-- For testing purposes, we'll create a test user directly

-- Insert test user into auth.users table
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  confirmed_at,
  created_at,
  updated_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at
) VALUES (
  'test-user-id',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'test@quizken.local',
  -- This is a hashed password for "password123" (for testing only)
  '$2a$10$K8ZpdrjwzUWSTmtyYoNb6uj1.kNc3RQHQ3p3qNIYFvXJhBczQ1yO',
  NOW(),
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Test User"}',
  false,
  NULL,
  NULL,
  NULL
);

-- Insert user profile into public.users table (if it exists)
-- This depends on your user profile table structure
-- Uncomment and adjust if you have a users table
/*
INSERT INTO public.users (
  id,
  email,
  name,
  created_at,
  updated_at
) VALUES (
  'test-user-id',
  'test@quizken.local',
  'Test User',
  NOW(),
  NOW()
);
*/