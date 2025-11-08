# Chẩn đoán Lỗi: Maximum Update Depth Exceeded

## 📋 Tóm tắt vấn đề

Lỗi "Maximum update depth exceeded" xảy ra khi sử dụng Flashcard mode, cho thấy có vòng lặp vô hạn trong việc cập nhật state.

## 🔍 Phân tích nguyên nhân

### ✅ Nguyên nhân chính (Khả năng cao nhất):

**1. Vòng lặp vô hạn trong useEffect dependencies** (`src/hooks/useFlashcard.ts:238-244`)

```typescript
useEffect(() => {
  if (quiz) {
    initializeSession(quiz); // Function này được tạo lại mỗi render
  } else {
    clearSession(); // Function này cũng được tạo lại
  }
}, [quiz, initializeSession, clearSession]); // ❌ Vấn đề: dependencies không ổn định
```

**Vấn đề:**

- `initializeSession` và `clearSession` được tạo bằng `useCallback`
- Nhưng chúng phụ thuộc vào `state.session` (thông qua closure)
- Mỗi khi `state` thay đổi → callbacks được tạo lại
- → useEffect chạy lại → gọi `initializeSession`
- → setState → state thay đổi → callbacks được tạo lại
- → **VÒNG LẶP VÔ HẠN**

**2. Tất cả useCallback phụ thuộc vào state không ổn định**

Các functions sau đều có vấn đề tương tự:

- `goToPrevious`: phụ thuộc `[state.session]`
- `goToNext`: phụ thuộc `[state.session]`
- `goToCard`: phụ thuộc `[state.session]`
- `toggleFlip`: phụ thuộc `[state.session]`
- `resetSession`: phụ thuộc `[state.session]`
- `clearSession`: phụ thuộc `[state.session]`

### 🔧 Các nguyên nhân phụ khác:

3. **useEffect keyboard navigation** - Dependencies thay đổi liên tục
4. **Event listener trong FlashcardView** - `goToCard` thay đổi mỗi render
5. **localStorage operations** - Save mỗi lần state change có thể gây lag

## 📊 Logs được thêm vào để xác nhận

Tôi đã thêm logging vào các điểm sau:

### `src/hooks/useFlashcard.ts`:

1. ✅ State changes monitor (dòng ~27)
2. ✅ `initializeSession` calls (dòng ~38)
3. ✅ `goToPrevious` calls (dòng ~127)
4. ✅ `goToNext` calls (dòng ~149)
5. ✅ `toggleFlip` calls (dòng ~200)
6. ✅ useEffect init trigger (dòng ~250)
7. ✅ Keyboard navigation setup (dòng ~264)

### `src/components/flashcard/FlashcardView.tsx`:

1. ✅ Event listener setup/cleanup (dòng ~44-58)
2. ✅ goToCard event received (dòng ~49)

## 🧪 Cách kiểm tra và xác nhận chẩn đoán

### Bước 1: Mở Console và kiểm tra logs

1. Mở Developer Tools (F12)
2. Chuyển sang tab Console
3. Chạy ứng dụng và mở Flashcard mode
4. Quan sát console logs

### Bước 2: Xác nhận vấn đề

Nếu thấy các logs sau **lặp lại liên tục không dừng**, đó chính là vòng lặp vô hạn:

```
[DEBUG] State changed { hasSession: true, currentIndex: 0, ... }
[DEBUG] useFlashcard init effect triggered { hasQuiz: true, ... }
[DEBUG] initializeSession called { quizId: "...", ... }
[DEBUG] State changed { hasSession: true, currentIndex: 0, ... }
[DEBUG] useFlashcard init effect triggered { hasQuiz: true, ... }
[DEBUG] initializeSession called { quizId: "...", ... }
... (lặp lại vô hạn)
```

### Bước 3: Đếm số lần logs

- Nếu trong vòng **5 giây** mà logs xuất hiện **>50 lần** → Xác nhận vòng lặp vô hạn
- Chú ý đặc biệt đến:
  - `[DEBUG] useFlashcard init effect triggered` - Không nên trigger nhiều lần
  - `[DEBUG] initializeSession called` - Chỉ nên gọi 1 lần khi mở flashcard
  - `[DEBUG] State changed` - Không nên thay đổi liên tục khi không có tương tác

## ✅ Kết quả mong đợi (khi chưa có tương tác):

Khi mở Flashcard lần đầu, chỉ nên thấy:

```
[DEBUG] useFlashcard init effect triggered (1 lần)
[DEBUG] initializeSession called (1 lần)
[DEBUG] State changed (1-2 lần)
[DEBUG] Keyboard navigation effect setup (1 lần)
[DEBUG] FlashcardView goToCard event listener setup (1 lần)
```

## 📝 Hành động tiếp theo

**Sau khi xác nhận vấn đề qua logs**, tôi sẽ:

1. ✅ **Fix vòng lặp vô hạn** bằng cách:

   - Sử dụng useRef thay vì dependencies trong useCallback
   - Hoặc tách logic state ra khỏi callbacks
   - Hoặc sử dụng pattern reducer thay vì useState

2. ✅ **Tối ưu hóa performance**:

   - Giảm số lần save localStorage
   - Debounce state updates nếu cần
   - Memoize các giá trị derived

3. ✅ **Testing**:
   - Xác nhận không còn infinite loop
   - Kiểm tra navigation vẫn hoạt động đúng
   - Verify localStorage persistence

## 🚨 YÊU CẦU XÁC NHẬN

**Vui lòng:**

1. Chạy ứng dụng
2. Mở Flashcard mode
3. Mở Console (F12)
4. Chụp màn hình hoặc copy logs trong console
5. Cho tôi biết:
   - Có thấy logs lặp lại liên tục không?
   - Số lần logs xuất hiện trong 5 giây?
   - Ứng dụng có bị treo/chậm không?

Sau khi xác nhận, tôi sẽ tiến hành fix ngay lập tức! 🔧
