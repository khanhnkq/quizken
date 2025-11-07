# Hướng dẫn kiểm tra chức năng lưu Quiz Attempts

## Mục tiêu

Kiểm tra xem khi người dùng hoàn thành quiz, dữ liệu có được lưu vào bảng `quiz_attempts` trong Supabase không.

## Các bước đã thực hiện

### 1. Cập nhật QuizContent.tsx

- ✅ Thêm import supabase
- ✅ Thêm function `saveQuizAttempt` để lưu dữ liệu vào bảng `quiz_attempts`
- ✅ Cập nhật `QuizContentProps` để nhận `userId`
- ✅ Cập nhật `onGrade` handler để gọi `saveQuizAttempt` trước khi hiển thị kết quả

### 2. Cập nhật QuizGenerator.tsx

- ✅ Truyền `userId` vào component `QuizContent`

## Cách kiểm tra

### Bước 1: Đăng nhập vào ứng dụng

1. Mở ứng dụng tại http://localhost:5173
2. Đăng nhập với tài khoản người dùng

### Bước 2: Tạo và làm quiz

1. Tạo một quiz mới với chủ đề bất kỳ
2. Trả lời tất cả các câu hỏi
3. Nhấn nút "Nộp bài" hoặc "Chấm điểm"

### Bước 3: Kiểm tra console

Mở Developer Tools (F12) và kiểm tra tab Console:

- ✅ Nếu thành công: "✅ Quiz attempt saved successfully"
- ❌ Nếu thất bại: "❌ Error saving quiz attempt: [chi tiết lỗi]"

### Bước 4: Kiểm tra database

1. Vào Supabase Dashboard
2. Mở Table Editor cho bảng `quiz_attempts`
3. Kiểm tra xem có bản ghi mới được tạo không với:
   - `user_id`: ID của người dùng hiện tại
   - `quiz_id`: ID của quiz vừa làm
   - `score`: Điểm số đạt được
   - `completed_at`: Thời gian hoàn thành

### Bước 5: Kiểm tra Dashboard

1. Điều hướng đến trang Dashboard
2. Kiểm tra xem thống kê có được cập nhật không:
   - Số quiz đã làm tăng lên 1
   - Điểm cao nhất được cập nhật (nếu cao hơn điểm cũ)
   - Quiz vừa làm xuất hiện trong danh sách "Quiz gần đây"

## Dữ liệu được lưu

Khi người dùng hoàn thành quiz, các thông tin sau được lưu:

```typescript
{
  quiz_id: string,           // ID của quiz
  user_id: string,           // ID của người dùng
  score: number,             // Điểm số (số câu đúng)
  total_questions: number,    // Tổng số câu hỏi
  correct_answers: number,    // Số câu trả lời đúng
  answers: number[],         // Mảng các câu trả lời của người dùng
  time_taken_seconds: number, // Thời gian làm bài (giây)
  completed_at: string       // Thời gian hoàn thành (ISO string)
}
```

## Troubleshooting

### Lỗi "PGRST116" (No rows returned)

- **Nguyên nhân**: Bảng `quiz_attempts` không tồn tại hoặc không có quyền truy cập
- **Giải pháp**: Chạy migration để tạo bảng và RLS policies

### Lỗi "permission denied"

- **Nguyên nhân**: RLS policy chặn truy cập
- **Giải pháp**: Kiểm tra RLS policies trong Supabase

### Không thấy dữ liệu trong Dashboard

- **Nguyên nhân**: Function `get_user_statistics` không được cập nhật
- **Giải pháp**: Kiểm tra function trong Supabase và đảm bảo nó trả về đúng dữ liệu

### userId không được truyền

- **Nguyên nhân**: Người dùng chưa đăng nhập
- **Giải pháp**: Đảm bảo người dùng đã đăng nhập trước khi làm quiz

## Log để debug

Trong console, tìm các log sau:

- `saveQuizAttempt called with:` - Hiển thị dữ liệu đầu vào
- `✅ Quiz attempt saved successfully` - Lưu thành công
- `❌ Error saving quiz attempt:` - Chi tiết lỗi
- `saveQuizAttempt response:` - Phản hồi từ Supabase

## Next steps

Sau khi xác nhận chức năng hoạt động:

1. Thêm loading state khi lưu quiz attempt
2. Thêm retry mechanism nếu lưu thất bại
3. Thêm analytics để theo dõi tỷ lệ thành công
4. Thêm validation cho dữ liệu trước khi lưu
