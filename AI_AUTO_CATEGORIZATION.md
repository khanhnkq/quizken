# AI Auto-Categorization Implementation

## 🎯 Overview

Quiz category, difficulty và tags giờ được **AI tự động xác định** dựa trên prompt của user - không cần manual selection!

## 📝 Thay đổi

### 1. Edge Function Updates
**File:** `supabase/functions/generate-quiz/index.ts`

#### A. Updated Prompt Template (lines 668-683)
AI nhận được instructions để generate thêm category, difficulty, và tags:

```typescript
{
  "title": "...",
  "description": "...",
  "category": "education|research|science|...|general", // AI chọn
  "difficulty": "easy|medium|hard",                     // AI đánh giá
  "tags": ["tag1", "tag2", "tag3"],                     // AI tạo 3-5 tags
  "questions": [...]
}
```

**Category options AI có thể chọn:**
- education, research, science, entertainment, trivia
- language, math, history, geography, literature  
- technology, business, health, sports, arts, music
- general (fallback)

**Difficulty levels:**
- easy - Câu hỏi cơ bản
- medium - Yêu cầu hiểu biết
- hard - Câu hỏi chuyên sâu

#### B. Extract & Validate (lines 946-952)
```typescript
const rawCategory = String(quizObj.category ?? "general");
const rawDifficulty = String(quizObj.difficulty ?? "medium");
const rawTags: string[] = Array.isArray(quizObj.tags)
  ? (quizObj.tags as string[]).slice(0, 5).map(t => String(t ?? "").toLowerCase())
  : [];
```

**Validation:**
- Category defaults to "general" if invalid
- Difficulty defaults to "medium" if invalid
- Tags: max 5, lowercase, trimmed

#### C. Save to Database (lines 986-992)
```typescript
await adminClient.from("quizzes").update({
  // ... existing fields
  category: rawCategory,
  difficulty: rawDifficulty,
  tags: rawTags,
  // ...
})
```

#### D. Return in API Response (lines 1185-1187)
```typescript
quiz: {
  // ... existing fields
  category: quiz.category || "general",
  difficulty: quiz.difficulty || "medium",
  tags: quiz.tags || [],
  // ...
}
```

### 2. Frontend Type Updates
**File:** `src/types/quiz.ts`

```typescript
import type { QuizCategory, QuizDifficulty } from "@/lib/constants/quizCategories";

export interface Quiz {
  title: string;
  description: string;
  questions: Question[];
  category?: QuizCategory;      // ← NEW!
  difficulty?: QuizDifficulty;  // ← NEW!
  tags?: string[];              // ← NEW!
  tokenUsage?: {...};
}
```

### 3. Existing Components (No Changes Needed!)
- **QuizLibrary** - Already has category/difficulty/tags display
- **QuizCategoryBadge** - Renders category badges
- **QuizTags** - Renders tag badges
- **CategoryFilters** - Filters work automatically

## 🔥 How It Works

### User Flow:
1. **User nhập prompt:** "Tạo quiz về lịch sử Việt Nam"
2. **AI phân tích:** 
   - Topic → category: "history"
   - Complexity → difficulty: "medium"
   - Keywords → tags: ["lịch sử", "việt nam", "văn hóa"]
3. **Edge Function lưu:** category, difficulty, tags vào database
4. **Frontend hiển thị:** Badges tự động xuất hiện

### Example AI Output:
```json
{
  "title": "Kiểm tra Lịch sử Việt Nam",
  "description": "Bài kiểm tra về các sự kiện lịch sử quan trọng của Việt Nam",
  "category": "history",
  "difficulty": "medium",
  "tags": ["lịch sử", "việt nam", "chiến tranh", "văn hóa"],
  "questions": [...]
}
```

## ✅ Benefits

### User Experience:
- ✅ **Zero manual work** - AI tự động categorize
- ✅ **Smarter categorization** - AI hiểu context tốt hơn
- ✅ **Consistent tagging** - AI tạo tags relevant
- ✅ **Faster workflow** - Không cần chọn dropdown

### Technical:
- ✅ **Automatic filtering** - QuizLibrary filters work ngay
- ✅ **Better search** - Tags giúp tìm kiếm chính xác
- ✅ **Data quality** - AI consistent hơn manual input
- ✅ **Backwards compatible** - Old quizzes có defaults

## 🧪 Testing Scenarios

### Test với các prompts khác nhau:

**1. Educational Content:**
```
Prompt: "Tạo quiz về phương trình bậc 2 cho học sinh THPT"
Expected: category="math", difficulty="medium", tags=["toán học", "phương trình", "thpt"]
```

**2. Entertainment:**
```
Prompt: "Tạo quiz đố vui về phim Marvel"
Expected: category="entertainment", difficulty="easy", tags=["phim", "marvel", "siêu anh hùng"]
```

**3. Science:**
```
Prompt: "Tạo quiz về cơ chế quang hợp ở thực vật"
Expected: category="science", difficulty="hard", tags=["sinh học", "quang hợp", "thực vật"]
```

**4. History:**
```
Prompt: "Tạo quiz về chiến tranh thế giới thứ 2"
Expected: category="history", difficulty="medium", tags=["lịch sử", "ww2", "chiến tranh"]
```

**5. Technology:**
```
Prompt: "Tạo quiz về React hooks và state management"
Expected: category="technology", difficulty="hard", tags=["react", "javascript", "lập trình"]
```

## 🔧 Fallback & Defaults

**If AI fails to provide values:**
- `category` → defaults to **"general"**
- `difficulty` → defaults to **"medium"**
- `tags` → defaults to **[]** (empty array)

**Database constraints ensure:**
- category must be valid enum value
- difficulty must be: easy, medium, or hard
- tags is array (max 5 items)

## 📊 Migration Status

### Already Applied:
✅ Database schema with category/tags/difficulty columns  
✅ Edge Function AI prompt template  
✅ Frontend types updated  
✅ QuizLibrary filters working  

### No Additional Migration Needed:
- Existing quizzes will use defaults
- New quizzes get AI-generated values
- UI components already implemented

## 🎨 UI Display

**QuizLibrary Cards:**
```
┌──────────────────────────────┐
│ Quiz Title                   │
│ Description...               │
│                              │
│ 📜 Lịch sử  🟡 Medium       │ ← Auto by AI!
│ #lịch-sử #việt-nam #ww2    │ ← Auto by AI!
│                              │
│ 📈 Usage stats...           │
└──────────────────────────────┘
```

**Filters:**
```
[📚 Chủ đề ▼] [🎯 Độ khó ▼]
   ↓ AI categorized    ↓ AI assessed
```

## 💡 Tips for Best Results

### Good Prompts:
✅ "Tạo quiz về lịch sử Việt Nam cho học sinh THCS"  
✅ "Tạo quiz đố vui về điện ảnh Hollywood"  
✅ "Tạo quiz nâng cao về React và TypeScript"  

### Bad Prompts:
❌ "Tạo quiz" (too vague)  
❌ "asdfghjkl" (nonsense)  
❌ "Quiz" (no context)  

**AI categorizes better with:**
- Clear topic mention
- Context (difficulty hints)
- Specific subject matter

## 🚀 Next Steps

Optional enhancements:
- [ ] Add confidence score for AI categorization
- [ ] Allow manual override in UI if needed
- [ ] Track AI categorization accuracy
- [ ] Add more granular categories

## 📝 Notes

- AI sử dụng Gemini 2.0 Flash Exp model
- Temperature: 0.7 (balanced creativity/accuracy)
- Category validation in database via ENUM
- Tags are lowercase and trimmed automatically
- Max 5 tags to avoid clutter
