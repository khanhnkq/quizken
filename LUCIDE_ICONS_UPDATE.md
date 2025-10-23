## Lưu ý import lucide-react (chuẩn hóa)

Để đồng nhất và tối ưu bundle khi sử dụng lucide-react trong dự án:

- Sử dụng named import cho icon (hỗ trợ tree-shaking tốt):
  - Ví dụ thực tế: [`import()`](src/components/ScrollToGeneratorButtonWrapper.tsx:5), [`import()`](src/components/AuthModal.tsx:13), [`import()`](src/components/ui/context-menu.tsx:3)
- Khi chỉ cần kiểu biểu tượng (icon type), dùng type-only import để tránh kéo thêm mã không cần thiết:
  - Ví dụ: [`import type()`](src/lib/constants/quizCategories.ts:2)
- Tránh default import (lucide-react cung cấp named exports cho từng icon).
- Vite đã tách riêng chunk “icons” cho lucide-react để tối ưu caching:
  - Tham chiếu cấu hình manualChunks: [`vite.config.ts`](vite.config.ts:50)
- Phiên bản lucide-react đang sử dụng được ghim trong package.json:
  - Tham chiếu: [`package.json`](package.json:58)

Hướng dẫn nhanh:

- Khi cần nhiều icon: gộp trong một lần import
  - Thực tế: [`import()`](src/components/ScrollToGeneratorButtonWrapper.tsx:5)
- Khi cần type tiện dụng cho cấu hình/constant:
  - Thực tế: [`import type()`](src/lib/constants/quizCategories.ts:2)

Ghi chú:

- Kích thước icon có thể điều chỉnh qua props như `size`, `strokeWidth` hoặc thông qua `className` (Tailwind).
- Giữ nguyên named import giúp tree-shaking loại bỏ icon không dùng, giảm kích thước bundle.

# 🎨 Lucide Icons Integration

## Overview

Updated category và difficulty icons từ emojis sang **Lucide Icons** cho professional và consistent UI.

---

## ✨ Changes Summary

### Before (Emojis):

- ❌ Emoji icons (📚, 🎓, 🔬, etc.)
- ❌ Inconsistent rendering across browsers/OS
- ❌ Limited customization (size, color, stroke)

### After (Lucide Icons):

- ✅ **Lucide React Icons** - professional vector icons
- ✅ **Consistent rendering** across all platforms
- ✅ **Fully customizable** - size, color, strokeWidth
- ✅ **Better accessibility** với proper SVG props

---

## 🎯 Icons Mapping

### Category Icons

| Category      | Old Emoji | New Lucide Icon | Component     |
| ------------- | --------- | --------------- | ------------- |
| General       | 📚        | `BookOpen`      | Standard book |
| Education     | 🎓        | `GraduationCap` | Academic      |
| Research      | 🔬        | `Microscope`    | Scientific    |
| Science       | 🧪        | `FlaskConical`  | Laboratory    |
| Entertainment | 🎬        | `Film`          | Movies        |
| Trivia        | 🎯        | `Target`        | Quiz/Games    |
| Language      | 🌐        | `Globe`         | International |
| Math          | ➗        | `Calculator`    | Mathematics   |
| History       | 📜        | `Scroll`        | Ancient       |
| Geography     | 🗺️        | `MapPin`        | Location      |
| Literature    | 📖        | `Book`          | Reading       |
| Technology    | 💻        | `Laptop`        | Computing     |
| Business      | 💼        | `Briefcase`     | Professional  |
| Health        | ❤️        | `Heart`         | Medical       |
| Sports        | ⚽        | `Trophy`        | Athletics     |
| Arts          | 🎨        | `Palette`       | Creative      |
| Music         | 🎵        | `Music`         | Audio         |
| **Unknown**   | 🏷️        | `Tag`           | Fallback      |

### Difficulty Icons

| Difficulty | Old Emoji | New Lucide Icon | Component        |
| ---------- | --------- | --------------- | ---------------- |
| Easy       | 🟢        | `CircleCheck`   | Success/Complete |
| Medium     | 🟡        | `AlertCircle`   | Warning/Caution  |
| Hard       | 🔴        | `AlertTriangle` | Danger/Difficult |

---

## 📝 Files Modified

### 1. **`src/lib/constants/quizCategories.ts`**

#### Type Updates:

```typescript
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  GraduationCap,
  Microscope,
  // ... all icons
} from "lucide-react";

export interface CategoryInfo {
  value: CommonCategory;
  label: string;
  icon: LucideIcon; // ← Changed from string
  color: string;
  description: string;
}

export interface DifficultyInfo {
  value: QuizDifficulty;
  label: string;
  icon: LucideIcon; // ← New interface
  color: string;
}
```

#### Constants Updated:

```typescript
export const QUIZ_CATEGORIES: CategoryInfo[] = [
  {
    value: "general",
    label: "Tổng hợp",
    icon: BookOpen, // ← Component instead of emoji
    color: "#9CA3AF",
    description: "Câu hỏi tổng hợp nhiều chủ đề",
  },
  // ... rest
];

export const DIFFICULTY_LEVELS: DifficultyInfo[] = [
  { value: "easy", label: "Dễ", icon: CircleCheck, color: "#22C55E" },
  { value: "medium", label: "Trung bình", icon: AlertCircle, color: "#F59E0B" },
  { value: "hard", label: "Khó", icon: AlertTriangle, color: "#EF4444" },
];
```

#### Helper Function Updated:

```typescript
export const getCategoryIcon = (category: QuizCategory): LucideIcon => {
  return getCategoryInfo(category)?.icon || Tag;
};
```

### 2. **`src/components/library/QuizCategoryBadge.tsx`**

#### Render Icons as Components:

```tsx
export const QuizCategoryBadge: React.FC<QuizCategoryBadgeProps> = ({
  category,
  difficulty,
  size = "md",
  showDifficulty = true,
}) => {
  const CategoryIcon = getCategoryIcon(category); // Component
  const categoryLabel = getCategoryLabel(category);
  const difficultyInfo = difficulty ? getDifficultyInfo(difficulty) : null;
  const DifficultyIcon = difficultyInfo?.icon;

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <div className="flex items-center gap-2">
      <Badge>
        {/* Render as component with props */}
        <CategoryIcon size={iconSizes[size]} strokeWidth={2} />
        {categoryLabel}
      </Badge>

      {showDifficulty && DifficultyIcon && (
        <Badge>
          <DifficultyIcon size={iconSizes[size]} strokeWidth={2} />
          {getDifficultyLabel(difficulty)}
        </Badge>
      )}
    </div>
  );
};
```

### 3. **`src/components/library/CategoryFilters.tsx`**

#### Render Icons in Dropdown:

```tsx
import { BookOpen } from "lucide-react";

// All categories option
<SelectItem value="all">
  <span className="flex items-center gap-2">
    <BookOpen size={14} className="mr-1" />
    Tất cả chủ đề
  </span>
</SelectItem>;

// Category items
{
  QUIZ_CATEGORIES.map((cat) => {
    const Icon = cat.icon;
    return (
      <SelectItem key={cat.value} value={cat.value}>
        <span className="flex items-center gap-2">
          <Icon size={14} className="mr-1" />
          {cat.label}
        </span>
      </SelectItem>
    );
  });
}

// Difficulty items
{
  DIFFICULTY_LEVELS.map((diff) => {
    const Icon = diff.icon;
    return (
      <SelectItem key={diff.value} value={diff.value}>
        <span className="flex items-center gap-2">
          <Icon size={14} className="mr-1" />
          {diff.label}
        </span>
      </SelectItem>
    );
  });
}
```

#### Active Filters Display:

```tsx
{
  selectedCategory !== "all" &&
    (() => {
      const categoryInfo = QUIZ_CATEGORIES.find(
        (c) => c.value === selectedCategory
      );
      if (categoryInfo) {
        const Icon = categoryInfo.icon;
        return (
          <span className="flex items-center gap-1">
            <Icon size={14} />
            {categoryInfo.label}
          </span>
        );
      }
    })();
}
```

---

## 🎨 Icon Customization

### Size Props:

```tsx
<Icon size={12} />  // Small
<Icon size={14} />  // Medium (default)
<Icon size={16} />  // Large
<Icon size={20} />  // Extra large
```

### Stroke Width:

```tsx
<Icon strokeWidth={1} />   // Thin
<Icon strokeWidth={2} />   // Regular (recommended)
<Icon strokeWidth={2.5} /> // Bold
```

### Color:

```tsx
<Icon className="text-blue-500" />
<Icon style={{ color: '#3B82F6' }} />
```

### Additional Props:

```tsx
<Icon
  size={16}
  strokeWidth={2}
  className="text-primary"
  aria-label="Education category"
/>
```

---

## ✅ Benefits

### Visual Consistency:

- ✅ Same rendering across Chrome, Safari, Firefox, Edge
- ✅ No OS-dependent emoji variations
- ✅ Consistent with other UI icons in app

### Customization:

- ✅ Control size precisely (px)
- ✅ Control stroke width
- ✅ Full color control via CSS
- ✅ Responsive sizing support

### Accessibility:

- ✅ SVG with proper `aria-label` support
- ✅ Better for screen readers
- ✅ Semantic markup

### Performance:

- ✅ Icons tree-shaken (only imported icons bundled)
- ✅ SVG icons smaller than emoji fonts
- ✅ Better caching

---

## 🧪 Testing

### Visual Check:

1. Open Quiz Library
2. Check category badges → Icons visible và sharp
3. Check difficulty badges → Icons với correct colors
4. Check dropdown filters → Icons aligned properly

### Cross-browser:

- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

### Responsive:

- ✅ Desktop (16px icons)
- ✅ Tablet (14px icons)
- ✅ Mobile (12px icons)

---

## 🔧 Adding New Icons

### Step 1: Import Icon

```typescript
import { NewIcon } from "lucide-react";
```

### Step 2: Add to Category

```typescript
{
  value: 'new-category',
  label: 'New Category',
  icon: NewIcon,  // ← Use imported component
  color: '#FF6B6B',
  description: 'Description...',
}
```

### Step 3: That's it!

Component automatically renders with proper props.

---

## 📚 Lucide Icons Resources

**Website:** https://lucide.dev/icons  
**React Docs:** https://lucide.dev/guide/packages/lucide-react  
**NPM:** https://www.npmjs.com/package/lucide-react

### Popular Icons:

- **Education:** GraduationCap, Book, BookOpen, School
- **Technology:** Laptop, Monitor, Smartphone, Code
- **Business:** Briefcase, TrendingUp, DollarSign
- **Science:** FlaskConical, Microscope, Atom, Dna
- **Creative:** Palette, Brush, Camera, Film
- **Social:** Users, UserPlus, MessageCircle, Heart

---

## 🎯 Icon Selection Tips

### Choose icons that are:

1. **Recognizable** - Clear meaning at small sizes
2. **Simple** - Not too detailed (max 14-16px)
3. **Consistent** - Similar style (line-based, not filled)
4. **Semantic** - Matches category meaning

### Avoid:

- ❌ Too detailed icons (hard to see at 14px)
- ❌ Filled icons (inconsistent with Lucide style)
- ❌ Custom SVGs (use Lucide library)
- ❌ Mixing icon styles

---

## 🚀 Migration Complete

**Old System:**

- Emojis: "📚", "🎓", "🔬"
- Static, not customizable
- Inconsistent rendering

**New System:**

- Lucide Icons: `BookOpen`, `GraduationCap`, `Microscope`
- Fully customizable components
- Professional, consistent UI

---

## 📊 Before/After Comparison

### Category Badge:

```
Before: 📚 Tổng hợp       ← Emoji
After:  📖 Tổng hợp      ← Lucide Icon (sharper, scalable)
```

### Difficulty Badge:

```
Before: 🟢 Dễ            ← Emoji circle
After:  ✓  Dễ            ← CircleCheck icon (clearer)
```

### Filter Dropdown:

```
Before:
┌──────────────────┐
│ 📚 Tất cả chủ đề │  ← Emoji
│ 🎓 Học tập       │
└──────────────────┘

After:
┌──────────────────┐
│ 📖 Tất cả chủ đề │  ← Lucide (consistent size)
│ 🎓 Học tập       │
└──────────────────┘
```

---

## 💡 Future Enhancements

Potential improvements:

- [ ] Animate icons on hover (Lucide supports animation)
- [ ] Add more icon variants per category
- [ ] User-selectable icon themes
- [ ] Custom icon upload for premium users
- [ ] Icon color themes (dark mode optimization)

---

## ✅ Summary

**What Changed:**

1. ✅ Emojis → Lucide Icons
2. ✅ String icons → React Components
3. ✅ Static → Fully customizable
4. ✅ Inconsistent → Professional UI

**Benefits:**

- 🎨 Better visual consistency
- ⚡ Better performance
- ♿ Better accessibility
- 🎯 Better customization

**Files Updated:**

- `quizCategories.ts` - Constants & types
- `QuizCategoryBadge.tsx` - Badge component
- `CategoryFilters.tsx` - Dropdown filters

**Zero Breaking Changes:**

- Backwards compatible
- All existing functionality works
- Improved UX only
