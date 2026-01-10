# 📘 Báo cáo Kỹ thuật & Luồng Hoạt động - Project Quizken

Tài liệu này tổng hợp toàn bộ chi tiết kỹ thuật, công nghệ sử dụng, quy trình xử lý dữ liệu và luồng hoạt động của hệ thống Quizken. Tài liệu được thiết kế để phục vụ cho việc thuyết trình hoặc làm hồ sơ tham dự cuộc thi **Web Design Innovation 2026**.

---

## 1. 🛠️ Kiến trúc & Công nghệ (Technology Stack)

Hệ thống được xây dựng theo kiến trúc **Serverless Modern Web App**, tối ưu hóa cho trải nghiệm người dùng (UX) và khả năng mở rộng (Scalability).

### A. Frontend (Giao diện & Tương tác)
*   **Core Framework:** [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (Đảm bảo Type-safe, giảm thiểu lỗi runtime).
*   **Build Tool:** [Vite](https://vitejs.dev/) (Tốc độ build siêu nhanh, HMR tối ưu).
*   **Styling & UI Library:**
    *   **Tailwind CSS:** Utility-first CSS framework cho việc styling nhanh chóng, chuẩn responsive.
    *   **Shadcn/ui:** Bộ component tái sử dụng (Button, Dialog, Toast...) đảm bảo tính nhất quán và thẩm mỹ cao (Accessibility-first).
    *   **Lucide React:** Bộ icon nhẹ, hiện đại.
*   **State Management:** React Hooks (`useState`, `useEffect`, `useContext`) & Custom Hooks (`useUserProgress`, `useQuizGeneration`).
*   **Routing:** React Router DOM v6.
*   **Animations:** CSS Animations & Transitions cho các hiệu ứng mượt mà (Glassmorphism, Fade-in).
*   **Other Libraries:** `jsPDF` (Xuất file PDF tiếng Việt), `react-i18next` (Đa ngôn ngữ).

### B. Backend & Infrastructure (Hạ tầng & Dữ liệu)
*   **Platform:** [Supabase](https://supabase.com/) (Open source Firebase alternative).
*   **Database:** PostgreSQL (Cơ sở dữ liệu quan hệ mạnh mẽ).
*   **Backend Logic:** **Supabase Edge Functions** (Chạy trên Deno runtime). Thay vì server truyền thống, chúng tôi dùng serverless functions đặt tại edge (gần người dùng nhất) để giảm độ trễ.
*   **Authentication:** Supabase Auth (Quản lý user, session, bảo mật).
*   **Storage:** Supabase Storage (Lưu trữ media nếu cần).

### C. AI Engine (Trí tuệ nhân tạo)
*   **Model:** **Google Gemini 2.0 Flash Experimental** (hoặc 1.5 Flash).
    *   *Lý do chọn:* Tốc độ phản hồi cực nhanh (Low latency), chi phí tối ưu, và khả năng xử lý tiếng Việt rất tốt.
*   **Integration:** Gọi qua REST API từ Edge Functions (bảo mật API Key tuyệt đối phía server).

---

## 2. 🔄 Quy trình Xử lý Dữ liệu (Data Processing Pipeline)

Đây là "trái tim" của hệ thống, nơi AI biến yêu cầu đơn giản thành nội dung giáo dục có cấu trúc.

### A. Luồng nhập liệu & Prompt Engineering
1.  **Input:** Người dùng nhập chủ đề (VD: "Lịch sử Việt Nam") và chọn cấu hình (số câu hỏi, độ khó).
2.  **Prompt Construction (Tại Edge Function):** Hệ thống không gửi thô input cho AI. Nó bao bọc input vào một **System Prompt** được thiết kế kỹ lưỡng:
    *   **Role Setup:** "Bạn là một chuyên gia giáo dục..."
    *   **Constraint:** "Chỉ trả về định dạng JSON hợp lệ, không markdown..."
    *   **Structure Enforcement:** Yêu cầu JSON schema cụ thể (Title, Description, Questions array, Options, CorrectAnswer).
    *   **Auto-Categorization:** Yêu cầu AI tự phân tích chủ đề để gán Category (Music, History, Science...) và Tags.

### B. Xử lý & Làm sạch dữ liệu (Validation & Sanitization)
Vì AI (Generative AI) đôi khi có thể "ảo giác" hoặc trả về format sai, hệ thống có lớp middleware xử lý:
1.  **Raw Response Parsing:** Nhận text từ Gemini.
2.  **JSON Extraction:** Sử dụng Regex để trích xuất khối JSON valid nếu AI lỡ rào thêm lời dẫn.
3.  **Schema Validation:** Kiểm tra xem JSON có đủ trường không (có `questions` không? có `correctAnswer` không?).
4.  **Auto-Correction:** Nếu thiếu Category/Tags, hệ thống tự điền giá trị mặc định ("General").

### C. Lưu trữ & Đồng bộ
1.  **Database Insert:** Dữ liệu sạch được ghi vào bảng `quizzes` trong PostgreSQL.
2.  **Realtime/Polling:** Client (Frontend) liên tục kiểm tra trạng thái (polling) hoặc nhận tín hiệu realtime để tải quiz về ngay khi xong.

---

## 3. 🗺️ Luồng Hoạt động (User Flows)

### Flow 1: Tạo Quiz với AI (Core Feature)
1.  **Start:** User vào trang chủ -> Nhập chủ đề -> Bấm "Tạo Quiz".
2.  **Processing (Frontend):** Hiển thị UI "Đang chuẩn bị...", chặn tương tác trùng lặp.
3.  **Processing (Backend):**
    *   Gọi Edge Function `generate-quiz`.
    *   Kiểm tra Rate Limit (giới hạn số lần tạo cho khách/user).
    *   Gửi request tới Gemini AI.
    *   Lưu kết quả vào DB.
4.  **Completion:** Frontend nhận tín hiệu thành công -> Tải dữ liệu Quiz -> Hiển thị giao diện làm bài.
5.  **Offline Capability:** Lưu tạm state vào `localStorage` để nếu user lỡ reload trang thì không mất tiến trình đang tạo.

### Flow 2: Học tập & Gamification
1.  **Dashboard:** User xem bản đồ lộ trình (Roadmap) dạng con đường cong (SVG path).
2.  **Learning:** Vào bài học (VD: Vocabulary, Grammar).
3.  **Check Progress:** Hệ thống tự động track tiến độ.
    *   Nếu hoàn thành bài -> Update database -> Tăng điểm kinh nghiệm (XP).
    *   Cập nhật **Day Streak** (Chuỗi ngày học liên tục) -> Hiển thị biểu tượng ngọn lửa 🔥 để khích lệ.

---

## 4. 🧠 Điểm nhấn công nghệ (Tech Highlights cho cuộc thi)

1.  **AI-First Design:** AI không phải tính năng phụ, mà là lõi của sản phẩm. Mọi quiz đều được sinh ra fresh & unique.
2.  **Intelligent Categorization:** Hệ thống tự động hiểu "Chiến tranh thế giới" thuộc về "Lịch sử" mà không cần user chọn thủ công => UX thông minh.
3.  **High Performance:**
    *   Sử dụng **Edge Computing** giúp AI phản hồi nhanh hơn.
    *   **Optimistic UI:** Phản hồi giao diện ngay lập tức trước khi server trả về kết quả.
4.  **Scalable Architecture:** Thiết kế tách biệt Frontend và Backend Serverless giúp hệ thống chịu tải tốt khi lượng user tăng đột biến.

---
*Tài liệu này được trích xuất từ cấu trúc thực tế của mã nguồn Quizken.*
