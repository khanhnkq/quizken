# Checklist sửa lỗi bảng RecentQuizzes

## Chuẩn bị

- [ ] Tạo bản sao lưu của file `src/components/dashboard/RecentQuizzes.tsx`
- [ ] Đảm bảo có quyền truy cập để sửa file
- [ ] Chuẩn bị môi trường test cho các thiết bị khác nhau

## Thay đổi cấu trúc colgroup

- [ ] Thay thế colgroup hiện tại (dòng 150-157) với cấu trúc mới
- [ ] Sử dụng width cố định thay vì phần trăm
- [ ] Đảm bảo tổng width = 800px (280+100+80+100+140+100)
- [ ] Kiểm tra min-width cho mỗi cột

## Cập nhật TableHeader

- [ ] Cập nhật tất cả TableHead elements (dòng 160-177)
- [ ] Thêm style width và minWidth cho mỗi TableHead
- [ ] Đồng bộ padding với TableCell (p-3)
- [ ] Giữ nguyên các class hiện tại (font-bold, text-gray-900, etc.)

## Cập nhật TableBody

- [ ] Cập nhật TableCell cho cột Quiz (dòng 187-197)

  - [ ] Thêm style width và minWidth
  - [ ] Thêm class truncate cho text dài
  - [ ] Giữ nguyên cấu trúc nội dung hiện tại

- [ ] Cập nhật TableCell cho cột Điểm (dòng 198-210)

  - [ ] Thêm style width và minWidth
  - [ ] Giữ nguyên flex layout và badge styling

- [ ] Cập nhật TableCell cho cột Kết quả (dòng 211-217)

  - [ ] Thêm style width và minWidth
  - [ ] Giữ nguyên icon và styling

- [ ] Cập nhật TableCell cho cột Thời gian (dòng 218-229)

  - [ ] Thêm style width và minWidth
  - [ ] Giữ nguyên clock icon và formatTime function

- [ ] Cập nhật TableCell cho cột Ngày làm (dòng 230-243)

  - [ ] Thêm style width và minWidth
  - [ ] Giữ nguyên formatDate function
  - [ ] Loại bỏ responsive classes phức tạp

- [ ] Cập nhật TableCell cho cột Hành động (dòng 244-259)
  - [ ] Thêm style width và minWidth
  - [ ] Giữ nguyên button styling và hover effects

## Cải thiện container và ScrollArea

- [ ] Cập nhật container div (dòng 146-148)
- [ ] Thêm overflow-x-auto vào div con
- [ ] Giữ nguyên ScrollArea với height cố định

## Thêm responsive styles

- [ ] Thêm biến tableStyles vào đầu component
- [ ] Thêm media queries cho mobile (< 640px)
- [ ] Thêm media queries cho tablet (641px - 768px)
- [ ] Áp dụng class "recent-quizzes-table" vào Table component

## Xử lý text overflow

- [ ] Thêm biến truncateStyles
- [ ] Áp dụng class "truncate-text" vào cột Quiz
- [ ] Đảm bảo text dài được xử lý đúng cách

## Kiểm tra và test

- [ ] Test trên desktop (> 768px)

  - [ ] Kiểm tra đồng bộ header và body
  - [ ] Kiểm tra scroll ngang
  - [ ] Kiểm tra hover effects
  - [ ] Kiểm tra text truncation

- [ ] Test trên tablet (641px - 768px)

  - [ ] Kiểm tra responsive styles
  - [ ] Kiểm tra font size
  - [ ] Kiểm tra padding

- [ ] Test trên mobile (< 640px)

  - [ ] Kiểm tra responsive styles
  - [ ] Kiểm tra font size nhỏ hơn
  - [ ] Kiểm tra padding giảm
  - [ ] Kiểm tra scroll behavior

- [ ] Test với dữ liệu khác nhau
  - [ ] Test với quiz title dài
  - [ ] Test với quiz title ngắn
  - [ ] Test với dữ liệu rỗng
  - [ ] Test với loading state

## Kiểm tra chức năng

- [ ] Kiểm tra navigation khi click button "Xem"
- [ ] Kiểm tra hover effects với GSAP
- [ ] Kiểm tra badge colors dựa trên score
- [ ] Kiểm tra date và time formatting

## Performance

- [ ] Kiểm tra performance với nhiều rows
- [ ] Kiểm tra memory usage
- [ ] Kiểm tra scroll performance

## Final review

- [ ] Review code consistency
- [ ] Kiểm tra TypeScript types
- [ ] Kiểm tra unused imports
- [ ] Đảm bảo code follows project conventions

## Documentation

- [ ] Cập nhật comments nếu cần
- [ ] Ghi chú các thay đổi chính
- [ ] Chuẩn bị thông tin cho code review

## Deployment

- [ ] Tạo pull request
- [ ] Request code review
- [ ] Merge sau khi được approve
- [ ] Deploy đến staging environment
- [ ] Test trên staging
- [ ] Deploy đến production
- [ ] Monitor cho issues
