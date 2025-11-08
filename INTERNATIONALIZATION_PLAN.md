# Kế Hoạch Triển Khai Đa Ngôn Ngữ (i18n) cho QuizKen

## 📋 Tổng Quan

Tài liệu này mô tả kế hoạch chi tiết để triển khai hệ thống đa ngôn ngữ (internationalization - i18n) cho ứng dụng QuizKen, hỗ trợ tiếng Việt (hiện tại) và tiếng Anh.

### Mục Tiêu

- ✅ Hỗ trợ 2 ngôn ngữ: Tiếng Việt (vi) và Tiếng Anh (en)
- ✅ Cho phép người dùng chuyển đổi ngôn ngữ dễ dàng
- ✅ Lưu trữ preference ngôn ngữ của người dùng
- ✅ SEO-friendly với hỗ trợ đa ngôn ngữ
- ✅ Backend/AI phản hồi theo ngôn ngữ được chọn
- ✅ Không ảnh hưởng đến hiệu năng hiện tại

---

## 🏗️ Kiến Trúc Hệ Thống

### 1. Phân Tích Hiện Trạng

**Các file chứa hard-coded Vietnamese text (121 kết quả):**

- UI Components: Navbar, Hero, Features, Footer, Quiz Generator, Quiz Content
- Pages: Index, Dashboard, About, Library, NotFound
- Modals & Dialogs: AuthModal, ApiKeySettings, QuotaLimitDialog
- Toast notifications và error messages
- SEO metadata và siteMeta config

**Dependencies hiện tại:**

- React 18.3.1
- TypeScript
- Supabase (Auth, Database)
- React Router v6
- shadcn/ui components

### 2. Giải Pháp Kỹ Thuật

**Lựa chọn thư viện: `i18next` + `react-i18next`**

**Lý do:**

- ✅ Lightweight và hiệu năng cao
- ✅ TypeScript support tốt
- ✅ React hooks hỗ trợ tốt
- ✅ Namespace organization
- ✅ Lazy loading translations
- ✅ ICU MessageFormat cho pluralization
- ✅ Cộng đồng lớn và tài liệu đầy đủ

---

## 📁 Cấu Trúc Thư Mục

```
src/
├── locales/
│   ├── en/
│   │   ├── common.json          # Chung (buttons, labels)
│   │   ├── navigation.json      # Navbar, Footer
│   │   ├── hero.json           # Hero section
│   │   ├── features.json       # Features section
│   │   ├── quiz.json           # Quiz generator & content
│   │   ├── auth.json           # Authentication
│   │   ├── dashboard.json      # Dashboard
│   │   ├── library.json        # Quiz library
│   │   ├── errors.json         # Error messages
│   │   ├── validation.json     # Form validation
│   │   └── seo.json            # SEO metadata
│   ├── vi/
│   │   ├── common.json
│   │   ├── navigation.json
│   │   ├── hero.json
│   │   ├── features.json
│   │   ├── quiz.json
│   │   ├── auth.json
│   │   ├── dashboard.json
│   │   ├── library.json
│   │   ├── errors.json
│   │   ├── validation.json
│   │   └── seo.json
│   └── index.ts                # Export all translations
├── lib/
│   └── i18n.ts                 # i18n configuration
├── contexts/
│   └── LanguageContext.tsx     # Language provider
├── hooks/
│   └── useLanguage.ts          # Custom language hook
└── components/
    └── LanguageSwitcher.tsx    # Language toggle UI
```

---

## 🔧 Chi Tiết Triển Khai

### Phase 1: Cài Đặt và Cấu Hình (1-2 giờ)

**1.1. Cài đặt dependencies**

```bash
npm install i18next react-i18next i18next-browser-languagedetector
npm install -D @types/i18next
```

**1.2. Tạo cấu hình i18n**

File: `src/lib/i18n.ts`

```typescript
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translations
import enCommon from "@/locales/en/common.json";
import viCommon from "@/locales/vi/common.json";
// ... import other namespaces

const resources = {
  en: {
    common: enCommon,
    navigation: enNavigation,
    // ... other namespaces
  },
  vi: {
    common: viCommon,
    navigation: viNavigation,
    // ... other namespaces
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "vi",
    defaultNS: "common",
    ns: [
      "common",
      "navigation",
      "hero",
      "features",
      "quiz",
      "auth",
      "dashboard",
      "library",
      "errors",
      "validation",
      "seo",
    ],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "quizken_language",
    },
  });

export default i18n;
```

**1.3. Tích hợp vào main.tsx**

```typescript
import "./lib/i18n"; // Import before React
import { Suspense } from "react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Suspense fallback={<div>Loading...</div>}>
    <App />
  </Suspense>
);
```

---

### Phase 2: Tạo Translation Files (3-4 giờ)

**2.1. Structure cho từng namespace**

**common.json** (Buttons, Labels chung)

```json
{
  "buttons": {
    "create": "Create",
    "createQuiz": "Create Quiz",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "save": "Save",
    "delete": "Delete",
    "download": "Download",
    "login": "Log In",
    "logout": "Log Out",
    "later": "Later",
    "close": "Close"
  },
  "labels": {
    "required": "Required",
    "optional": "Optional",
    "loading": "Loading..."
  },
  "time": {
    "minutes": "{{count}} minute",
    "minutes_plural": "{{count}} minutes"
  }
}
```

**quiz.json** (Quiz-specific translations)

```json
{
  "generator": {
    "title": "Create Your Quiz",
    "description": "Describe the quiz topic and let AI generate engaging questions",
    "topicLabel": "Quiz Topic",
    "topicPlaceholder": "Example: Create multiple choice questions about World War 2 for high school students...",
    "questionCountLabel": "Number of Questions",
    "questionCountPlaceholder": "Select number of questions",
    "estimatedTime": "Estimated time: {{min}}-{{max}} minutes",
    "createButton": "Create Quiz Now",
    "fillAllFields": "Please fill in all required information"
  },
  "validation": {
    "topicRequired": "Please enter a topic",
    "topicMin": "Please enter at least 5 characters",
    "topicMax": "Maximum 500 characters allowed",
    "invalidChars": "Only letters, numbers and basic punctuation allowed",
    "inappropriateContent": "Topic contains inappropriate words",
    "questionCountRequired": "Please select number of questions"
  },
  "progress": {
    "preparing": "Preparing...",
    "generating": "Generating AI questions...",
    "processing": "Processing...",
    "failed": "❌ Failed to create quiz",
    "expired": "⏰ Quiz has expired",
    "success": "Quiz created successfully!",
    "successDescription": "Created \"{{title}}\" with {{count}} questions"
  },
  "quota": {
    "freeAttempts": "Free attempts: {{remaining}}/{{total}}",
    "limitReached": "Free attempts exhausted",
    "loginForUnlimited": "Log in for unlimited access"
  }
}
```

**Tương tự cho các namespace khác...**

---

### Phase 3: Context & Hooks (1-2 giờ)

**3.1. LanguageContext**

File: `src/contexts/LanguageContext.tsx`

```typescript
import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

type Language = "vi" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n, t } = useTranslation();
  const [language, setLanguageState] = useState<Language>(
    (localStorage.getItem("quizken_language") as Language) || "vi"
  );

  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem("quizken_language", language);
    document.documentElement.lang = language;
  }, [language, i18n]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
```

**3.2. Custom Hook cho Translations**

File: `src/hooks/useLanguage.ts`

```typescript
import { useTranslation } from "react-i18next";

export const useLanguage = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang: "vi" | "en") => {
    i18n.changeLanguage(lang);
    localStorage.setItem("quizken_language", lang);
    document.documentElement.lang = lang;
  };

  return {
    t,
    language: i18n.language as "vi" | "en",
    changeLanguage,
  };
};
```

---

### Phase 4: Language Switcher UI (1 giờ)

**4.1. LanguageSwitcher Component**

File: `src/components/LanguageSwitcher.tsx`

```typescript
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "@/lib/icons";
import { useLanguage } from "@/hooks/useLanguage";

const languages = {
  vi: { name: "Tiếng Việt", flag: "🇻🇳" },
  en: { name: "English", flag: "🇬🇧" },
};

export function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{languages[language].flag}</span>
          <span className="hidden md:inline">{languages[language].name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languages).map(([code, { name, flag }]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => changeLanguage(code as "vi" | "en")}
            className={language === code ? "bg-accent" : ""}>
            <span className="mr-2">{flag}</span>
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**4.2. Tích hợp vào Navbar**

```typescript
// src/components/layout/Navbar.tsx
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

// Thêm vào desktop menu
<div className="hidden md:flex items-center space-x-4">
  <LanguageSwitcher />
  {/* ... existing auth buttons */}
</div>;

// Thêm vào mobile menu
{
  isOpen && (
    <div className="md:hidden py-4 space-y-4">
      <div className="pb-2">
        <LanguageSwitcher />
      </div>
      {/* ... existing menu items */}
    </div>
  );
}
```

---

### Phase 5: Migrate Components (8-10 giờ)

**5.1. Pattern chuyển đổi**

**Trước:**

```typescript
<h1>Tạo Bài Kiểm Tra Tuyệt Vời với AI</h1>
```

**Sau:**

```typescript
import { useTranslation } from "react-i18next";

const { t } = useTranslation("hero");
<h1>{t("title")}</h1>;
```

**5.2. Priority Order (thứ tự ưu tiên)**

1. **High Priority** - User-facing, frequently used:

   - ✅ Navbar (`src/components/layout/Navbar.tsx`)
   - ✅ Hero (`src/components/sections/Hero.tsx`)
   - ✅ QuizGenerator (`src/components/quiz/QuizGenerator.tsx`)
   - ✅ QuizContent (`src/components/quiz/QuizContent.tsx`)
   - ✅ AuthModal (`src/components/AuthModal.tsx`)

2. **Medium Priority** - Important but less critical:

   - Features (`src/components/sections/Features.tsx`)
   - Footer (`src/components/layout/Footer.tsx`)
   - Dashboard (`src/pages/Dashboard.tsx`)
   - QuizLibrary (`src/components/library/QuizLibrary.tsx`)

3. **Low Priority** - Rarely seen:
   - About (`src/pages/About.tsx`)
   - NotFound (`src/pages/NotFound.tsx`)
   - ApiKeySettings (`src/components/ApiKeySettings.tsx`)

**5.3. Migration Example cho Hero.tsx**

```typescript
// Before
const fullText = "Tạo mọi bài kiểm tra với AI. Phù hợp với tất cả mọi người";

// After
import { useTranslation } from 'react-i18next';
const { t } = useTranslation('hero');
const fullText = t('typingText');

// en/hero.json
{
  "title": "Create Amazing Quizzes with AI in Seconds",
  "typingText": "Create any quiz with AI. Suitable for everyone",
  "cta": {
    "primary": "Create Quiz Now",
    "secondary": "View Examples"
  },
  "badges": {
    "aiPowered": "AI Powered",
    "instant": "Instant Creation",
    "smart": "Smart Questions"
  }
}
```

---

### Phase 6: SEO Đa Ngôn Ngữ (2-3 giờ)

**6.1. Cập nhật SeoMeta Component**

```typescript
// src/components/SeoMeta.tsx
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslation } from "react-i18next";

export function SeoMeta() {
  const { language } = useLanguage();
  const { t } = useTranslation("seo");

  const locale = language === "vi" ? "vi_VN" : "en_US";

  return (
    <Helmet>
      <html lang={language} />
      <title>{t("home.title")}</title>
      <meta name="description" content={t("home.description")} />
      <meta property="og:locale" content={locale} />
      {/* ... */}
    </Helmet>
  );
}
```

**6.2. siteMeta.ts update**

```typescript
// src/config/siteMeta.ts
export const getSiteMetaByLanguage = (lang: "vi" | "en") => {
  const meta = {
    vi: {
      name: "QuizKen",
      description: "QuizKen giúp giáo viên và học sinh tạo bài kiểm tra...",
      locale: "vi_VN",
    },
    en: {
      name: "QuizKen",
      description: "QuizKen helps teachers and students create quizzes...",
      locale: "en_US",
    },
  };
  return meta[lang];
};
```

**6.3. Structured Data Đa Ngôn Ngữ**

```typescript
// src/lib/seoSchemas.ts
export const generateHomepageSchema = (language: "vi" | "en") => {
  const t = getTranslation("seo", language);

  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "QuizKen",
    description: t("home.description"),
    inLanguage: language,
    // ...
  };
};
```

---

### Phase 7: Backend/Edge Functions (3-4 giờ)

**7.1. Supabase Edge Function Update**

File: `supabase/functions/generate-quiz/index.ts`

```typescript
// Thêm language parameter
interface GenerateQuizRequest {
  prompt: string;
  questionCount: number;
  language?: "vi" | "en"; // New field
  // ... existing fields
}

// Cập nhật Gemini prompt
const systemPrompt =
  language === "en"
    ? `You are an expert quiz creator. Generate ${questionCount} multiple choice questions...`
    : `Bạn là chuyên gia tạo câu hỏi. Tạo ${questionCount} câu hỏi trắc nghiệm...`;
```

**7.2. Frontend gửi language parameter**

```typescript
// src/components/quiz/QuizGenerator.tsx
const { language } = useLanguage();

const startQuizPayload = {
  prompt,
  device: deviceInfo,
  questionCount: parseInt(questionCount),
  language, // Add language
  idempotencyKey,
};
```

**7.3. Database Schema Update** (Optional - nếu muốn lưu ngôn ngữ quiz)

```sql
-- Migration: Add language column to quizzes table
ALTER TABLE quizzes
ADD COLUMN language VARCHAR(2) DEFAULT 'vi' CHECK (language IN ('vi', 'en'));

CREATE INDEX idx_quizzes_language ON quizzes(language);
```

---

### Phase 8: Testing & Quality Assurance (2-3 giờ)

**8.1. Unit Tests**

```typescript
// __tests__/i18n.test.ts
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";

describe("i18n", () => {
  it("switches language correctly", async () => {
    await i18n.changeLanguage("en");
    expect(i18n.language).toBe("en");

    await i18n.changeLanguage("vi");
    expect(i18n.language).toBe("vi");
  });

  it("falls back to Vietnamese", () => {
    expect(i18n.options.fallbackLng).toBe("vi");
  });
});
```

**8.2. Manual Testing Checklist**

- [ ] Language switcher hoạt động ở cả desktop và mobile
- [ ] Language preference được lưu vào localStorage
- [ ] Tất cả text được dịch (không còn hard-coded Vietnamese)
- [ ] Toast notifications hiển thị đúng ngôn ngữ
- [ ] Error messages hiển thị đúng ngôn ngữ
- [ ] SEO meta tags update khi đổi ngôn ngữ
- [ ] Quiz được tạo bằng ngôn ngữ đã chọn
- [ ] PDF export có nội dung đúng ngôn ngữ
- [ ] Dashboard hiển thị đúng ngôn ngữ
- [ ] Library filter và search hoạt động với cả 2 ngôn ngữ

**8.3. Performance Testing**

- [ ] Bundle size không tăng quá 50KB
- [ ] First Contentful Paint (FCP) < 1.5s
- [ ] Time to Interactive (TTI) < 3s
- [ ] Language switch < 100ms

---

## 📊 Timeline & Resources

### Tổng thời gian ước tính: **20-30 giờ**

| Phase | Task               | Time  | Priority |
| ----- | ------------------ | ----- | -------- |
| 1     | Setup & Config     | 1-2h  | High     |
| 2     | Translation Files  | 3-4h  | High     |
| 3     | Context & Hooks    | 1-2h  | High     |
| 4     | Language Switcher  | 1h    | High     |
| 5     | Migrate Components | 8-10h | High     |
| 6     | SEO i18n           | 2-3h  | Medium   |
| 7     | Backend Updates    | 3-4h  | Medium   |
| 8     | Testing & QA       | 2-3h  | High     |

### Phân công công việc (nếu có team)

**Developer 1 (Frontend Lead):**

- Phases 1-5: Setup, translations, components migration

**Developer 2 (Backend):**

- Phase 7: Edge Functions update

**Developer 3 (QA):**

- Phase 8: Testing & validation

**Solo Developer:**

- Làm tuần tự theo thứ tự phases

---

## 🎯 Best Practices

### 1. Translation Keys Naming Convention

```
{namespace}.{section}.{element}
quiz.generator.topicLabel
quiz.validation.topicRequired
common.buttons.create
```

### 2. TypeScript Support

```typescript
// Add types for translations
declare module "react-i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof import("./locales/en/common.json");
      quiz: typeof import("./locales/en/quiz.json");
      // ...
    };
  }
}
```

### 3. Pluralization

```json
{
  "questions": {
    "count_one": "{{count}} question",
    "count_other": "{{count}} questions"
  }
}
```

Usage:

```typescript
t("questions.count", { count: 5 }); // "5 questions"
```

### 4. Interpolation

```json
{
  "welcome": "Welcome back, {{name}}!"
}
```

Usage:

```typescript
t("welcome", { name: user.name });
```

### 5. Context-based translations

```json
{
  "create": "Create",
  "create_quiz": "Create Quiz",
  "create_account": "Create Account"
}
```

---

## 🚀 Deployment Strategy

### Stage 1: Development & Testing

- Tạo feature branch: `feature/i18n-support`
- Test thoroughly trên local
- Review với team

### Stage 2: Staging Deploy

- Deploy lên staging environment
- Smoke testing toàn bộ flows
- Performance benchmarking

### Stage 3: Production Rollout

- Feature flag để enable/disable i18n
- Gradual rollout (10% → 50% → 100%)
- Monitor errors và performance
- Rollback plan ready

### Stage 4: Post-launch

- Collect user feedback
- Fix bugs và improve translations
- Add more languages (nếu cần)

---

## 🔍 Monitoring & Analytics

### Metrics to Track

1. **Adoption Rate**

   - % users sử dụng English
   - % users toggle languages

2. **Performance**

   - Bundle size impact
   - Load time by language
   - Translation loading time

3. **Errors**

   - Missing translation keys
   - Runtime i18n errors
   - Backend language mismatch

4. **User Behavior**
   - Language preference by country
   - Quiz creation by language
   - Feature usage by language

---

## 📝 Documentation Updates

### 1. README.md

- Thêm section về multi-language support
- Hướng dẫn đóng góp translations
- Language switcher usage

### 2. CONTRIBUTING.md (new file)

```markdown
# Contributing Translations

## Adding a new language

1. Create folder in `src/locales/{lang-code}/`
2. Copy all JSON files from `en/` or `vi/`
3. Translate all strings
4. Update `src/lib/i18n.ts`
5. Add language to `LanguageSwitcher.tsx`
6. Submit PR

## Translation Guidelines

- Keep keys consistent
- Preserve placeholders ({{variable}})
- Test with actual UI
- Check context and tone
```

### 3. API Documentation

- Document language parameter in Edge Functions
- Update Swagger/OpenAPI specs

---

## ⚠️ Known Issues & Solutions

### Issue 1: Date/Time Formatting

**Problem:** Dates may display in wrong format for language

**Solution:**

```typescript
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";

const locale = language === "vi" ? vi : enUS;
format(date, "PPP", { locale });
```

### Issue 2: Number Formatting

**Problem:** Numbers format differently (1,000 vs 1.000)

**Solution:**

```typescript
const numberFormatter = new Intl.NumberFormat(
  language === "vi" ? "vi-VN" : "en-US"
);
numberFormatter.format(1000); // "1,000" or "1.000"
```

### Issue 3: RTL Languages (Future)

**Problem:** Arabic, Hebrew require RTL layout

**Solution:** Add `dir` attribute:

```typescript
<html lang={language} dir={isRTL ? 'rtl' : 'ltr'}>
```

---

## 🎓 Learning Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Guide](https://react.i18next.com/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [Web Localization Best Practices](https://www.w3.org/International/questions/qa-i18n)

---

## ✅ Success Criteria

- [ ] 100% UI text được dịch
- [ ] Language switcher hoạt động mượt mà
- [ ] Performance không giảm > 5%
- [ ] SEO metadata đúng cho mỗi ngôn ngữ
- [ ] Backend tạo quiz đúng ngôn ngữ
- [ ] Zero runtime errors liên quan i18n
- [ ] User feedback >= 4.5/5 stars
- [ ] Adoption rate >= 20% cho English sau 1 tháng

---

## 📞 Support & Questions

Nếu có vấn đề trong quá trình triển khai:

1. Check documentation này
2. Search existing issues
3. Ask in team chat
4. Create GitHub issue with [i18n] tag

---

**Last Updated:** 2025-01-07  
**Version:** 1.0  
**Author:** Architect Mode - QuizKen Team
