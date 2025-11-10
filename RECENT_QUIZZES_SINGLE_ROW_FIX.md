# Kế hoạch sửa lỗi bảng "Quiz gần đây" - Hiển thị đầy đủ thông tin trên một dòng

## Mục tiêu chính

Đảm bảo bảng "Quiz gần đây" hiển thị đầy đủ thông tin trên một dòng duy nhất, không bị cắt hoặc xuống dòng, và đồng bộ giữa header và body trên tất cả các thiết bị.

## Phân tích lại vấn đề

1. **Vấn đề hiện tại**: Bảng bị lệch cột giữa header và body
2. **Yêu cầu mới**: Đảm bảo tất cả thông tin hiển thị trên một dòng
3. **Thách thức**: Cân bằng giữa width của các cột để vừa đủ cho nội dung nhưng không gây overflow

## Giải pháp chi tiết

### 1. Phân tích lại width của các cột dựa trên nội dung thực tế

**Phân tích nội dung tối đa cho mỗi cột:**

- **Quiz**: Title có thể dài, cần đủ rộng để hiển thị đầy đủ
- **Điểm**: "100.0%" + badge, cần khoảng 100px
- **Kết quả**: Icon chỉ cần khoảng 80px
- **Thời gian**: "25:30" + icon, cần khoảng 100px
- **Ngày làm**: "10/11/2025 22:30", cần khoảng 140px
- **Hành động**: Button "Xem" + icon, cần khoảng 100px

### 2. Cấu trúc colgroup mới với width tối ưu

**Thay thế colgroup hiện tại (dòng 150-157):**

```tsx
<colgroup>
  <col style={{ width: "300px", minWidth: "300px" }} />
  <col style={{ width: "110px", minWidth: "110px" }} />
  <col style={{ width: "80px", minWidth: "80px" }} />
  <col style={{ width: "110px", minWidth: "110px" }} />
  <col style={{ width: "150px", minWidth: "150px" }} />
  <col style={{ width: "100px", minWidth: "100px" }} />
</colgroup>
```

**Tổng width: 850px** (tăng từ 800px để đảm bảo đủ không gian)

### 3. Cập nhật container để phù hợp với width mới

**Thay đổi container (dòng 146-148):**

```tsx
<div className="rounded-xl border-2 border-gray-100 overflow-hidden">
  <div className="min-w-[850px] overflow-x-auto">
    <ScrollArea className="h-[400px]">
```

### 4. Cập nhật TableHead với width mới

**Cập nhật các TableHead (dòng 160-177):**

```tsx
<TableHead className="font-bold text-gray-900 whitespace-nowrap p-3" style={{ width: "300px", minWidth: "300px" }}>
  Quiz
</TableHead>
<TableHead className="text-center font-bold text-gray-900 whitespace-nowrap p-3" style={{ width: "110px", minWidth: "110px" }}>
  Điểm
</TableHead>
<TableHead className="text-center font-bold text-gray-900 whitespace-nowrap p-3" style={{ width: "80px", minWidth: "80px" }}>
  Kết quả
</TableHead>
<TableHead className="text-center font-bold text-gray-900 whitespace-nowrap p-3" style={{ width: "110px", minWidth: "110px" }}>
  Thời gian
</TableHead>
<TableHead className="text-center font-bold text-gray-900 whitespace-nowrap p-3" style={{ width: "150px", minWidth: "150px" }}>
  Ngày làm
</TableHead>
<TableHead className="text-center font-bold text-gray-900 whitespace-nowrap p-3" style={{ width: "100px", minWidth: "100px" }}>
  Hành động
</TableHead>
```

### 5. Cập nhật TableCell với width mới và đảm bảo single-line display

**Cột Quiz (dòng 187-197):**

```tsx
<TableCell
  className="font-medium p-3"
  style={{ width: "300px", minWidth: "300px" }}>
  <div className="whitespace-nowrap">
    <p className="font-bold text-gray-900 inline">{attempt.quiz_title}</p>
    <p className="text-sm text-gray-500 ml-2 inline">
      ({attempt.correct_answers}/{attempt.total_questions} câu đúng)
    </p>
  </div>
</TableCell>
```

**Cột Điểm (dòng 198-210):**

```tsx
<TableCell
  className="text-center p-3"
  style={{ width: "110px", minWidth: "110px" }}>
  <div className="flex flex-col items-center gap-1 whitespace-nowrap">
    <span className="font-bold text-lg text-gray-900">
      {attempt.score.toFixed(1)}%
    </span>
    <Badge
      className={`${getScoreColor(
        attempt.score
      )} font-semibold text-xs whitespace-nowrap`}>
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
  style={{ width: "110px", minWidth: "110px" }}>
  <div className="flex items-center justify-center text-sm font-medium text-gray-700 gap-1 whitespace-nowrap">
    <ClockIcon className="h-4 w-4 text-gray-500" />
    <span>{formatTime(attempt.time_taken_seconds)}</span>
  </div>
</TableCell>
```

**Cột Ngày làm (dòng 230-243):**

```tsx
<TableCell
  className="text-center p-3 text-sm text-gray-600 font-medium whitespace-nowrap"
  style={{ width: "150px", minWidth: "150px" }}>
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
    className="border-2 hover:bg-primary hover:text-primary-foreground transition-colors font-semibold text-sm px-3 whitespace-nowrap"
    onMouseEnter={handleHoverEnter}
    onMouseLeave={handleHoverLeave}>
    <ExternalLinkIcon className="h-4 w-4 mr-1" />
    Xem
  </Button>
</TableCell>
```

### 6. Responsive design cho single-line display

**Thêm CSS cho responsive:**

```tsx
const tableStyles = `
  @media (max-width: 768px) {
    .recent-quizzes-table {
      font-size: 0.75rem;
    }
    .recent-quizzes-table td,
    .recent-quizzes-table th {
      padding: 0.25rem !important;
    }
    .recent-quizzes-table .badge {
      font-size: 0.625rem !important;
      padding: 0.125rem 0.25rem !important;
    }
  }
  
  @media (min-width: 769px) and (max-width: 1024px) {
    .recent-quizzes-table {
      font-size: 0.875rem;
    }
  }
`;
```

### 7. Xử lý trường hợp quiz title quá dài

**Giải pháp cho quiz title dài:**

```tsx
// Thay vì truncate, sử dụng tooltip cho title dài
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Trong cột Quiz:
<TableCell
  className="font-medium p-3"
  style={{ width: "300px", minWidth: "300px" }}>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="whitespace-nowrap truncate cursor-help">
          <p className="font-bold text-gray-900 inline">
            {attempt.quiz_title.length > 40
              ? `${attempt.quiz_title.substring(0, 40)}...`
              : attempt.quiz_title}
          </p>
          <p className="text-sm text-gray-500 ml-2 inline">
            ({attempt.correct_answers}/{attempt.total_questions} câu đúng)
          </p>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{attempt.quiz_title}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</TableCell>;
```

## Các bước triển khai

1. **Sao lưu file hiện tại**
2. **Cập nhật colgroup với width mới**
3. **Cập nhật container với min-width mới**
4. **Cập nhật tất cả TableHead với width mới**
5. **Cập nhật tất cả TableCell với width mới và whitespace-nowrap**
6. **Thêm responsive styles**
7. **Thêm tooltip cho quiz title dài**
8. **Kiểm tra trên tất cả các thiết bị**
9. **Test với dữ liệu khác nhau**

## Kết quả mong đợi

- Tất cả thông tin hiển thị trên một dòng
- Header và body hoàn toàn đồng bộ
- Không có text wrapping không cần thiết
- Quiz title dài được xử lý với tooltip
- Responsive design hoạt động tốt trên tất cả thiết bị
- Bảng có thể cuộn ngang nếu cần trên màn hình nhỏ
