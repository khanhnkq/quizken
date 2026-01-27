# Nhạc nền chill (public/audio)

Thư mục này chứa tệp nhạc nền dùng cho nút "Phát nhạc chill" trong màn hình Generator.

Đặt file nhạc của bạn tại đường dẫn sau:

- Tên tệp: chill.mp3
- Đường dẫn public khi chạy: /audio/chill.mp3
- Vị trí trong repo: public/audio/chill.mp3

Yêu cầu khuyến nghị:

- Định dạng: MP3, 128–192 kbps
- Độ dài: 1–3 phút, có thể loop mượt (không ngắt quãng)
- Âm lượng: đã normalize (~-14 LUFS), không clip, không quá ồn
- Bản quyền: sử dụng nguồn free-to-use (CC0/CC-BY hoặc tự sở hữu), kèm attribution nếu yêu cầu
- Nên tự host trong thư mục public để tránh lỗi CORS

Nguồn tham khảo miễn phí:

- https://pixabay.com/music/
- https://youtube.com/audiolibrary
- https://freemusicarchive.org/

Cách kiểm thử nhanh:

- Chạy ứng dụng ở chế độ dev
- Mở trang Generator, bấm nút "Phát nhạc chill"
- Kiểm tra:
  - Icon Music4/PauseCircle đổi khi phát/tạm dừng
  - Tooltip mô tả hiển thị chính xác
  - aria-pressed phản ánh đúng trạng thái
  - Âm lượng mặc định nhỏ (~40%)
  - Nhạc tiếp tục phát khi cuộn trang

Tùy chọn streaming:

- Có thể thay thế nguồn new Audio("/audio/chill.mp3") bằng một URL streaming
- Tuy nhiên khuyến nghị tự host (public/audio) để đảm bảo ổn định và không bị CORS

Lưu ý về chính sách trình duyệt:

- Trình duyệt chặn autoplay; chỉ phát sau khi có tương tác người dùng (click)
- Nếu phát thất bại, UI sẽ hiện toast cảnh báo
