# Quiz Detail Page Setup Guide

## Overview

Đây là hướng dẫn setup và test cho trang chi tiết quiz attempt mới. Trang này cho phép người dùng xem chi tiết về kết quả quiz đã làm, bao gồm câu trả lời, giải thích và thống kê.

## Files đã tạo/thay đổi

### 1. Types

- `src/types/quizAttempt.ts` - Định nghĩa types cho QuizAttemptDetail, QuizAttemptAnswer, QuizAttemptSummary

### 2. Hooks

- `src/hooks/useQuizAttemptDetail.ts` - Hook để fetch chi tiết quiz attempt

### 3. Components

- `src/pages/QuizDetailPage.tsx` - Trang chính hiển thị chi tiết quiz attempt

### 4. Database

- `supabase/migrations/20251110_add_quiz_attempt_detail_function.sql` - RPC function để lấy chi tiết quiz

### 5. Routing

- `src/App.tsx` - Thêm route `/quiz/:attemptId`
- `src/components/dashboard/RecentQuizzes.tsx` - Cập nhật nút "Xem" để điều hướng

## Setup Steps

### 1. Database Migration

Chạy migration để tạo RPC function:

```bash
cd supabase
npx supabase db push
```

Hoặc chạy SQL trực tiếp trong Supabase Dashboard:

```sql
-- Copy nội dung từ file 20251110_add_quiz_attempt_detail_function.sql
```

### 2. Kiểm tra Route

Route mới đã được thêm vào App.tsx:

```tsx
<Route path="/quiz/:attemptId" element={<QuizDetailPage />} />
```

### 3. Test Flow

1. Đăng nhập vào ứng dụng
2. Vào Dashboard (`/dashboard`)
3. Trong bảng "Quiz gần đây", click nút "Xem" của một quiz attempt
4. Sẽ được điều hướng đến `/quiz/:attemptId`

## Features

### Authentication & Authorization

- Trang yêu cầu đăng nhập
- Chỉ user tạo attempt mới có thể xem chi tiết
- Sử dụng RLS policies để bảo vệ dữ liệu

### UI Components

- **Header**: Hiển thị tiêu đề quiz và nút quay lại
- **Score Card**: Hiển thị điểm số và đánh giá
- **Statistics Card**: Thời gian làm, ngày làm, thời gian trung bình/câu
- **Answer Details**: Danh sách câu hỏi với:
  - Đáp án của user
  - Đáp án đúng (nếu sai)
  - Giải thích (nếu có)
  - Icon đúng/sai

### Loading & Error States

- Skeleton loading khi fetch data
- Error messages cho các trường hợp:
  - Không tìm thấy attempt
  - Không có quyền truy cập
  - Lỗi server

### Responsive Design

- Mobile-friendly layout
- Grid responsive cho statistics
- Scrollable cho danh sách câu hỏi dài

## Testing Checklist

### Basic Functionality

- [ ] Điều hướng từ Dashboard đến trang chi tiết
- [ ] Hiển thị đúng thông tin quiz
- [ ] Hiển thị đúng câu trả lời và kết quả
- [ ] Nút quay lại hoạt động

### Authentication

- [ ] Chưa đăng nhập -> redirect về trang chủ
- [ ] User khác không thể xem attempt của người khác
- [ ] User có thể xem attempt của chính mình

### Edge Cases

- [ ] Attempt ID không tồn tại -> hiển thị lỗi
- [ ] Attempt ID invalid -> hiển thị lỗi
- [ ] Network error -> hiển thị lỗi
- [ ] Loading state hoạt động đúng

### UI/UX

- [ ] Responsive trên mobile
- [ ] Animations hoạt động mượt
- [ ] Colors và icons đúng theo design system
- [ ] Loading skeletons match final layout

## Troubleshooting

### Common Issues

1. **"Quiz attempt not found or access denied"**

   - Kiểm tra user đã đăng nhập chưa
   - Kiểm tra attempt ID có đúng không
   - Kiểm tra RLS policies

2. **RPC function not found**

   - Chạy migration lại
   - Kiểm tra function name trong database

3. **Route not working**

   - Kiểm tra App.tsx có route đúng chưa
   - Restart development server

4. **Type errors**
   - Kiểm tra import paths
   - Kiểm tra types definition

### Debug Steps

1. Mở browser dev tools
2. Kiểm tra network requests
3. Kiểm tra console logs
4. Verify database queries

## Future Enhancements

1. **Export to PDF**: Cho phép export kết quả
2. **Share Results**: Chia sẻ kết quả với người khác
3. **Compare Attempts**: So sánh các lần làm quiz
4. **Analytics**: Thống kê chi tiết hơn
5. **Retake Quiz**: Làm lại quiz từ trang kết quả

## Notes

- Sử dụng React Router cho navigation
- GSAP cho animations (với accessibility check)
- Supabase RLS cho security
- TypeScript cho type safety
- Tailwind CSS cho styling
