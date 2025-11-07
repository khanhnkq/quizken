# Dashboard Cá Nhân - QuizKen

## 📋 Tổng Quan

Dashboard cá nhân cho phép người dùng theo dõi tiến trình học tập và thành tích của họ với các tính năng:

- **Thống kê tổng quát**: Số quiz đã tạo, đã làm, điểm cao nhất
- **Xu hướng tiến bộ**: Biểu đồ line chart 30 ngày gần đây
- **Quiz gần đây**: Danh sách 10 quiz vừa làm

## 🚀 Cài Đặt

### 1. Chạy Migration

```bash
cd supabase
npx supabase db push
```

### 2. Thêm Dữ Liệu Test (Optional)

Nếu muốn test với dữ liệu mẫu:

```bash
# Kết nối đến Supabase project
npx supabase link

# Chạy seed data (bao gồm test user và quiz data)
psql $SUPABASE_DB_URL -f supabase/seed_dashboard_data.sql
```

**Lưu ý**: Migration mới đã thêm `user_id` column vào table `quizzes` để theo dõi quiz đã tạo.

### 3. Khởi Động Development Server

```bash
npm run dev
```

### 4. Truy Cập Dashboard

Mở trình duyệt và truy cập: `http://localhost:5173/dashboard`

## 🏗️ Kiến Trúc

### Database Schema

- `quiz_attempts`: Lưu trữ kết quả quiz attempts
- `quizzes`: Quiz đã có sẵn (mở rộng)
- Functions: `get_user_statistics`, `get_user_progress_trend`, `get_user_recent_attempts`

### Components Structure

```
src/components/dashboard/
├── PersonalDashboard.tsx      # Main container
├── StatisticsCards.tsx       # 3 KPI cards
├── ProgressTrendline.tsx    # Line chart
└── RecentQuizzes.tsx        # Recent attempts table
```

### Hooks

```
src/hooks/
├── useDashboardStats.ts    # Fetch statistics
├── useProgressTrend.ts    # Fetch trend data
└── useRecentQuizzes.ts    # Fetch recent attempts
```

## 🎨 UI Features

### Responsive Design

- **Mobile**: 1 column layout
- **Tablet**: 2 columns grid
- **Desktop**: 3 columns statistics + 2 columns content

### Animations

- GSAP count-up animations cho số liệu
- Smooth transitions giữa states
- Loading skeletons

### Color Coding

- **Xuất sắc** (80-100%): Green badge
- **Khá tốt** (60-79%): Yellow badge
- **Cần cải thiện** (<60%): Red badge

## 🔧 Testing

### Test Mode

Dashboard được cấu hình để test mà không cần đăng nhập:

- Mock user ID: `test-user-id`
- Comment authentication redirects trong `Dashboard.tsx`

### Test Cases

1. **Empty State**: User mới chưa có dữ liệu
2. **Data Loading**: Test loading states
3. **Error Handling**: Test error states
4. **Responsive**: Test trên mobile, tablet, desktop
5. **Data Refresh**: Test refresh functionality

## 📊 Data Flow

```
User Dashboard Page
    ↓
PersonalDashboard Component
    ↓
3 Custom Hooks
    ↓ (parallel)
Supabase Functions
    ↓
Database Tables
```

## 🚀 Performance Optimizations

- Lazy loading cho Dashboard page
- React.memo cho components
- Efficient data fetching
- Optimized re-renders
- Skeleton loading states

## 🔐 Security

- RLS (Row Level Security) policies
- User-specific data filtering
- Authentication checks
- SQL injection prevention

## 🌐 Localization

Toàn bộ UI sử dụng tiếng Việt:

- Messages và labels
- Date formatting (vi-VN locale)
- Number formatting với locale

## 🐛 Troubleshooting

### Common Issues

1. **Dashboard trống**

   - Kiểm tra user authentication
   - Verify Supabase connection
   - Check browser console errors

2. **Chart không hiển thị**

   - Verify Recharts import
   - Check data format từ API
   - Inspect console logs

3. **Navigation không hoạt động**
   - Check route configuration
   - Verify Link components
   - Test authentication state

### Debug Commands

```bash
# Check Supabase connection
npx supabase status

# Reset database
npx supabase db reset

# Check logs
npx supabase functions logs
```

## 📝 Notes

- Dashboard chỉ hiển thị khi user đã đăng nhập
- Data được cache trong 5 phút
- Real-time updates qua Supabase subscriptions
- Production cần bỏ comment authentication redirects
