# 🚀 Deployment Guide - Flexible Categories System

## Hướng dẫn Update từng bước chi tiết

---

## 📋 Checklist Tổng quan

- [ ] Step 1: Backup database
- [ ] Step 2: Apply database migration
- [ ] Step 3: Verify database changes
- [ ] Step 4: Deploy Edge Function
- [ ] Step 5: Test tạo quiz mới
- [ ] Step 6: Verify UI updates
- [ ] Step 7: Check existing quizzes

---

## ⏱️ Thời gian ước tính: 10-15 phút

---

## 🔧 STEP 1: Backup Database (2 phút)

### Tại sao cần backup?
Migration này sẽ:
- Drop ENUM type `quiz_category`
- Convert column từ ENUM → TEXT
- Không mất data nhưng nên backup để an toàn

### Cách backup:

**Option A: Via Supabase Dashboard**
1. Mở https://supabase.com/dashboard
2. Chọn project của bạn
3. Settings → Database → Backups
4. Click "Download backup" (nếu có)

**Option B: Export data**
```sql
-- Run query này để export categories hiện tại
COPY (
  SELECT id, category, title, description 
  FROM quizzes 
  WHERE category IS NOT NULL
) TO STDOUT WITH CSV HEADER;
```

✅ **Checkpoint:** Đã có backup hoặc export data

---

## 💾 STEP 2: Apply Database Migration (3 phút)

### Option A: Via Supabase Dashboard (RECOMMENDED)

#### 2.1. Mở SQL Editor
1. Truy cập https://supabase.com/dashboard
2. Chọn project: **hinh-ve-web-dong**
3. Click **SQL Editor** ở sidebar trái
4. Click **New query** button

#### 2.2. Copy Migration Script
1. Mở file: `supabase/migrations/20250121_flexible_categories.sql`
2. Copy **TOÀN BỘ** content (42 lines)
3. Paste vào SQL Editor

#### 2.3. Run Migration
1. Click **Run** button (hoặc Cmd/Ctrl + Enter)
2. Đợi ~5-10 giây
3. Check kết quả:
   - ✅ **Success:** "Success. No rows returned"
   - ❌ **Error:** Xem phần Troubleshooting bên dưới

### Option B: Via Supabase CLI

```bash
# Trong terminal, tại project root
cd /Users/nguyenkimquockhanh/Desktop/AiQuiz/hinh-ve-web-dong

# Apply migration
supabase db push

# Hoặc apply specific file
supabase db execute < supabase/migrations/20250121_flexible_categories.sql
```

✅ **Checkpoint:** Migration chạy thành công, không có errors

---

## 🔍 STEP 3: Verify Database Changes (2 phút)

### 3.1. Check Column Type
Run query này trong SQL Editor:

```sql
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'quizzes' 
  AND column_name = 'category';
```

**Expected result:**
```
column_name | data_type | column_default | is_nullable
------------|-----------|----------------|------------
category    | text      | 'general'      | NO
```

✅ Confirm: `data_type = 'text'` (NOT 'USER-DEFINED' hay enum)

### 3.2. Check ENUM Type Removed
```sql
SELECT typname 
FROM pg_type 
WHERE typname = 'quiz_category';
```

**Expected result:**
```
(0 rows)  -- ENUM type đã bị xóa
```

✅ Confirm: 0 rows returned

### 3.3. Check Indexes
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'quizzes' 
  AND indexname LIKE '%category%';
```

**Expected result:**
```
indexname                       | indexdef
--------------------------------|----------
idx_quizzes_category_text       | CREATE INDEX ...
idx_quizzes_category_public_text| CREATE INDEX ...
```

✅ Confirm: 2 indexes có suffix `_text`

### 3.4. Check Analytics View
```sql
SELECT * FROM popular_categories LIMIT 5;
```

**Expected result:**
```
category    | quiz_count | total_usage | avg_usage_per_quiz
------------|------------|-------------|-------------------
general     | 5          | 10          | 2.0
...
```

✅ Confirm: View exists và returns data

### 3.5. Check Existing Data Migrated
```sql
SELECT category, COUNT(*) as count
FROM quizzes
GROUP BY category
ORDER BY count DESC;
```

**Expected result:**
```
category    | count
------------|------
general     | 10
education   | 5
science     | 3
...
```

✅ Confirm: Existing categories intact (không mất data)

---

## 🚀 STEP 4: Deploy Edge Function (2 phút)

### 4.1. Login to Supabase (nếu chưa)
```bash
supabase login
```

### 4.2. Link Project (nếu chưa)
```bash
supabase link --project-ref YOUR_PROJECT_ID

# Tìm PROJECT_ID:
# Dashboard → Settings → General → Reference ID
```

### 4.3. Deploy Function
```bash
cd /Users/nguyenkimquockhanh/Desktop/AiQuiz/hinh-ve-web-dong

# Deploy generate-quiz function
supabase functions deploy generate-quiz

# Hoặc deploy all functions
supabase functions deploy
```

**Expected output:**
```
Deploying function generate-quiz...
Function generate-quiz deployed successfully!
```

✅ **Checkpoint:** Function deployed, không có errors

---

## 🧪 STEP 5: Test Tạo Quiz Mới (5 phút)

### 5.1. Test với Gaming Topic
1. Mở app: http://localhost:5173 (hoặc production URL)
2. Scroll tới **Quiz Generator section**
3. Nhập prompt:
   ```
   Tạo quiz về game League of Legends với 5 câu hỏi
   ```
4. Chọn **5 câu hỏi**
5. Click **Tạo câu hỏi** button
6. Đợi AI generate (~30-60 giây)

**Expected result:**
- Quiz được tạo thành công
- Check category badge: Nên hiển thị **"🏷️ Gaming"** hoặc similar
- Category KHÔNG phải là "general"

### 5.2. Test với Anime Topic
Nhập prompt:
```
Tạo quiz về anime Naruto với 5 câu hỏi
```

**Expected result:**
- Category: **"🏷️ Anime"** hoặc "🏷️ Animation"

### 5.3. Test với Cooking Topic
Nhập prompt:
```
Tạo quiz về món ăn Việt Nam với 5 câu hỏi
```

**Expected result:**
- Category: **"🏷️ Cooking"** hoặc "🏷️ Food"

### 5.4. Verify trong Database
```sql
-- Check 3 quizzes vừa tạo
SELECT 
  id, 
  title, 
  category, 
  tags,
  created_at
FROM quizzes
ORDER BY created_at DESC
LIMIT 3;
```

**Expected result:**
```
title                        | category  | tags
-----------------------------|-----------|------------------
Quiz về món ăn Việt Nam      | cooking   | ["mon an", ...]
Quiz về anime Naruto         | anime     | ["naruto", ...]
Quiz về game League of L...  | gaming    | ["lol", ...]
```

✅ **Checkpoint:** AI tự động generate categories phù hợp (không phải "general")

---

## 🎨 STEP 6: Verify UI Updates (2 phút)

### 6.1. Check Quiz Library
1. Mở **Quiz Library** (scroll down homepage)
2. Tìm category filter dropdown (bên trái)
3. Click để mở dropdown

**Expected result:**
```
📚 Tất cả chủ đề
───────────────────
🎓 Học tập
🔬 Nghiên cứu
🧪 Khoa học
...
───────────────────
─── AI-generated ───
🏷️ Gaming         ← NEW!
🏷️ Anime          ← NEW!
🏷️ Cooking        ← NEW!
```

✅ Confirm: Dynamic categories xuất hiện trong dropdown

### 6.2. Test Category Filtering
1. Select **"Gaming"** từ dropdown
2. Click filter

**Expected result:**
- Chỉ quizzes với category "gaming" được hiển thị
- Other quizzes bị filtered out

### 6.3. Check Quiz Cards
Tìm quiz với AI-generated category (gaming, anime, cooking)

**Expected display:**
```
┌──────────────────────────────┐
│ Quiz về League of Legends    │
│ Kiểm tra kiến thức MOBA...   │
│                              │
│ 🏷️ Gaming  🟡 Medium         │  ← Icon + Label
│ #lol #moba #gaming          │
└──────────────────────────────┘
```

✅ Confirm: 
- 🏷️ icon for unknown category
- Capitalized label (Gaming, Anime, Cooking)
- Gray color for unknown categories

---

## ✅ STEP 7: Check Existing Quizzes (1 phút)

### 7.1. Verify Old Quizzes Still Work
```sql
-- Check quizzes created before migration
SELECT 
  id,
  title,
  category,
  created_at
FROM quizzes
WHERE created_at < NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 10;
```

**Expected result:**
- Old categories (education, science, etc.) vẫn intact
- Không có NULL categories
- Data không bị mất

### 7.2. Test Old Quiz Display
1. Mở Quiz Library
2. Tìm quiz cũ (created trước migration)
3. Check category badge

**Expected result:**
- Old categories vẫn hiển thị đúng icon + label
- VD: "🎓 Học tập", "🔬 Nghiên cứu"

✅ **Checkpoint:** Backwards compatible - old quizzes work perfectly

---

## 🎉 SUCCESS CRITERIA

Xác nhận tất cả các điều sau:

### Database:
- ✅ Column `category` là TEXT type
- ✅ ENUM `quiz_category` đã bị xóa
- ✅ Indexes tạo thành công
- ✅ Analytics view `popular_categories` exists
- ✅ Existing data migrated (không mất data)

### Edge Function:
- ✅ Deploy thành công
- ✅ Không có errors khi tạo quiz

### AI Generation:
- ✅ AI generate flexible categories (gaming, anime, cooking, etc.)
- ✅ Categories phù hợp với topic
- ✅ KHÔNG bị giới hạn 17 categories cũ

### Frontend:
- ✅ Category filter hiển thị common + dynamic categories
- ✅ Separator "─── AI-generated ───" xuất hiện
- ✅ Unknown categories có 🏷️ icon
- ✅ Filtering works với bất kỳ category nào
- ✅ Old quizzes vẫn display correctly

---

## ⚠️ TROUBLESHOOTING

### Error: "type quiz_category does not exist"
**Cause:** Migration chưa chạy đầy đủ

**Fix:**
```sql
-- Check xem ENUM có tồn tại không
SELECT typname FROM pg_type WHERE typname = 'quiz_category';

-- Nếu vẫn tồn tại, run migration lại
-- Copy lại full content từ 20250121_flexible_categories.sql
```

### Error: "column category does not exist"
**Cause:** Migration failed at step rename

**Fix:**
```sql
-- Check column name hiện tại
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'quizzes' AND column_name LIKE '%category%';

-- Nếu là category_text, rename manually
ALTER TABLE quizzes RENAME COLUMN category_text TO category;
```

### Error: Edge Function deploy failed
**Cause:** Not logged in hoặc project not linked

**Fix:**
```bash
# Re-login
supabase logout
supabase login

# Re-link project
supabase link --project-ref YOUR_PROJECT_ID

# Deploy again
supabase functions deploy generate-quiz
```

### Issue: AI vẫn generate "general" category
**Cause:** Edge Function chưa được deploy

**Fix:**
```bash
# Force deploy
supabase functions deploy generate-quiz --no-verify-jwt

# Clear cache (if using CDN)
# Đợi 1-2 phút sau deploy
```

### Issue: Dynamic categories không xuất hiện trong filter
**Cause:** Frontend chưa refresh data

**Fix:**
1. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+F5)
2. Clear browser cache
3. Tạo quiz mới với niche topic
4. Reload Quiz Library

### Issue: Quiz cards không hiển thị category
**Cause:** Component caching issue

**Fix:**
1. Check browser console for errors
2. Verify quiz có category field trong database
3. Hard refresh browser

---

## 📊 Monitoring & Analytics

### Check Popular Categories
```sql
-- View top categories sau migration
SELECT * FROM popular_categories LIMIT 10;
```

### Track AI Category Distribution
```sql
-- Xem categories nào AI đang generate
SELECT 
  category,
  COUNT(*) as count,
  MIN(created_at) as first_seen,
  MAX(created_at) as last_seen
FROM quizzes
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY category
ORDER BY count DESC;
```

### Identify Unusual Categories
```sql
-- Find categories không phải common (17 cái)
SELECT DISTINCT category
FROM quizzes
WHERE category NOT IN (
  'education', 'research', 'science', 'entertainment',
  'trivia', 'language', 'math', 'history', 'geography',
  'literature', 'technology', 'business', 'health',
  'sports', 'arts', 'music', 'general'
)
ORDER BY category;
```

---

## 🔄 Rollback Plan (Nếu cần)

### Nếu có vấn đề nghiêm trọng:

**Option A: Restore từ backup**
1. Restore database từ backup ở Step 1
2. Redeploy old Edge Function version

**Option B: Quick fix - set all to general**
```sql
-- Temporary: set unknown categories to general
UPDATE quizzes
SET category = 'general'
WHERE category NOT IN (
  'education', 'research', 'science', 'entertainment',
  'trivia', 'language', 'math', 'history', 'geography',
  'literature', 'technology', 'business', 'health',
  'sports', 'arts', 'music', 'general'
);
```

**Option C: Recreate ENUM (không recommended)**
```sql
-- Chỉ dùng nếu cần rollback hoàn toàn
-- WARNING: Sẽ mất flexible categories!
CREATE TYPE quiz_category AS ENUM (...);
ALTER TABLE quizzes ALTER COLUMN category TYPE quiz_category USING category::quiz_category;
```

---

## 📞 Support

Nếu gặp vấn đề:
1. Check console logs (browser + Supabase dashboard)
2. Verify migration với queries trong Step 3
3. Check Edge Function logs: Dashboard → Edge Functions → generate-quiz → Logs
4. Review error messages carefully

---

## 🎯 Next Steps After Successful Deployment

1. **Monitor AI Categories:**
   - Track popular categories qua `popular_categories` view
   - Identify trends in category generation

2. **Optimize UI:**
   - Add icons cho popular AI-generated categories
   - Create category groups nếu cần

3. **Analytics:**
   - Track conversion rates by category
   - Identify most engaging categories

4. **Future Enhancements:**
   - Multi-category support
   - Category suggestions to AI
   - Category synonyms/aliases

---

## ✅ Deployment Complete!

Congratulations! 🎉

Hệ thống categories giờ UNLIMITED - AI tự do sáng tạo categories phù hợp với bất kỳ topic nào!

**What you achieved:**
- 🚀 Flexible unlimited categories
- 🤖 AI-powered categorization
- 📊 Dynamic category discovery
- 🎨 Better user experience
- ⚡ No constraints!
