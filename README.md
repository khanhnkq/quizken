## Deploy Production (Vercel + Supabase)

### Tổng quan

Triển khai frontend trên Vercel với SPA fallback và backend bằng Supabase Edge Functions. Frontend gọi function qua [supabase.functions.invoke()](src/components/quiz/QuizGenerator.tsx:744) và [supabase.functions.invoke()](src/hooks/useQuizGeneration.ts:60), không cần hard-code URL nếu [VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY](src/integrations/supabase/client.ts:5) cấu hình chính xác.

- Domain: app.quizken.com (production), staging.quizken.com (staging)
- Supabase Project (production): project_id vjfpjojwpsrqznmifrjj theo [supabase/config.toml](supabase/config.toml)
- Tạm thời giữ verify_jwt=false cho function generate-quiz tại [supabase/config.toml](supabase/config.toml:3), sẽ siết chặt sau QA.

### Bước 1: DNS và Vercel Project

1. Trỏ CNAME:
   - app.quizken.com → cname.vercel-dns.com
   - staging.quizken.com → cname.vercel-dns.com
2. Thêm domain vào Vercel Project và chờ trạng thái Verified.
3. Kết nối GitHub repository, bật Preview Deployments cho Pull Request.

### Bước 2: SPA fallback và cấu hình build

1. SPA fallback: đã thêm [vercel.json](vercel.json) để rewrite mọi route về [index.html](index.html)

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

2. Cấu hình Vercel Project:
   - Build Command: npm run build
   - Output Directory: dist
   - Node Version: 20 (hoặc 18+)

### File cấu hình đã thêm cho deploy

Tôi đã tạo và commit các file cấu hình sau để hỗ trợ triển khai:

- [`vercel.json`](vercel.json:1) — cấu hình rewrite SPA và outputDirectory = "dist"
- [`.env.example`](.env.example:1) — mẫu biến môi trường frontend (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [`.github/workflows/ci.yml`](.github/workflows/ci.yml:1) — CI (lint + build) chạy trên push / PR vào nhánh main

Hướng dẫn triển khai nhanh:

- Trên Vercel (Project): set Env Vars

  - VITE_SUPABASE_URL=https://your-project.supabase.co
  - VITE_SUPABASE_ANON_KEY=your_anon_key_here
    (Sau khi thay đổi domain → thực hiện Redeploy với "Clear Build Cache".)

- Trên Supabase (CLI / Dashboard): set secrets cho Edge Function
  - GEMINI_API_KEY, PROJECT_URL, SERVICE_ROLE_KEY

Lệnh Supabase cơ bản (local, đã login):

```bash
supabase login
supabase link --project-ref vjfpjojwpsrqznmifrjj
supabase secrets set GEMINI_API_KEY=... PROJECT_URL=... SERVICE_ROLE_KEY=...
supabase db push
supabase functions deploy generate-quiz
```

Ghi chú: frontend sử dụng biến VITE\_\* tại [src/integrations/supabase/client.ts:5](src/integrations/supabase/client.ts:5).

### Bước 3: Biến môi trường

- Trên Vercel (Frontend):
  - VITE_SUPABASE_URL: API URL project Supabase
  - VITE_SUPABASE_ANON_KEY: anon key Supabase (chỉ dùng phía client)
- Trên Supabase (Secrets cho Edge Function):
  - GEMINI_API_KEY: khóa server-side dùng sinh quiz
  - PROJECT_URL: Supabase project URL
  - SERVICE_ROLE_KEY: service role key (chỉ dùng server/function)

Tham chiếu mã sử dụng các biến này tại [src/integrations/supabase/client.ts](src/integrations/supabase/client.ts:5) và logic Function tại [supabase/functions/generate-quiz/index.ts](supabase/functions/generate-quiz/index.ts:394).

### Bước 4: Áp dụng migrations và deploy Edge Function

Sử dụng Supabase CLI (yêu cầu đã login và chọn project đúng):

```bash
# Đăng nhập và liên kết project production
supabase login
supabase link --project-ref vjfpjojwpsrqznmifrjj

# Thiết lập secrets cho Edge Function
supabase secrets set \
  GEMINI_API_KEY=your_server_side_key \
  PROJECT_URL=https://your-project.supabase.co \
  SERVICE_ROLE_KEY=your_service_role_key

# Áp dụng schema/migrations (thư mục supabase/migrations)
supabase db push

# Deploy Edge Function generate-quiz
supabase functions deploy generate-quiz

# Kiểm thử Function (verify_jwt=false cho QA nhanh)
# Lấy URL function: https://&lt;project_ref&gt;.functions.supabase.co
curl -X POST \
  https://vjfpjojwpsrqznmifrjj.functions.supabase.co/generate-quiz/start-quiz \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Chủ đề kiểm thử","questionCount":10}'

# Kiểm tra trạng thái
curl -X GET \
  "https://vjfpjojwpsrqznmifrjj.functions.supabase.co/generate-quiz/get-quiz-status?quiz_id=&lt;ID_TRẢ_VỀ&gt;"
```

Frontend sẽ gọi endpoints qua [supabase.functions.invoke()](src/components/quiz/QuizGenerator.tsx:744) và [supabase.functions.invoke()](src/hooks/useQuizGeneration.ts:60) nên chỉ cần VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY đúng.

### Bước 5: Thu hẹp CORS sau khi domain verified

Hiện CORS đang để "\*" trong corsHeaders ở [supabase/functions/generate-quiz/index.ts](supabase/functions/generate-quiz/index.ts:387). Sau khi domain sẵn sàng, thay thế bằng whitelist:

```ts
// Ví dụ whitelist động (có thể áp dụng trong handler chính ở serve(), tham chiếu [supabase/functions/generate-quiz/index.ts](supabase/functions/generate-quiz/index.ts:1208))
const allowedOrigins = new Set([
  "https://app.quizken.com",
  "https://staging.quizken.com",
  // Cho Preview của Vercel nếu cần:
  // "https://&lt;project&gt;-&lt;hash&gt;-vercel.app"
]);

const origin = req.headers.get("origin") || "";
const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigins.has(origin)
    ? origin
    : "https://app.quizken.com",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
```

### Bước 6: Giới hạn anonymous và bảo mật

- Giới hạn ẩn danh (mặc định 3/ngày) tại DAILY_LIMIT ở [supabase/functions/generate-quiz/index.ts](supabase/functions/generate-quiz/index.ts:606). Khuyến nghị tách thành biến môi trường để điều chỉnh không cần redeploy.
- Đảm bảo chỉ anon key xuất hiện ở frontend; các keys nhạy cảm (GEMINI_API_KEY, SERVICE_ROLE_KEY) chỉ ở secrets Supabase/Function.

### Bước 7: Vận hành, quan trắc, rollback

- Quan trắc:
  - Supabase Logs: api, auth, storage, postgres; và log Function (edge-function).
  - Vercel Analytics/Logs; thiết lập Uptime check cho app.quizken.com và endpoint Function.
- Rollback:
  - Vercel: Revert deployment.
  - Database: backup/snapshot trước migrations hoặc dùng Supabase Branches để kiểm soát drift.
- Runbook sự cố:
  - Gemini 429: vượt quota → xem hướng dẫn, tham chiếu xử lý tại [generate-quiz](supabase/functions/generate-quiz/index.ts:767)
  - 401/403: khoá không hợp lệ/quyền hạn → tham chiếu [generate-quiz](supabase/functions/generate-quiz/index.ts:777)
  - CORS: xác nhận whitelist và origin header.

### Nâng cấp sau QA

- Bật verify_jwt=true tại [supabase/config.toml](supabase/config.toml:3) để chỉ người dùng đã đăng nhập gọi function.
- Cập nhật UI/auth tương ứng (giữ nguyên flow [supabase.functions.invoke()](src/components/quiz/QuizGenerator.tsx:744)).

# Quizken – AI Quiz Generator

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
- git remote add origin https://github.com/your-username/quizken.git
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

## Troubleshooting: @/lib/icons forwardRef undefined trên Vercel

Triệu chứng

- Console báo lỗi khi mở site production trên Vercel:
  - `icons-*.js:16 Uncaught TypeError: Cannot read properties of undefined (reading 'forwardRef')`

Nguyên nhân gốc

- Do chia nhỏ bundle (manualChunks) khiến chunk icon từ @/lib/icons được nạp trước khi React được khởi tạo, dẫn tới `forwardRef` chưa sẵn sàng. Ngoài ra, nếu @/lib/icons không được pre-bundle chung với React trong giai đoạn optimizeDeps, có thể tạo ra thứ tự nạp không ổn định.

Sửa lỗi đã áp dụng

- Đảm bảo chạy ở chế độ SPA chuẩn (ổn định thứ tự nạp):
  - appType: "spa" trong [vite.config.ts](vite.config.ts:14)
- Gom @/lib/icons về chung “vendor” thay vì tách riêng “icons”:
  - Điều chỉnh manualChunks (khối output.manualChunks) trong [vite.config.ts](vite.config.ts:41)
  - Ghi chú: dòng đánh dấu xử lý @/lib/icons trong vendor tại [vite.config.ts](vite.config.ts:50)
- Buộc pre-bundle @/lib/icons cùng pha với deps khác:
  - Thêm vào optimizeDeps.include: "@/lib/icons" tại [vite.config.ts](vite.config.ts:70)

Các bước bạn cần làm trên Vercel

1. Rebuild sạch cache
   - Trên Vercel → Project → Deployments → Redeploy → bật “Clear Build Cache” → Redeploy
2. Xác nhận phiên bản dependencies
   - @/lib/icons đang ghim tại [package.json](package.json:58)
   - react/react-dom đang ghim tại [package.json](package.json:60)
3. Xác minh sau deploy
   - Mở console trên production → ensure không còn lỗi `forwardRef`
   - Kiểm tra UI sử dụng icon: ví dụ [src/components/ScrollToGeneratorButtonWrapper.tsx](src/components/ScrollToGeneratorButtonWrapper.tsx:5), [src/components/AuthModal.tsx](src/components/AuthModal.tsx:13)

Phương án dự phòng (nếu lỗi vẫn còn trên một số môi trường)

- Loại bỏ splitVendorChunkPlugin để giảm độ phức tạp chia chunk (tạm thời) trong [vite.config.ts](vite.config.ts:33)
- Bật pre-bundle cưỡng bức sau khi cập nhật config:
  - Xoá cache build Vercel (Clear Build Cache) và Redeploy
- Đảm bảo tất cả import icon theo chuẩn named import/type-only import, xem hướng dẫn trong [LUCIDE_ICONS_UPDATE.md](LUCIDE_ICONS_UPDATE.md)

Ghi chú

- Dự án đã thống nhất cách import @/lib/icons (named/type) và có chunk “vendor” ổn định để tránh race condition nạp module.
