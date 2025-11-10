# Kế hoạch kiểm tra Database Function

## Vấn đề cần xác minh

"Chi tiết câu trả lời" không hiển thị dữ liệu trên trang QuizDetailPage

## Các nguồn có thể gây ra vấn đề

### 1. RPC Function Issues (Ưu tiên 1)

**Symptoms**: Không có data hoặc data rỗng
**Tests**:

- Test function trực tiếp trong Supabase SQL Editor
- Kiểm tra return type và field names
- Verify RLS policies

### 2. Data Mapping Issues (Ưu tiên 2)

**Symptoms**: Data có nhưng không hiển thị đúng
**Tests**:

- Console.log data từ hook
- Kiểm tra field mapping
- Verify JSON parsing

### 3. Component Rendering Issues (Ưu tiên 3)

**Symptoms**: Data có nhưng UI không render
**Tests**:

- React DevTools inspection
- State debugging
- Conditional rendering checks

## Test Cases cần thực hiện

### Test Case 1: Direct SQL Query

```sql
-- Test trong Supabase SQL Editor
SELECT * FROM get_quiz_attempt_detail('attempt-id-here', 'user-id-here');
```

### Test Case 2: Hook Debugging

Thêm logging vào useQuizAttemptDetail.ts:

```javascript
console.log("RPC Response:", data);
console.log("Normalized Questions:", questions);
console.log("User Answers:", userAnswers);
```

### Test Case 3: Component Props Debugging

Thêm logging vào QuizDetailPage.tsx:

```javascript
console.log("Attempt Detail:", attemptDetail);
console.log("Attempt Summary:", attemptSummary);
console.log("Answers:", attemptSummary?.answers);
```

### Test Case 4: Network Inspection

- Kiểm tra Network tab trong DevTools
- Verify RPC call parameters
- Check response status và data

### Test Case 5: Edge Cases

- Test với attempt ID không tồn tại
- Test với user khác
- Test với data corrupted

## Steps thực hiện

### Step 1: Database Verification

1. Vào Supabase Dashboard
2. Mở SQL Editor
3. Chạy test query với real data
4. Kiểm tra kết quả trả về

### Step 2: Hook Debugging

1. Thêm console logs vào useQuizAttemptDetail
2. Test với real attempt ID
3. Kiểm tra console output
4. Verify data transformation

### Step 3: Component Debugging

1. Thêm React DevTools
2. Kiểm tra component state
3. Verify props drilling
4. Check conditional rendering

### Step 4: Integration Testing

1. Test full flow từ Dashboard
2. Click "Xem" button
3. Verify navigation
4. Check data loading

## Expected Results

### Successful Case:

- RPC function return đầy đủ data
- Hook map data đúng cách
- Component render tất cả answers
- UI hiển thị đúng thông tin

### Error Cases:

- Clear error messages
- Fallback UI cho missing data
- Proper error boundaries
- User-friendly error states

## Quick Fix Checklist

Nếu phát hiện vấn đề:

### RPC Function Issues:

- [ ] Update function definition
- [ ] Fix field mappings
- [ ] Adjust RLS policies

### Hook Issues:

- [ ] Fix data transformation
- [ ] Update error handling
- [ ] Improve type safety

### Component Issues:

- [ ] Fix conditional rendering
- [ ] Update state management
- [ ] Improve error boundaries

## Tools cần sử dụng

1. **Supabase SQL Editor** - Test direct queries
2. **Browser DevTools** - Debug network và state
3. **React DevTools** - Component inspection
4. **Console Logging** - Runtime debugging
5. **Network Tab** - API call verification

## Success Criteria

✅ RPC function return đúng data  
✅ Hook process data đúng cách  
✅ Component render đầy đủ thông tin  
✅ UI hiển thị "Chi tiết câu trả lời"  
✅ Error cases được xử lý đúng  
✅ Performance acceptable (< 2s load time)
