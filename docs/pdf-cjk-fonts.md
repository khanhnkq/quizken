# Hướng dẫn font CJK (Trung/ Nhật/ Hàn) cho xuất PDF

Tính năng PDF đã được cấu hình để hiển thị tiếng Trung giản thể (SC), tiếng Nhật (JP), tiếng Hàn (KR) và tiếng Anh bằng cách nạp động font Noto Sans CJK qua CDN, có fallback tự host tại dự án.

Mã nguồn liên quan:

- [ensurePdfCjkFonts()](src/workers/pdf.worker.ts:128): tải và đăng ký font NotoSans SC/JP/KR vào jsPDF VFS
- [detectScript()](src/workers/pdf.worker.ts:219): phát hiện script (Han/Kana/Hangul)
- [chooseFontFamily()](src/workers/pdf.worker.ts:233): chọn font theo từng dòng nội dung
- [preScanPayloadForScripts()](src/workers/pdf.worker.ts:247): quét nội dung để chỉ nạp font cần dùng
- [buildPdfArrayBuffer()](src/workers/pdf.worker.ts:268): dựng nội dung PDF
- [warmupFonts()](src/workers/pdf.worker.ts:372): warmup để giảm độ trễ lần đầu

## 1) Các liên kết CDN đã tích hợp sẵn

Ứng dụng thử theo thứ tự: Local self-host (nếu có) → jsDelivr (tiêu chuẩn) → jsDelivr Fastly → jsDelivr gcore → OTF fallback.

- Noto Sans SC (Simplified Chinese)

  1. Local: /fonts/cjk/NotoSansSC-Regular.ttf
  2. https://cdn.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/TTF/SimplifiedChinese/NotoSansSC-Regular.ttf
  3. https://fastly.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/TTF/SimplifiedChinese/NotoSansSC-Regular.ttf
  4. https://gcore.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/TTF/SimplifiedChinese/NotoSansSC-Regular.ttf
  5. Fallback OTF: https://cdn.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/OTF/SimplifiedChinese/NotoSansSC-Regular.otf

- Noto Sans JP (Japanese)

  1. Local: /fonts/cjk/NotoSansJP-Regular.ttf
  2. https://cdn.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/TTF/Japanese/NotoSansJP-Regular.ttf
  3. https://fastly.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/TTF/Japanese/NotoSansJP-Regular.ttf
  4. https://gcore.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/TTF/Japanese/NotoSansJP-Regular.ttf
  5. Fallback OTF: https://cdn.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/OTF/Japanese/NotoSansJP-Regular.otf

- Noto Sans KR (Korean)
  1. Local: /fonts/cjk/NotoSansKR-Regular.ttf
  2. https://cdn.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/TTF/Korean/NotoSansKR-Regular.ttf
  3. https://fastly.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/TTF/Korean/NotoSansKR-Regular.ttf
  4. https://gcore.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/TTF/Korean/NotoSansKR-Regular.ttf
  5. Fallback OTF: https://cdn.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/OTF/Korean/NotoSansKR-Regular.otf

Ghi chú:

- Đã ưu tiên TTF vì jsPDF xử lý TTF ổn định hơn OTF.
- Không sử dụng raw.githubusercontent.com trong runtime vì CORS thường bị chặn.
- Ứng dụng có log xác thực nguồn đã tải trong console: “[PDF][Font] Loaded …” và cảnh báo khi lỗi.

## 2) Cách tự kiểm tra link hoạt động

1. Mở từng URL TTF/OTF ở trên trong trình duyệt. Link hợp lệ sẽ tải file (hoặc hiện preview) và HTTP status 200.
2. Kiểm tra DevTools Console khi bấm “Tải PDF”:
   - Nếu thành công: sẽ thấy log “[PDF][Font] Loaded <url>”
   - Nếu một nguồn lỗi: có “[PDF][Font] HTTP <status> <url>” hoặc “[PDF][Font] Failed …” rồi tự động thử nguồn kế tiếp.
3. Nếu tất cả CDN đều bị chặn, dùng phương án self-host (mục 3).

## 3) Self-host (khuyến nghị khi cần ổn định/offline)

Ứng dụng đã hỗ trợ thử Local trước, chỉ cần thêm file font vào dự án:

Bước 1: Tạo thư mục

- Tạo thư mục: public/fonts/cjk

Bước 2: Tải các font cần (từ máy bạn)

- Truy cập repo chính thức: https://github.com/googlefonts/noto-cjk/tree/main/Sans/TTF
- Tải các file:
  - public/fonts/cjk/NotoSansSC-Regular.ttf
  - public/fonts/cjk/NotoSansJP-Regular.ttf
  - public/fonts/cjk/NotoSansKR-Regular.ttf

Bước 3: (Tuỳ chọn) Dùng lệnh dòng lệnh để tải nhanh

- macOS/Linux:
  - Simplified Chinese:
    curl -L -o public/fonts/cjk/NotoSansSC-Regular.ttf https://cdn.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/TTF/SimplifiedChinese/NotoSansSC-Regular.ttf
  - Japanese:
    curl -L -o public/fonts/cjk/NotoSansJP-Regular.ttf https://cdn.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/TTF/Japanese/NotoSansJP-Regular.ttf
  - Korean:
    curl -L -o public/fonts/cjk/NotoSansKR-Regular.ttf https://cdn.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/TTF/Korean/NotoSansKR-Regular.ttf

Sau khi self-host, app sẽ ưu tiên các đường dẫn nội bộ:

- /fonts/cjk/NotoSansSC-Regular.ttf
- /fonts/cjk/NotoSansJP-Regular.ttf
- /fonts/cjk/NotoSansKR-Regular.ttf

Không cần sửa code vì [ensurePdfCjkFonts()](src/workers/pdf.worker.ts:128) đã cấu hình Local đứng đầu danh sách.

## 4) Gợi ý kiểm thử nhanh

Tạo một quiz chứa các dòng:

- SC: “中国历史测试 — 上海是中国的城市吗？”
- JP: “これはテストです。カタカナ/ひらがな”
- KR: “이것은 테스트입니다”
- EN: “English sample”

Sau đó bấm “Tải PDF”:

- Lần đầu có thể chậm vì tải ~4–8MB/font.
- Nếu CDN chặn, hãy tự host như mục 3.

## 5) Mở rộng (tuỳ chọn)

Hỗ trợ tiếng Trung phồn thể (TC):

- Font: NotoSansTC-Regular.ttf
- Vị trí: /Sans/TTF/TraditionalChinese/NotoSansTC-Regular.ttf
- Cách tích hợp: thêm vào [ensurePdfCjkFonts()](src/workers/pdf.worker.ts:128) theo mẫu SC/JP/KR (hoặc tạo PR).
