# Sửa lỗi điều hướng trong chế độ Flashcard

## Vấn đề

Khi ở chế độ flashcard, người dùng không thể điều hướng đến các trang khác (thư viện, giới thiệu, v.v.) bằng cách nhấp vào các liên kết trong navbar. URL thay đổi nhưng nội dung trang không được cập nhật, người dùng vẫn ở trong chế độ flashcard.

## Nguyên nhân gốc rễ

Vấn đề được gây ra bởi hai xung đột chính:

1. **Xung đột DOM ID với ScrollSmoother**:

   - FlashcardView sử dụng các ID `#smooth-wrapper` và `#smooth-content` cho cấu trúc DOM của nó
   - Toàn bộ ứng dụng cũng sử dụng các ID này cho ScrollSmoother (xem trong `src/pages/Index.tsx`)
   - Khi FlashcardView được render, nó tạo ra các phần tử với cùng ID, gây xung đột với ScrollSmoother đã được khởi tạo

2. **Xử lý sự kiện bàn phím quá rộng**:
   - Hook `useFlashcard` bắt tất cả các sự kiện bàn phím trên toàn bộ trang
   - Điều này có thể can thiệp vào các phím tắt của trình duyệt và điều hướng

## Giải pháp

### 1. Thay đổi cấu trúc DOM trong FlashcardView

**File:** `src/components/flashcard/FlashcardView.tsx`

Thay đổi từ ID sang class:

```tsx
// Trước đây (dòng 106-107)
<div id="smooth-wrapper">
  <div id="smooth-content">

// Sau khi sửa
<div className="flashcard-wrapper">
  <div className="flashcard-content">
```

### 2. Cải thiện xử lý sự kiện bàn phím

**File:** `src/hooks/useFlashcard.ts`

Thêm kiểm tra để chỉ xử lý sự kiện khi target nằm trong flashcard:

```tsx
// Thêm kiểm tra target
const target = event.target as Element;
const isInsideFlashcard = target?.closest(
  ".flashcard-wrapper, .flashcard-content"
);

// Chỉ xử lý khi bên trong flashcard
if (!isInsideFlashcard) return;
```

### 3. Thêm CSS cho class mới

**File:** `src/components/flashcard/flashcard.css`

Thêm styles cho các class mới:

```css
.flashcard-wrapper {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100vh;
}

.flashcard-content {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}
```

## Kết quả

Sau khi áp dụng các thay đổi này:

1. FlashcardView không còn xung đột với ScrollSmoother của toàn bộ ứng dụng
2. Sự kiện bàn phím chỉ được xử lý khi người dùng đang tương tác với flashcard
3. Điều hướng giữa các trang hoạt động bình thường ngay cả khi ở chế độ flashcard
4. Người dùng có thể nhấp vào các liên kết trong navbar để chuyển trang

## Kiểm tra

Để kiểm tra xem sửa lỗi có hoạt động không:

1. Mở một bài quiz
2. Nhấp vào nút "Flashcard" để chuyển sang chế độ flashcard
3. Thử nhấp vào các liên kết trong navbar (Thư viện, Giới thiệu, v.v.)
4. Xác nhận rằng trang chuyển đổi đúng cách và nội dung được cập nhật

## Tệp đã thay đổi

- `src/components/flashcard/FlashcardView.tsx`
- `src/hooks/useFlashcard.ts`
- `src/components/flashcard/flashcard.css`
- `src/hooks/useQuizStore.ts`
- `src/components/quiz/QuizGenerator.tsx`
- `src/hooks/useFlashcardPersistence.ts`

## Cập nhật bổ sung: Giải quyết vấn đề quiz biến mất khi chuyển trang

### Vấn đề

Khi người dùng chuyển sang các trang khác (thư viện, giới thiệu, v.v.) và quay lại, quiz đang được làm biến mất vì trạng thái không được lưu giữ.

### Giải pháp

1. **Thêm persist vào useQuizStore**:

   - Sử dụng zustand persist middleware để lưu trạng thái quiz vào localStorage
   - Chỉ lưu các trường quan trọng: quiz, userAnswers, showResults, tokenUsage

2. **Cập nhật QuizGenerator.tsx**:

   - Thay thế useState cục bộ bằng useQuizStore
   - Import và sử dụng useQuizStore hook

3. **Tạo useFlashcardPersistence.ts**:
   - Hook riêng để quản lý lưu/khôi phục trạng thái flashcard
   - Sử dụng sessionStorage cho trạng thái flashcard tạm thời

### Kết quả

- Trạng thái quiz được lưu tự động khi người dùng điều hướng
- Khi quay lại trang quiz, trạng thái được khôi phục
- Cả quiz và flashcard đều giữ được trạng thái khi chuyển trang
