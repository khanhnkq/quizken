# Sửa lỗi lệch cột giữa header và body trong bảng Quiz gần đây

## Vấn đề

Bảng "Quiz gần đây" trên Dashboard bị lệch cột giữa header và body, gây ra sự không đồng bộ trong việc hiển thị dữ liệu. Vấn đề này xảy ra trên tất cả các thiết bị (desktop, tablet, mobile).

## Nguyên nhân

1. **Kiến trúc bảng tách rời**: Header và body được render thành 2 bảng riêng biệt

   - Header nằm trong một Table component
   - Body nằm trong một Table component khác bên trong ScrollArea
   - HTML Table không thể chia sẻ thuật toán layout cột giữa 2 bảng khác nhau

2. **Nested scroll**: Component Table có wrapper overflow-auto, khi đặt trong ScrollArea gây ra nested scroll

3. **Thiếu colgroup**: Không có quy tắc chiều rộng cột cố định, khiến cột tự động điều chỉnh dựa trên nội dung

## Giải pháp đã triển khai

### 1. Cải thiện component Table (`src/components/ui/table.tsx`)

- Thêm prop `wrap?: boolean` (mặc định true) để tùy chọn wrapper overflow-auto
- Thêm class `table-fixed` để bật table-layout: fixed
- Khi `wrap=false`, trả về `<table>` trực tiếp không bọc div

```tsx
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & { wrap?: boolean }
>(({ className, wrap = true, ...props }, ref) => {
  const tableElement = (
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm table-fixed", className)}
      {...props}
    />
  );

  if (wrap) {
    return <div className="relative w-full overflow-auto">{tableElement}</div>;
  }

  return tableElement;
});
```

### 2. Refactor RecentQuizzes (`src/components/dashboard/RecentQuizzes.tsx`)

- Hợp nhất header và body vào một Table duy nhất
- Thêm colgroup với tỷ lệ chiều rộng cột:
  - Quiz: 35% (min-width: 200px)
  - Điểm: 12% (min-width: 70px)
  - Kết quả: 12% (min-width: 70px)
  - Thời gian: 12% (min-width: 70px)
  - Ngày làm: 20% (min-width: 100px)
  - Hành động: 9% (min-width: 60px)
- Áp dụng sticky header với class `sticky top-0 z-10`
- Truyền prop `wrap={false}` để tắt wrapper overflow-auto

### 3. Cải thiện Responsive

- Điều chỉnh min-width theo breakpoint:
  - Mobile: `min-w-[600px]`
  - Small: `min-w-[700px]`
  - Medium: `min-w-[800px]`
- Điều chỉnh chiều cao ScrollArea theo breakpoint:
  - Mobile: `h-[300px]`
  - Small: `h-[350px]`
  - Medium: `h-[400px]`
  - Large: `h-[600px]`
- Tối ưu nội dung cho mobile:
  - Truncate tiêu đề quiz trên mobile
  - Giảm kích thước font và icon trên mobile
  - Hiển thị thời gian ngắn gọn (ví dụ: "5p" thay vì "5:30")
  - Hiển thị ngày tháng ngắn gọn trên mobile
  - Nút hành động chỉ hiển thị icon trên mobile

## Kết quả

- ✅ Header và body thẳng cột tuyệt đối trên mọi thiết bị
- ✅ Sticky header hoạt động đúng khi cuộn dọc
- ✅ Responsive tốt trên desktop, tablet, và mobile
- ✅ Không ảnh hưởng đến các component khác (chỉ RecentQuizzes sử dụng Table)
- ✅ Giữ tương thích ngược cho các bảng khác

## Quy tắc chiều rộng cột

| Cột       | Tỷ lệ | Min-width | Mô tả                       |
| --------- | ----- | --------- | --------------------------- |
| Quiz      | 35%   | 200px     | Tiêu đề quiz và số câu đúng |
| Điểm      | 12%   | 70px      | Điểm số và badge kết quả    |
| Kết quả   | 12%   | 70px      | Icon trạng thái hoàn thành  |
| Thời gian | 12%   | 70px      | Thời gian làm quiz          |
| Ngày làm  | 20%   | 100px     | Ngày tháng hoàn thành       |
| Hành động | 9%    | 60px      | Nút xem chi tiết            |

## Kiểm thử

Để kiểm thử thay đổi:

1. Mở Dashboard trên các thiết bị khác nhau
2. Kiểm tra header và body thẳng cột
3. Cuộn dọc để xác nhận sticky header hoạt động
4. Cuộn ngang trên mobile để xác nhận responsive
5. Kiểm tra trên các trình duyệt khác nhau (Chrome, Safari, Firefox)
