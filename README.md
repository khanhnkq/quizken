# Hình Vẽ Web Động – AI Quiz Generator

Dự án web tạo bộ câu hỏi trắc nghiệm bằng AI dựa trên chủ đề người dùng nhập. Frontend dùng Vite + React + TypeScript + Tailwind + shadcn/ui. Backend sử dụng Supabase Edge Functions (Deno) gọi Google Gemini API để sinh câu hỏi, chạy bất đồng bộ và trả trạng thái qua API polling. Hỗ trợ xuất PDF tiếng Việt chuẩn dấu, giới hạn ẩn danh, đăng nhập và API Key cá nhân.

## Công nghệ chính

- Vite, React, TypeScript, TailwindCSS
- shadcn/ui (Radix UI)
- Supabase (Auth, Database, Edge Functions)
- Google Gemini API (AI quiz generation)
- jsPDF (xuất PDF Unicode tiếng Việt)

## Tính năng nổi bật

- Tạo quiz async với hàng đợi trạng thái: pending → processing → completed/failed/expired
- Chọn số lượng câu hỏi: 10, 15, 20, 25, 30
- Giới hạn người dùng ẩn danh theo IP + fingerprint (reset theo ngày)
- Người dùng đăng nhập có thể dùng API key cá nhân để vượt rate limit
- Lưu quiz vào DB (public), phát thông báo cross-tab qua BroadcastChannel
- Xuất PDF hiển thị tiếng Việt đúng dấu (nạp font động)
- UI mượt, có tiến trình, stepper và hủy tạo quiz

## Yêu cầu môi trường

- Node.js 18+ (khuyến nghị 20+)
- npm hoặc pnpm (repo dùng npm lockfile)
- Git
- (Tùy chọn) Supabase CLI để deploy/kiểm thử functions
- (Tùy chọn) Google AI Studio API Key nếu muốn triển khai server-side Gemini

## Cấu trúc thư mục

- ./src: mã nguồn frontend (React + shadcn/ui)
- ./public: tệp tĩnh
- ./supabase/functions/generate-quiz: Edge Function tạo quiz (Deno)
- ./supabase/migrations: migration SQL cho database
- ./supabase/config.toml: cấu hình Supabase local/dev
- ./package.json: script, dependency
- ./vite.config.ts, ./tailwind.config.ts: cấu hình công cụ
- ./.gitignore: quy tắc ignore Git

## Thiết lập nhanh

1. Cài dependencies

- npm install

2. Biến môi trường frontend
   Tạo file .env (đã được .gitignore) tại project root với nội dung:

- VITE_SUPABASE_URL=YOUR_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

3. Chạy phát triển

- npm run dev
  Ứng dụng chạy ở http://localhost:5173 (mặc định của Vite)

4. Build sản phẩm

- npm run build
- npm run preview (serve build)

## Thiết lập Supabase

Database:

- Áp dụng các migration trong ./supabase/migrations theo thứ tự thời gian (đề xuất dùng Supabase CLI hoặc Studio để apply)
- Các bảng/đối tượng chính:
  - quizzes: lưu metadata quiz, câu hỏi, trạng thái, token usage
  - anonymous_usage: đếm lượt tạo của người dùng ẩn danh theo ngày
  - user_api_keys: lưu API key người dùng (đã có migration)

Edge Function generate-quiz:

- Mã nguồn: ./supabase/functions/generate-quiz
- Endpoint chính:
  - POST /start-quiz: khởi tạo bản ghi quiz và chạy xử lý nền
  - GET /get-quiz-status?quiz_id=...: trả trạng thái và dữ liệu quiz khi xong

Triển khai (tham khảo, yêu cầu Supabase CLI đã đăng nhập và chọn project):

- supabase functions deploy generate-quiz
- supabase secrets set GEMINI_API_KEY=your_server_side_key
- supabase secrets set PROJECT_URL=your_supabase_project_url
- supabase secrets set SERVICE_ROLE_KEY=your_service_role_key

Lưu ý:

- GEMINI_API_KEY phía server là tùy chọn nếu bạn cho phép người dùng dùng API key cá nhân khi đã xác thực. Nếu không có GEMINI_API_KEY server và không có user key hợp lệ, function sẽ báo lỗi cấu hình.

## Sử dụng trên UI

- Nhập chủ đề (tối đa 500 ký tự), chọn số lượng câu hỏi (10/15/20/25/30), nhấn Tạo Quiz
- Có thể hủy tiến trình
- Khi hoàn tất sẽ tự động hiện quiz, cho phép làm bài và xuất PDF

## Git và đẩy lên repository

Đã cấu hình:

- .gitignore đã bỏ qua .env và biến thể .env.\*
- package.json thêm trường repository (HTTPS GitHub)

Quy trình gợi ý:

- git init
- git branch -M main
- git add .
- git commit -m "chore: initial commit"
- git remote add origin https://github.com/your-username/hinh-ve-web-dong.git
- git push -u origin main

Lưu ý: Nếu chưa cấu hình user/email cho Git cục bộ, Git sẽ yêu cầu:

- git config user.name "Your Name"
- git config user.email "your@email.com"

## License

Dự án sử dụng giấy phép MIT. File LICENSE sẽ được thêm vào repository.

## Hành vi khi tạo quiz mới (reset tiến trình và UI)

Mục tiêu: Khi đang hiển thị một bài quiz ở phần QuizContent, nếu người dùng bấm “Tạo Quiz mới”, hệ thống phải:

- Ẩn và xóa ngay bài quiz hiện tại khỏi UI
- Reset hoàn toàn tiến trình hiển thị (status/progress)
- Bắt đầu tiến trình tạo mới với trạng thái “Đang chuẩn bị…”

Thay đổi kỹ thuật đã thực hiện

- Hook quản lý polling: [src/hooks/useQuizGeneration.ts](src/hooks/useQuizGeneration.ts)
  - Bổ sung phương thức reset() để:
    - Dừng interval hiện tại (nếu có)
    - Đưa trạng thái về ban đầu: status=null, progress=""
    - setIsPolling(false)
  - Điều chỉnh startPolling():
    - Luôn gọi stopPolling() trước khi khởi động session mới
    - Luôn set trạng thái khởi tạo không điều kiện:
      - status="pending"
      - progress="Đang chuẩn bị..."
    - Loại bỏ điều kiện chặn khi isPolling đang true (do đã stop trước)
- Luồng tạo mới: [src/components/quiz/QuizGenerator.tsx](src/components/quiz/QuizGenerator.tsx)
  - Ngay khi bắt đầu generateQuiz:
    - Gọi stopPolling() và reset() từ hook
    - Xóa nội dung quiz khỏi UI: setQuiz(null), setUserAnswers([]), setShowResults(false), setTokenUsage(null)
    - Reset tiến trình cục bộ: setGenerationStatus("pending"), setGenerationProgress("Đang chuẩn bị..."), setLoading(true)
    - Dọn trạng thái persistence cũ (localStorage) bằng clearPersist() ngay trước khi bắt đầu tiến trình mới
  - Sau khi nhận quizId mới:
    - Ghi lại persistence state cho quizId mới
    - Bắt đầu startPolling cho quizId mới

Luồng thực thi (tóm tắt)

1. Người dùng bấm “Tạo Quiz Ngay” trong khi đang có quiz hiển thị
2. stopPolling() + reset() → dừng session cũ, reset trạng thái UI
3. UI ẩn ngay QuizContent (quiz=null) và hiển thị tiến trình “Đang chuẩn bị…”
4. Gọi API start-quiz → nhận quizId → ghi persistence → startPolling(quizId)
5. Khi completed → render quiz mới và dọn tiến trình
6. Khi failed/expired → dọn tiến trình, hiển thị thông báo phù hợp

Hướng dẫn kiểm thử thủ công

- Trường hợp A: Đang có quiz hiển thị, bấm “Tạo Quiz Ngay”
  - Kỳ vọng: QuizContent biến mất ngay lập tức; khối tiến trình hiển thị status="pending" và progress="Đang chuẩn bị..."
  - Khi hoàn tất: hiển thị quiz mới; không còn dùng lại status/progress từ phiên trước
- Trường hợp B: Bấm “Hủy” giữa chừng
  - Kỳ vọng: Tiến trình biến mất; có thể bấm “Tạo Quiz Ngay” và thấy tiến trình mới sạch
- Trường hợp C: Thất bại hoặc hết hạn
  - Kỳ vọng: Dọn persistence, dừng polling; có thể tạo lại và thấy tiến trình mới sạch
- Trường hợp D: Bấm nhanh nhiều lần
  - Kỳ vọng: Không bị chặn bởi isPolling cũ; chỉ phiên sau cùng có hiệu lực; tiến trình luôn reset đúng

Ghi chú về persistence/khôi phục

- State đang tạo được lưu ngắn hạn trong localStorage nhằm hỗ trợ khôi phục khi đổi route trong SPA:
  - Khi tạo mới, persistence cũ được xóa ngay và ghi lại cho quizId mới
  - Khi completed/failed/expired, persistence được dọn sạch để tránh trạng thái cũ ảnh hưởng các lần tạo sau

Vị trí mã liên quan

- Hook polling và reset: [src/hooks/useQuizGeneration.ts](src/hooks/useQuizGeneration.ts)
- Trình khởi tạo quiz và UI tiến trình: [src/components/quiz/QuizGenerator.tsx](src/components/quiz/QuizGenerator.tsx)
