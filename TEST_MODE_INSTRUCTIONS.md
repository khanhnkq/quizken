# 🧪 Hướng Dẫn Test Mode - Save Quiz Attempt

## ⚠️ CẢNH BÁO QUAN TRỌNG

Code test này **CHỈ dùng để kiểm thử**, **KHÔNG được deploy lên production**.

## 🎯 Mục Đích

Cho phép test hàm [`saveQuizAttempt()`](src/components/quiz/QuizContent.tsx:40-74) khi user **chưa đăng nhập** bằng cách sử dụng test user ID.

## 📝 Thay Đổi Đã Thực Hiện

### File: [`src/components/quiz/QuizContent.tsx`](src/components/quiz/QuizContent.tsx:444-498)

**TRƯỚC (Production Code):**

```typescript
if (userId && answeredCount === quiz.questions.length) {
  // Chỉ save khi userId tồn tại
  await saveQuizAttempt(quiz.id, userId, ...);
}
```

**SAU (Test Mode):**

```typescript
// 🧪 TEST MODE: Temporarily allow testing without login
const testUserId = userId || "TEST_ANONYMOUS_USER_ID";

if (answeredCount === quiz.questions.length) {
  // Luôn gọi saveQuizAttempt, dùng test ID nếu chưa đăng nhập
  await saveQuizAttempt(quiz.id, testUserId, ...);
}
```

## 🧪 Cách Test

### Bước 1: Đảm Bảo Chưa Đăng Nhập

1. Mở ứng dụng tại http://localhost:5173
2. Đảm bảo **Sign Out** nếu đang đăng nhập
3. Verify không có user info hiển thị trên navbar

### Bước 2: Tạo và Làm Quiz

1. Tạo quiz với chủ đề bất kỳ (vẫn có thể tạo quiz khi chưa đăng nhập)
2. Trả lời tất cả câu hỏi
3. Nhấn nút **"Chấm điểm"**

### Bước 3: Kiểm Tra Console Logs

Mở DevTools Console (F12), bạn sẽ thấy:

```
🧪 [TEST MODE] saveQuizAttempt called with: {
  quizId: "abc-123-...",
  userId: "TEST_ANONYMOUS_USER_ID",
  isTestMode: true,
  score: 8,
  totalQuestions: 10,
  correctAnswers: 8,
  userAnswers: [0, 1, 2, 0, 1, 2, 0, 1, 2, 0],
  timeTaken: 145
}
❌ Failed to save quiz attempt
⚠️ [TEST MODE] This will fail because TEST_ANONYMOUS_USER_ID doesn't exist in database
```

### Bước 4: Hiểu Kết Quả

**Kỳ vọng:** Hàm `saveQuizAttempt()` **SẼ ĐƯỢC GỌI** nhưng **SẼ THẤT BẠI** vì:

- ✅ Hàm được gọi với `testUserId = "TEST_ANONYMOUS_USER_ID"`
- ❌ Database sẽ reject vì user ID này không tồn tại trong `auth.users`
- ❌ Supabase RLS policies sẽ chặn insert

**Console logs chứng minh:**

- ✅ Hàm `saveQuizAttempt()` được gọi (có log `🧪 [TEST MODE] saveQuizAttempt called with:`)
- ✅ Code flow hoạt động đúng
- ❌ Database insert fail (expected behavior)

## 🔍 Kết Quả Mong Đợi

| Tình Huống         | Hàm được gọi? | Database insert | Console log                    |
| ------------------ | ------------- | --------------- | ------------------------------ |
| **Chưa đăng nhập** | ✅ Có         | ❌ Fail         | `🧪 [TEST MODE]` + `❌ Failed` |
| **Đã đăng nhập**   | ✅ Có         | ✅ Success      | `✅ saved successfully`        |

## 📊 So Sánh Với Production Code

### Test Mode (Hiện Tại)

```typescript
const testUserId = userId || "TEST_ANONYMOUS_USER_ID";
if (answeredCount === quiz.questions.length) {
  // Luôn gọi hàm
  await saveQuizAttempt(quiz.id, testUserId, ...);
}
```

- ✅ Hàm được gọi cho cả logged-in và anonymous users
- ❌ Database insert sẽ fail cho anonymous users (expected)
- ✅ Có thể test code flow hoàn chỉnh

### Production Code (Cần Restore)

```typescript
if (userId && answeredCount === quiz.questions.length) {
  // Chỉ gọi khi đã đăng nhập
  await saveQuizAttempt(quiz.id, userId, ...);
}
```

- ✅ Chỉ gọi khi user đã đăng nhập
- ✅ Tránh unnecessary database calls
- ✅ Logic nghiệp vụ đúng

## 🔄 Restore Production Code

**SAU KHI TEST XONG**, phải restore lại code production:

```typescript
// XÓA test code này:
const testUserId = userId || "TEST_ANONYMOUS_USER_ID";
if (answeredCount === quiz.questions.length) {

// KHÔI PHỤC code này:
if (userId && answeredCount === quiz.questions.length) {
```

Hoặc chạy git để revert:

```bash
git checkout src/components/quiz/QuizContent.tsx
```

## ⚠️ LƯU Ý QUAN TRỌNG

### 🚫 KHÔNG ĐƯỢC:

- ❌ Commit test code này lên Git
- ❌ Deploy test code lên production
- ❌ Để test code chạy lâu dài
- ❌ Share test code với end users

### ✅ NÊN:

- ✅ Chỉ dùng test code trên local development
- ✅ Restore production code sau khi test xong
- ✅ Document kết quả test
- ✅ Verify logs trong console

## 📝 Checklist Sau Khi Test

- [ ] Đã test với anonymous user
- [ ] Đã verify logs trong console
- [ ] Đã hiểu tại sao database insert fail
- [ ] **Đã restore production code**
- [ ] Đã verify production code hoạt động đúng với logged-in user

## 🎓 Bài Học

Test này chứng minh rằng:

1. **Code flow đúng**: Hàm `saveQuizAttempt()` có thể được gọi
2. **Logic nghiệp vụ đúng**: Cần `userId` hợp lệ để lưu vào database
3. **Database security đúng**: RLS policies ngăn invalid user_id
4. **Production code đúng**: Điều kiện `if (userId && ...)` là cần thiết

## 📞 Hỗ Trợ

Nếu cần thêm hướng dẫn hoặc gặp vấn đề, hãy liên hệ!
