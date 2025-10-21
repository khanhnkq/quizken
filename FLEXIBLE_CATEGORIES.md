# Flexible AI-Generated Categories System

## 🚀 Overview

Category system giờ **KHÔNG giới hạn**! AI có thể tự do generate **bất kỳ category name nào** phù hợp với quiz topic.

## 📝 Key Changes

### Before (ENUM - Limited):
- ❌ Chỉ 17 categories cố định
- ❌ AI bị giới hạn phải chọn từ list
- ❌ Không thể categorize topics đặc biệt (gaming, anime, cooking, etc.)
- ❌ Database ENUM constraint

### After (TEXT - Unlimited):
- ✅ **Unlimited categories** - AI tự do sáng tạo
- ✅ AI chọn category name phù hợp nhất
- ✅ Support mọi topic: gaming, anime, cooking, fashion, crypto, etc.
- ✅ Database TEXT field - no constraints

---

## 🗄️ Database Changes

### Migration File
`supabase/migrations/20250121_flexible_categories.sql`

**Steps:**
1. Add new `category_text` column (TEXT)
2. Migrate existing ENUM data → TEXT
3. Drop old ENUM column
4. Rename `category_text` → `category`
5. Drop ENUM type
6. Create indexes for TEXT-based category
7. Create analytics view for popular categories

**Result:**
```sql
category TEXT NOT NULL DEFAULT 'general'
```

**Analytics View:**
```sql
CREATE VIEW popular_categories AS
SELECT category, COUNT(*) as quiz_count, ...
FROM quizzes
WHERE is_public = true
GROUP BY category
ORDER BY quiz_count DESC;
```

---

## 🤖 AI Prompt Update

### File: `supabase/functions/generate-quiz/index.ts`

**Old Instruction:**
```
"category": "chọn 1 trong: education, research, science, ..."
```

**New Instruction:**
```
"category": "Tự do đặt tên category phù hợp nhất (1-2 từ, lowercase, 
tiếng Anh hoặc Việt không dấu). VD: history, technology, science, 
art, music, cooking, gaming, anime, fashion, fitness, literature, 
math, psychology, philosophy, economics, law, architecture, 
photography, film, etc. Bạn có thể sáng tạo category mới nếu 
chủ đề đặc biệt."
```

**Guidelines for AI:**
- 1-2 words max
- lowercase
- English or Vietnamese without diacritics
- Can create new categories for special topics

---

## 🎨 Frontend Updates

### 1. Type System (`src/lib/constants/quizCategories.ts`)

**Before:**
```typescript
export type QuizCategory = 
  | 'education' 
  | 'research' 
  | ...  // Limited enum
```

**After:**
```typescript
// Flexible - accepts any string
export type QuizCategory = string;

// Suggested categories (for UI)
export type CommonCategory = 
  | 'education'
  | 'research'
  | ...  // For reference only
```

### 2. Helper Functions

Updated to handle unknown categories gracefully:

```typescript
export const getCategoryLabel = (category: QuizCategory): string => {
  const info = getCategoryInfo(category);
  if (info) return info.label;
  // For unknown categories, capitalize first letter
  return category.charAt(0).toUpperCase() + category.slice(1);
};

export const getCategoryIcon = (category: QuizCategory): string => {
  return getCategoryInfo(category)?.icon || '🏷️'; // Tag icon for unknown
};

export const getCategoryColor = (category: QuizCategory): string => {
  return getCategoryInfo(category)?.color || '#9CA3AF'; // Gray for unknown
};
```

### 3. CategoryFilters Component

**Dynamic Category Discovery:**
```typescript
// In QuizLibrary.tsx
const availableCategories = useMemo(() => {
  const categoriesSet = new Set<string>();
  quizzes.forEach(quiz => {
    if (quiz.category) categoriesSet.add(quiz.category);
  });
  return Array.from(categoriesSet).sort();
}, [quizzes]);
```

**UI Structure:**
```tsx
<SelectContent>
  {/* All Categories */}
  <SelectItem value="all">📚 Tất cả chủ đề</SelectItem>
  
  {/* Common/Suggested Categories */}
  {QUIZ_CATEGORIES.map(cat => (
    <SelectItem value={cat.value}>
      {cat.icon} {cat.label}
    </SelectItem>
  ))}
  
  {/* Dynamic AI-generated Categories */}
  {dynamicCategories.length > 0 && (
    <>
      <SelectItem disabled>─── AI-generated ───</SelectItem>
      {dynamicCategories.map(cat => (
        <SelectItem value={cat}>
          {getCategoryIcon(cat)} {getCategoryLabel(cat)}
        </SelectItem>
      ))}
    </>
  )}
</SelectContent>
```

---

## 💡 Example AI-Generated Categories

### Traditional Topics:
- `history` - Lịch sử
- `science` - Khoa học
- `math` - Toán học
- `literature` - Văn học

### Modern/Special Topics:
- `gaming` - Game, esports
- `anime` - Anime, manga
- `cooking` - Nấu ăn, món ăn
- `fashion` - Thời trang
- `fitness` - Thể hình, sức khỏe
- `crypto` - Cryptocurrency
- `photography` - Nhiếp ảnh
- `architecture` - Kiến trúc
- `psychology` - Tâm lý học
- `philosophy` - Triết học
- `economics` - Kinh tế học
- `law` - Luật
- `marketing` - Marketing
- `design` - Thiết kế

### Niche Topics:
- `kpop` - K-pop, nhạc Hàn
- `memes` - Internet memes
- `mythology` - Thần thoại
- `space` - Vũ trụ, thiên văn
- `dinosaurs` - Khủng long
- `ocean` - Đại dương, sinh vật biển
- `medieval` - Thời Trung cổ

**AI can create ANY category name!**

---

## 🎯 Benefits

### 1. Unlimited Flexibility
- ✅ AI không bị giới hạn bởi predefined list
- ✅ Support mọi niche topics
- ✅ Categories evolve với user needs

### 2. Better Categorization
- ✅ AI chọn category chính xác hơn
- ✅ Không bị ép vào category "general"
- ✅ More specific = better filtering

### 3. Organic Growth
- ✅ Popular categories tự nhiên xuất hiện
- ✅ Analytics view track category trends
- ✅ Data-driven insights

### 4. User Experience
- ✅ Relevant categories cho mọi topic
- ✅ Better discovery via specific categories
- ✅ No "doesn't fit anywhere" problem

---

## 📊 Analytics

**Popular Categories View:**
```sql
SELECT * FROM popular_categories LIMIT 10;
```

**Output:**
```
category       | quiz_count | total_usage | avg_usage
---------------|------------|-------------|----------
technology     | 45         | 320         | 7.1
history        | 38         | 280         | 7.4
gaming         | 25         | 190         | 7.6
science        | 22         | 165         | 7.5
anime          | 18         | 140         | 7.8
...
```

---

## 🔧 Migration Instructions

### Step 1: Apply Database Migration

**Via Supabase Dashboard:**
1. Open https://supabase.com/dashboard
2. Project → SQL Editor
3. Copy content from `supabase/migrations/20250121_flexible_categories.sql`
4. Run query

**Via CLI:**
```bash
supabase db push
```

### Step 2: Deploy Edge Function

```bash
supabase functions deploy generate-quiz
```

### Step 3: Verify

**Check category column:**
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'quizzes' AND column_name = 'category';

-- Expected: data_type = 'text'
```

**Test AI categorization:**
1. Create quiz: "Tạo quiz về game League of Legends"
2. Check if category = "gaming"
3. Filter by "gaming" in QuizLibrary

---

## 🎨 UI Display

### QuizLibrary Filter Dropdown:
```
┌─────────────────────────┐
│ 📚 Tất cả chủ đề       │
├─────────────────────────┤
│ 🎓 Học tập             │
│ 🔬 Nghiên cứu          │
│ 🧪 Khoa học            │
│ ...                     │
├─── AI-generated ───────┤
│ 🏷️ Gaming              │
│ 🏷️ Anime               │
│ 🏷️ Cooking             │
│ 🏷️ Crypto              │
└─────────────────────────┘
```

### Quiz Card:
```
┌──────────────────────────────┐
│ Quiz về League of Legends    │
│ Kiểm tra kiến thức về MOBA...│
│                              │
│ 🏷️ Gaming  🟡 Medium         │ ← AI-generated!
│ #lol #moba #esports         │
└──────────────────────────────┘
```

---

## 🧪 Testing

### Test Various Topics:

**Gaming:**
```
Prompt: "Tạo quiz về game Genshin Impact"
Expected category: "gaming"
```

**Anime:**
```
Prompt: "Tạo quiz về anime One Piece"
Expected category: "anime"
```

**Cooking:**
```
Prompt: "Tạo quiz về món ăn Việt Nam"
Expected category: "cooking"
```

**Crypto:**
```
Prompt: "Tạo quiz về blockchain và Bitcoin"
Expected category: "crypto"
```

**Philosophy:**
```
Prompt: "Tạo quiz về triết học phương Tây"
Expected category: "philosophy"
```

---

## 📝 Notes

### AI Category Guidelines:
- **Length**: 1-2 words max
- **Case**: lowercase only
- **Language**: English preferred (better for filtering)
- **Specificity**: Specific > Generic
  - ✅ `gaming` better than `entertainment`
  - ✅ `anime` better than `arts`
  - ✅ `crypto` better than `technology`

### Fallback:
- If AI returns invalid/empty: defaults to `"general"`
- If AI returns very long string: truncated to 50 chars

### Performance:
- TEXT column indexed for fast filtering
- Category discovery is memoized
- No performance impact vs ENUM

---

## 🚀 Future Enhancements

### Potential Features:
- [ ] Auto-suggest popular categories to AI
- [ ] Multi-category support (primary + secondary)
- [ ] Category hierarchy (gaming → moba → league-of-legends)
- [ ] Category synonyms (gaming = games = esports)
- [ ] Category trending analytics
- [ ] User-suggested category corrections

---

## ✅ Summary

**What Changed:**
1. ✅ Database: ENUM → TEXT (unlimited)
2. ✅ AI Prompt: Flexible category instructions
3. ✅ Types: QuizCategory = string
4. ✅ UI: Dynamic category discovery
5. ✅ Filters: Show common + AI-generated

**Result:**
- 🎯 AI tự do generate category phù hợp
- 🏷️ Support mọi topic (gaming, anime, cooking, etc.)
- 📊 Categories grow organically với usage
- 🔍 Better filtering và discovery
- ⚡ No limits, no constraints!
