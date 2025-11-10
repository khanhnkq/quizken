# Checklist sửa lỗi bảng RecentQuizzes - Hiển thị đầy đủ trên một dòng

## Chuẩn bị

- [ ] Tạo bản sao lưu của file `src/components/dashboard/RecentQuizzes.tsx`
- [ ] Đảm bảo có quyền truy cập để sửa file
- [ ] Chuẩn bị môi trường test cho các thiết bị khác nhau
- [ ] Kiểm tra import Tooltip components nếu cần

## Cập nhật cấu trúc colgroup

- [ ] Thay thế colgroup hiện tại (dòng 150-157) với width mới
- [ ] Đặt width: 300px, 110px, 80px, 110px, 150px, 100px
- [ ] Đảm bảo tổng width = 850px
- [ ] Kiểm tra min-width cho mỗi cột

## Cập nhật container

- [ ] Cập nhật container div (dòng 146-148)
- [ ] Thay đổi min-w-[800px] thành min-w-[850px]
- [ ] Giữ nguyên ScrollArea với height cố định

## Cập nhật TableHeader

- [ ] Cập nhật tất cả TableHead elements (dòng 160-177)
- [ ] Thêm style width và minWidth mới cho mỗi TableHead
- [ ] Giữ nguyên class hiện tại (font-bold, text-gray-900, etc.)
- [ ] Đảm bảo whitespace-nowrap cho tất cả headers

## Cập nhật TableBody - Cột Quiz

- [ ] Cập nhật TableCell cho cột Quiz (dòng 187-197)
  - [ ] Thêm style width: "300px", minWidth: "300px"
  - [ ] Thay đổi div container thành whitespace-nowrap
  - [ ] Đặt title và info thành inline elements
  - [ ] Thêm tooltip cho title dài (nếu cần)

## Cập nhật TableBody - Cột Điểm

- [ ] Cập nhật TableCell cho cột Điểm (dòng 198-210)
  - [ ] Thêm style width: "110px", minWidth: "110px"
  - [ ] Thêm whitespace-nowrap cho badge
  - [ ] Giữ nguyên flex layout

## Cập nhật TableBody - Cột Kết quả

- [ ] Cập nhật TableCell cho cột Kết quả (dòng 211-217)
  - [ ] Thêm style width: "80px", minWidth: "80px"
  - [ ] Giữ nguyên icon và styling

## Cập nhật TableBody - Cột Thời gian

- [ ] Cập nhật TableCell cho cột Thời gian (dòng 218-229)
  - [ ] Thêm style width: "110px", minWidth: "110px"
  - [ ] Thêm whitespace-nowrap
  - [ ] Giữ nguyên clock icon và formatTime function

## Cập nhật TableBody - Cột Ngày làm

- [ ] Cập nhật TableCell cho cột Ngày làm (dòng 230-243)
  - [ ] Thêm style width: "150px", minWidth: "150px"
  - [ ] Thêm whitespace-nowrap
  - [ ] Loại bỏ responsive classes phức tạp
  - [ ] Giữ nguyên formatDate function

## Cập nhật TableBody - Cột Hành động

- [ ] Cập nhật TableCell cho cột Hành động (dòng 244-259)
  - [ ] Thêm style width: "100px", minWidth: "100px"
  - [ ] Thêm whitespace-nowrap cho button
  - [ ] Giữ nguyên button styling và hover effects

## Thêm responsive styles

- [ ] Thêm biến tableStyles vào đầu component
- [ ] Thêm media query cho mobile (< 768px)
  - [ ] Giảm font size thành 0.75rem
  - [ ] Giảm padding thành 0.25rem
  - [ ] Giảm badge size
- [ ] Thêm media query cho tablet (769px - 1024px)
  - [ ] Giảm font size thành 0.875rem
- [ ] Áp dụng class "recent-quizzes-table" vào Table component

## Xử lý quiz title dài

- [ ] Import Tooltip components nếu cần
- [ ] Thêm TooltipProvider và Tooltip cho cột Quiz
- [ ] Thêm logic truncate cho title > 40 ký tự
- [ ] Thêm TooltipContent với full title

## Kiểm tra và test - Single-line display

- [ ] Test trên desktop (> 1024px)

  - [ ] Kiểm tra tất cả thông tin trên một dòng
  - [ ] Kiểm tra đồng bộ header và body
  - [ ] Kiểm tra scroll ngang (nếu cần)
  - [ ] Kiểm tra tooltip cho title dài

- [ ] Test trên tablet (769px - 1024px)

  - [ ] Kiểm tra font size giảm
  - [ ] Kiểm tra padding giảm
  - [ ] Kiểm tra tất cả thông tin trên một dòng

- [ ] Test trên mobile (< 768px)
  - [ ] Kiểm tra font size nhỏ nhất
  - [ ] Kiểm tra padding nhỏ nhất
  - [ ] Kiểm tra badge size
  - [ ] Kiểm tra scroll ngang hoạt động

## Test với dữ liệu khác nhau

- [ ] Test với quiz title ngắn (< 20 ký tự)
- [ ] Test với quiz title trung bình (20-40 ký tự)
- [ ] Test với quiz title dài (> 40 ký tự)
- [ ] Test với score 100%
- [ ] Test với score thấp (< 60%)
- [ ] Test với thời gian dài (> 60 phút)
- [ ] Test với thời gian ngắn (< 1 phút)
- [ ] Test với dữ liệu rỗng
- [ ] Test với loading state

## Kiểm tra chức năng

- [ ] Kiểm tra navigation khi click button "Xem"
- [ ] Kiểm tra hover effects với GSAP
- [ ] Kiểm tra badge colors dựa trên score
- [ ] Kiểm tra date và time formatting
- [ ] Kiểm tra tooltip hiển thị đúng

## Performance

- [ ] Kiểm tra performance với nhiều rows
- [ ] Kiểm tra memory usage
- [ ] Kiểm tra scroll performance
- [ ] Kiểm tra tooltip performance

## Final review

- [ ] Review code consistency
- [ ] Kiểm tra TypeScript types
- [ ] Kiểm tra unused imports
- [ ] Đảm bảo code follows project conventions
- [ ] Xác nhận tất cả thông tin hiển thị trên một dòng

## Documentation

- [ ] Cập nhật comments nếu cần
- [ ] Ghi chú các thay đổi chính
- [ ] Chuẩn bị thông tin cho code review
- [ ] Ghi chú về single-line display requirement

## Deployment

- [ ] Tạo pull request
- [ ] Request code review
- [ ] Merge sau khi được approve
- [ ] Deploy đến staging environment
- [ ] Test trên staging với nhiều thiết bị
- [ ] Deploy đến production
- [ ] Monitor cho issues
