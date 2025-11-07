# 📝 Hướng Dẫn: Lưu Quiz Attempts Khi Người Dùng Hoàn Thành Quiz

## 🎯 Vấn Đề

Khi người dùng hoàn thành quiz, kết quả **không được lưu** vào table `quiz_attempts`, do đó:

- Dashboard không cập nhật số quiz đã làm
- Điểm không được ghi lại
- Xu hướng tiến bộ không cập nhật

## 🔍 Nguyên Nhân

Ứng dụng chưa có code để **insert quiz attempts** vào database khi user finish quiz.

## ✅ Giải Pháp

### Bước 1: Tìm Component Xử Lý Quiz Completion

Tìm file xử lý kết quả quiz (thường là `QuizContent.tsx` hoặc tương tự).

### Bước 2: Thêm Function Lưu Quiz Attempt

Thêm function này vào component xử lý quiz:

```typescript
import { supabase } from "@/integrations/supabase/client";

async function saveQuizAttempt(
  quizId: string,
  userId: string,
  score: number,
  totalQuestions: number,
  correctAnswers: number,
  answers: any[],
  timeTakenSeconds: number
) {
  try {
    const { data, error } = await supabase.from("quiz_attempts").insert([
      {
        quiz_id: quizId,
        user_id: userId,
        score: score, // 0-100
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        answers: answers, // JSON array of user answers
        time_taken_seconds: timeTakenSeconds,
        completed_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Error saving quiz attempt:", error);
      return false;
    }

    console.log("Quiz attempt saved:", data);
    return true;
  } catch (err) {
    console.error("Unexpected error:", err);
    return false;
  }
}
```

### Bước 3: Gọi Function Khi Quiz Kết Thúc

Tìm nơi xử lý việc submit/complete quiz và thêm call:

```typescript
// Khi user submit quiz results
const handleSubmitQuiz = async (results: QuizResults) => {
  // Calculate results
  const score = (results.correctAnswers / results.totalQuestions) * 100;

  // Save to database
  const saved = await saveQuizAttempt(
    quizId,
    userId,
    score,
    results.totalQuestions,
    results.correctAnswers,
    results.userAnswers,
    results.timeTaken
  );

  if (saved) {
    // Show success message
    console.log("Quiz results saved!");
    // Optionally redirect or refresh dashboard
  }
};
```

## 📊 Database Schema

Table `quiz_attempts` có các fields:

```sql
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  score DECIMAL(5,2) NOT NULL,           -- 0-100
  total_questions INTEGER NOT NULL,       -- Số câu trong quiz
  correct_answers INTEGER NOT NULL,       -- Số câu đúng
  answers JSONB NOT NULL,                 -- Câu trả lời của user
  time_taken_seconds INTEGER,             -- Thời gian làm quiz
  completed_at TIMESTAMP DEFAULT NOW(),   -- Khi hoàn thành
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔄 Flow Hoàn Chỉnh

```
User completes quiz
    ↓
Calculate score & results
    ↓
saveQuizAttempt()
    ↓
INSERT INTO quiz_attempts
    ↓
Dashboard refreshes
    ↓
Statistics updated
```

## 🧪 Kiểm Tra

Sau khi implement, làm quiz và kiểm tra:

1. **Mở Supabase SQL Editor**
2. **Chạy query:**

```sql
SELECT id, quiz_id, user_id, score, completed_at
FROM public.quiz_attempts
WHERE user_id = 'current-user-id'
ORDER BY completed_at DESC;
```

3. **Nếu có hàng mới = Thành công!**

## 📱 Test Cases

1. ✅ Người dùng làm quiz
2. ✅ Submit kết quả
3. ✅ Kiểm tra quiz_attempts table có record mới
4. ✅ Dashboard cập nhật số "Quiz đã làm"
5. ✅ Điểm cao nhất được cập nhật

## ⚠️ Lỗi Có Thể Gặp

### "duplicate key value violates unique constraint"

- Nguyên nhân: Cố gắng insert với ID đã tồn tại
- Giải pháp: ID nên là UUID mới (auto-generate)

### "user_id không hợp lệ"

- Nguyên nhân: user_id không tồn tại trong auth.users
- Giải pháp: Kiểm tra auth.uid() có giá trị không

### "quiz_id không hợp lệ"

- Nguyên nhân: quiz_id không tồn tại trong quizzes table
- Giải pháp: Kiểm tra quiz tồn tại trước khi save attempt

## 🎯 Kỳ Vọng Sau Khi Implement

✅ Mỗi lần user làm quiz xong:

- Record được thêm vào `quiz_attempts`
- Dashboard tự động update
- Số "Quiz đã làm" tăng lên
- "Điểm cao nhất" được update nếu có điểm mới cao hơn
- "Xu hướng tiến bộ" có data point mới

## 📞 Cần Hỗ Trợ

Nếu không tìm thấy nơi xử lý quiz completion:

1. Tìm component `QuizContent.tsx`
2. Tìm function `handleSubmit` hoặc `onComplete`
3. Thêm code save attempt vào đó
