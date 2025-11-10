# Kế hoạch sửa lỗi bảng "Quiz gần đây" bị lệch cột

## Vấn đề

Bảng "Quiz gần đây" trên Dashboard bị lệch cột giữa header và body, gây ra sự không đồng bộ trong việc hiển thị dữ liệu trên tất cả các thiết bị (desktop, tablet, mobile).

## Nguyên nhân chính

1. **Container overflow-hidden che 2 cột cuối**: Container ngoài đặt `overflow-hidden` trong khi cuộn ngang nằm ở lớp con, gây mất cột "Ngày làm" và "Hành động"
2. **ScrollArea overlay scrollbar**: Radix ScrollArea dùng overlay scrollbar làm viewport co lại khi scrollbar xuất hiện, gây lệch width giữa header (sticky) và body (cuộn)
3. **Table width cứng xung đột**: Table đặt cả `width: 850px` và `minWidth: 850px` gây xung đột với colgroup và responsive
4. **Z-index header thấp**: Header chỉ có z-10, có thể bị ScrollBar chồng lên gây cảm giác lệch

## Giải pháp đã áp dụng

### 1. Bỏ overflow-hidden ở container ngoài

**File**: `src/components/dashboard/RecentQuizzes.tsx` (dòng 199)
**Thay đổi**:

```tsx
// Trước
<div className="rounded-xl border-2 border-gray-100 overflow-hidden">

// Sau
<div className="rounded-xl border-2 border-gray-100">
```

**Lý do**: Container đặt `overflow-hidden` che mất 2 cột cuối khi cuộn ngang nằm ở lớp con.

### 2. Thêm scrollbar-gutter ổn định cho viewport cuộn

**File**: `src/components/ui/scroll-area.tsx` (dòng 11)
**Thay đổi**:

```tsx
// Trước
<ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">{children}</ScrollAreaPrimitive.Viewport>

// Sau
<ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit] scrollbar-stable" style={{ scrollbarGutter: "stable both-edges" }}>{children}</ScrollAreaPrimitive.Viewport>
```

**Lý do**: Dành không gian cố định cho scrollbar để đồng bộ width giữa header (sticky) và body (cuộn) khi scrollbar xuất hiện.

### 3. Chuẩn hóa width của Table

**File**: `src/components/dashboard/RecentQuizzes.tsx` (dòng 204-207)
**Thay đổi**:

```tsx
// Trước
<Table
  wrap={false}
  className="recent-quizzes-table"
  style={{ width: "850px", minWidth: "850px" }}>

// Sau
<Table
  wrap={false}
  className="recent-quizzes-table"
  style={{ minWidth: "850px" }}>
```

**Lý do**: Bỏ width cứng gây xung đột với colgroup, chỉ giữ minWidth để colgroup chi phối layout.

### 4. Tăng z-index cho header

**File**: `src/components/dashboard/RecentQuizzes.tsx` (dòng 216)
**Thay đổi**:

```tsx
// Trước
<TableHeader className="bg-[#B5CC89]/10 sticky top-0 z-10">

// Sau
<TableHeader className="bg-[#B5CC89]/10 sticky top-0 z-20">
```

**Lý do**: Đảm bảo header không bị ScrollBar chồng lên gây cảm giác lệch.

## Giải pháp chi tiết (dự phòng)

### 1. Cải thiện cấu trúc colgroup và table layout

**Thay đổi trong file `src/components/dashboard/RecentQuizzes.tsx`:**

#### a. Thay thế cấu trúc colgroup hiện tại (dòng 150-157):

```tsx
<colgroup>
  <col style={{ width: "35%" }} className="min-w-[200px]" />
  <col style={{ width: "12%" }} className="min-w-[70px]" />
  <col style={{ width: "12%" }} className="min-w-[70px]" />
  <col style={{ width: "12%" }} className="min-w-[70px]" />
  <col style={{ width: "20%" }} className="min-w-[100px]" />
  <col style={{ width: "9%" }} className="min-w-[60px]" />
</colgroup>
```

**Thành cấu trúc mới với width cố định:**

```tsx
<colgroup>
  <col style={{ width: "280px", minWidth: "280px" }} />
  <col style={{ width: "100px", minWidth: "100px" }} />
  <col style={{ width: "80px", minWidth: "80px" }} />
  <col style={{ width: "100px", minWidth: "100px" }} />
  <col style={{ width: "140px", minWidth: "140px" }} />
  <col style={{ width: "100px", minWidth: "100px" }} />
</colgroup>
```

#### b. Cập nhật TableCell để tuân thủ cấu trúc mới:

**Cột Quiz (dòng 187-197):**

```tsx
<TableCell
  className="font-medium p-3"
  style={{ width: "280px", minWidth: "280px" }}>
  <div className="truncate">
    <p className="font-bold text-gray-900 truncate">{attempt.quiz_title}</p>
    <p className="text-sm text-gray-500 mt-0.5">
      {attempt.correct_answers}/{attempt.total_questions} câu đúng
    </p>
  </div>
</TableCell>
```

**Cột Điểm (dòng 198-210):**

```tsx
<TableCell
  className="text-center p-3"
  style={{ width: "100px", minWidth: "100px" }}>
  <div className="flex flex-col items-center gap-1.5">
    <span className="font-bold text-lg text-gray-900">
      {attempt.score.toFixed(1)}%
    </span>
    <Badge className={`${getScoreColor(attempt.score)} font-semibold text-xs`}>
      {getScoreLabel(attempt.score)}
    </Badge>
  </div>
</TableCell>
```

**Cột Kết quả (dòng 211-217):**

```tsx
<TableCell
  className="text-center p-3"
  style={{ width: "80px", minWidth: "80px" }}>
  <div className="flex justify-center">
    <div className="p-2 rounded-full bg-green-100">
      <CheckCircleIcon className="h-5 w-5 text-green-600" />
    </div>
  </div>
</TableCell>
```

**Cột Thời gian (dòng 218-229):**

```tsx
<TableCell
  className="text-center p-3"
  style={{ width: "100px", minWidth: "100px" }}>
  <div className="flex items-center justify-center text-sm font-medium text-gray-700 gap-1">
    <ClockIcon className="h-4 w-4 text-gray-500" />
    <span>{formatTime(attempt.time_taken_seconds)}</span>
  </div>
</TableCell>
```

**Cột Ngày làm (dòng 230-243):**

```tsx
<TableCell
  className="text-center p-3 text-sm text-gray-600 font-medium"
  style={{ width: "140px", minWidth: "140px" }}>
  {formatDate(attempt.completed_at)}
</TableCell>
```

**Cột Hành động (dòng 244-259):**

```tsx
<TableCell
  className="text-center p-3"
  style={{ width: "100px", minWidth: "100px" }}>
  <Button
    variant="outline"
    size="sm"
    onClick={() => navigate(`/quiz/${attempt.attempt_id}`)}
    className="border-2 hover:bg-primary hover:text-primary-foreground transition-colors font-semibold text-sm px-3"
    onMouseEnter={handleHoverEnter}
    onMouseLeave={handleHoverLeave}>
    <ExternalLinkIcon className="h-4 w-4 mr-1" />
    Xem
  </Button>
</TableCell>
```

### 2. Cải thiện cấu trúc container và responsive

**Thay đổi trong phần container của bảng (dòng 146-148):**

```tsx
<div className="rounded-xl border-2 border-gray-100 overflow-hidden">
  <div className="min-w-[800px]">
    <ScrollArea className="h-[400px]">
```

**Thành:**

```tsx
<div className="rounded-xl border-2 border-gray-100 overflow-hidden">
  <div className="min-w-[800px] overflow-x-auto">
    <ScrollArea className="h-[400px]">
```

### 3. Cập nhật TableHeader để đồng bộ với TableCell

**Cập nhật các TableHead (dòng 160-177):**

```tsx
<TableHead className="font-bold text-gray-900 whitespace-nowrap p-3" style={{ width: "280px", minWidth: "280px" }}>
  Quiz
</TableHead>
<TableHead className="text-center font-bold text-gray-900 whitespace-nowrap p-3" style={{ width: "100px", minWidth: "100px" }}>
  Điểm
</TableHead>
<TableHead className="text-center font-bold text-gray-900 whitespace-nowrap p-3" style={{ width: "80px", minWidth: "80px" }}>
  Kết quả
</TableHead>
<TableHead className="text-center font-bold text-gray-900 whitespace-nowrap p-3" style={{ width: "100px", minWidth: "100px" }}>
  Thời gian
</TableHead>
<TableHead className="text-center font-bold text-gray-900 whitespace-nowrap p-3" style={{ width: "140px", minWidth: "140px" }}>
  Ngày làm
</TableHead>
<TableHead className="text-center font-bold text-gray-900 whitespace-nowrap p-3" style={{ width: "100px", minWidth: "100px" }}>
  Hành động
</TableHead>
```

### 4. Tối ưu hóa responsive design

**Thêm CSS custom cho responsive:**

```tsx
// Thêm vào đầu component RecentQuizzes
const tableStyles = `
  @media (max-width: 640px) {
    .recent-quizzes-table {
      font-size: 0.75rem;
    }
    .recent-quizzes-table td,
    .recent-quizzes-table th {
      padding: 0.25rem !important;
    }
  }
  
  @media (min-width: 641px) and (max-width: 768px) {
    .recent-quizzes-table {
      font-size: 0.875rem;
    }
  }
`;
```

**Áp dụng styles vào Table:**

```tsx
<Table wrap={false} className="recent-quizzes-table">
```

### 5. Xử lý text overflow cho các cột có nội dung dài

**Thêm CSS cho text truncation:**

```tsx
// Thêm vào styles
const truncateStyles = `
  .truncate-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }
`;
```

**Áp dụng vào cột Quiz:**

```tsx
<p className="font-bold text-gray-900 truncate-text">{attempt.quiz_title}</p>
```

## Các bước triển khai

1. **Sao lưu file hiện tại**: Tạo bản sao của `src/components/dashboard/RecentQuizzes.tsx`
2. **Áp dụng thay đổi colgroup**: Cập nhật cấu trúc colgroup với width cố định
3. **Cập nhật TableHead**: Đồng bộ hóa width và padding với TableCell
4. **Cập nhật TableCell**: Áp dụng width cố định và cải thiện text handling
5. **Thêm responsive styles**: Tạo styles cho mobile và tablet
6. **Kiểm tra trên tất cả thiết bị**: Đảm bảo bảng hiển thị đúng trên desktop, tablet, và mobile
7. **Test với dữ liệu khác nhau**: Kiểm tra với nội dung dài và ngắn khác nhau

## Kết quả mong đợi

- Header và body của bảng hoàn toàn đồng bộ
- Không có sự lệch cột khi cuộn ngang
- Responsive design hoạt động tốt trên tất cả các thiết bị
- Nội dung dài được xử lý đúng cách với ellipsis
- Performance tốt với table layout cố định
