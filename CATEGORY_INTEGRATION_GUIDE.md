# Category System Integration Guide for QuizGenerator

## ✅ Đã hoàn thành:

1. ✅ Database migration (`20250121_add_quiz_categories.sql`)
2. ✅ Constants file (`src/lib/constants/quizCategories.ts`)
3. ✅ CategoryFilters component (`src/components/library/CategoryFilters.tsx`)
4. ✅ QuizCategoryBadge & QuizTags components (`src/components/library/QuizCategoryBadge.tsx`)
5. ✅ CategorySelector component (`src/components/quiz/CategorySelector.tsx`)
6. ✅ QuizLibrary integration (filters + badges)

## 📝 Còn lại: Tích hợp vào QuizGenerator

### Bước 1: Add State Variables

Thêm vào sau dòng `const [questionCount, setQuestionCount] = useState<string>("");` (khoảng line 84):

```typescript
const [category, setCategory] = useState<QuizCategory>("general");
const [difficulty, setDifficulty] = useState<QuizDifficulty>("medium");
const [tags, setTags] = useState<string[]>([]);
```

### Bước 2: Add Import

Thêm vào đầu file với các imports khác:

```typescript
import { CategorySelector } from "@/components/quiz/CategorySelector";
import type { QuizCategory, QuizDifficulty } from "@/lib/constants/quizCategories";
```

### Bước 3: Add CategorySelector to Form

Thêm sau `</Select>` của Question Count selection (sau line ~1359):

```tsx
                  </div>

                  {/* Category & Difficulty Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-semibold text-foreground">
                        Phân loại quiz
                      </label>
                      <Badge variant="secondary" className="text-xs">
                        Tùy chọn
                      </Badge>
                    </div>
                    <CategorySelector
                      category={category}
                      difficulty={difficulty}
                      tags={tags}
                      onCategoryChange={setCategory}
                      onDifficultyChange={setDifficulty}
                      onTagsChange={setTags}
                    />
                  </div>
```

### Bước 4: Include Category Data in Quiz Save

Tìm function `saveQuizToDatabase` hoặc nơi call supabase insert, thêm category data:

```typescript
const { data, error } = await supabase
  .from("quizzes")
  .insert({
    // ... existing fields
    category: category,
    difficulty: difficulty,
    tags: tags,
  });
```

### Bước 5: Reset Category State

Trong function reset/clear form, thêm:

```typescript
setCategory("general");
setDifficulty("medium");
setTags([]);
```

## 🗄️ Apply Database Migration

Chạy một trong các lệnh sau để apply migration:

```bash
# Option 1: Push to remote
supabase db push

# Option 2: Apply via Dashboard
# Copy nội dung từ supabase/migrations/20250121_add_quiz_categories.sql
# Paste vào SQL Editor trong Supabase Dashboard
# Click Run
```

## 🎨 UI Preview

**QuizLibrary với filters:**
```
[🔍 Tìm kiếm...] [×]
[↕️ Sắp xếp] [🔧 Tìm trong] [📚 Chủ đề] [🎯 Độ khó]
                             ↑ NEW!      ↑ NEW!
```

**Quiz Card với badges:**
```
┌─────────────────────────┐
│ Title                   │
│ Description             │
│ 🎓 Học tập  🟡 Trung bình │ ← NEW!
│ #tag1 #tag2            │ ← NEW!
│ 📈 100  📥 50  📚 10 câu │
└─────────────────────────┘
```

**QuizGenerator form:**
```
Mô tả chủ đề quiz
[Textarea...]

───── Tùy chọn ─────

Số lượng câu hỏi
[Select: 10 câu hỏi ▼]

Phân loại quiz          ← NEW SECTION!
┌─────────────────────────────────┐
│ Chủ đề        │ Độ khó           │
│ [🎓 Học tập ▼] │ [🟡 Trung bình ▼] │
│                                  │
│ Tags (tối đa 5)                  │
│ [lịch sử, việt nam...]           │
│ #lịch-sử #việt-nam              │
└─────────────────────────────────┘
```

## 🔧 Troubleshooting

**TypeScript errors về QuizCategory:**
- Ensure proper imports from `@/lib/constants/quizCategories`
- Check that PublicQuiz interface includes category, difficulty, tags

**Database errors:**
- Make sure migration is applied
- Check that enum type `quiz_category` exists
- Verify columns exist in quizzes table

**UI not showing category filters:**
- Check CategoryFilters component is imported
- Verify state is properly passed as props
- Check console for React errors

## 📦 Files Created/Modified

**Created:**
- `supabase/migrations/20250121_add_quiz_categories.sql`
- `src/lib/constants/quizCategories.ts`
- `src/components/library/CategoryFilters.tsx`
- `src/components/library/QuizCategoryBadge.tsx`
- `src/components/quiz/CategorySelector.tsx`

**Modified:**
- `src/components/library/QuizLibrary.tsx`

**To Modify:**
- `src/components/quiz/QuizGenerator.tsx` (follow steps above)
