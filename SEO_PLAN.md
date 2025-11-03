# Kế Hoạch SEO Cơ Bản - QuizKen

**Ngày tạo:** November 3, 2025  
**Phiên bản:** 1.0  
**Trạng thái:** Đang triển khai

---

## 📋 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Phân Tích Từ Khóa](#phân-tích-từ-khóa)
3. [Tối Ưu Hóa On-Page](#tối-ưu-hóa-on-page)
4. [Tối Ưu Hóa Technical SEO](#tối-ưu-hóa-technical-seo)
5. [Chiến Lược Content](#chiến-lược-content)
6. [Link Building & Off-Page](#link-building--off-page)
7. [Monitoring & Analytics](#monitoring--analytics)
8. [Timeline & Milestones](#timeline--milestones)

---

## 🎯 Tổng Quan

### Mục Tiêu SEO

- **Lục 3 tháng:** Xếp hạng top 20 cho từ khóa chính (Việt)
- **Lục 6 tháng:** Tăng organic traffic 50%+ từ Google Search
- **Dài hạn:** Trở thành giải pháp hàng đầu cho tạo quiz AI Tiếng Việt

### Tính Chất Dự Án

- **Platform:** Quiz Generator AI (SPA/Vite + React)
- **Thị Trường:** Tiếng Việt (Primary), tiềm năng tiếng Anh (Secondary)
- **Kiểu Nội Dung:** Educational Technology, AI Tools
- **Domain:** quizken.vercel.app (cải thiện: app.quizken.com)

---

## 🔍 Phân Tích Từ Khóa

### Từ Khóa Chính (Primary Keywords)

| Từ Khóa             | Mục Tiêu      | Difficulty | Volume     |
| ------------------- | ------------- | ---------- | ---------- |
| tạo đề kiểm tra AI  | Blog, Hero    | Trung bình | Cao        |
| trắc nghiệm online  | Tools, Blog   | Cao        | Cao        |
| generator quiz      | Blog, SEO     | Cao        | Trung bình |
| đề kiểm tra tự động | Blog, About   | Trung bình | Trung bình |
| học tập trực tuyến  | Blog, Blog    | Cao        | Rất cao    |
| AI giáo dục         | Blog, Content | Cao        | Trung bình |

### Từ Khóa Thứ Cấp (Long-tail Keywords)

- "cách tạo đề kiểm tra nhanh với AI"
- "công cụ tạo quiz cho giáo viên"
- "ứng dụng làm bài trắc nghiệm online"
- "quiz generator tiếng Việt"
- "tạo bài test online miễn phí"
- "phần mềm quản lý học sinh online"

### Semantic Keywords (LSI)

- kiểm tra, đánh giá, quiz, trắc nghiệm, bài tập
- tạo, sinh, generate, soạn, lập
- AI, trí tuệ nhân tạo, máy học, tự động
- giáo viên, học sinh, giáo dục, lớp học

---

## 🎨 Tối Ưu Hóa On-Page

### 1. Title Tags & Meta Descriptions

#### Trang Chủ

```
Title: QuizKen - Tạo Đề Kiểm Tra AI Miễn Phí | Trắc Nghiệm Online
Meta Desc: QuizKen giúp giáo viên tạo đề kiểm tra trắc nghiệm với AI trong vài giây.
           Hỗ trợ 100+ chủ đề, tự động chấm điểm, xuất PDF.
```

#### Trang About

```
Title: Về QuizKen - AI Quiz Generator Cho Giáo Dục Tiếng Việt
Meta Desc: Tìm hiểu về QuizKen, nền tảng tạo quiz AI hàng đầu tại Việt Nam.
           Công nghệ, tiêu chí, đội ngũ phía sau ứng dụng.
```

### 2. Heading Structure (H1, H2, H3)

```
H1: Tạo Đề Kiểm Tra Trắc Nghiệm Với AI - Nhanh, Dễ, Miễn Phí
  H2: Tính Năng Chính
    H3: Tạo Đề Tự Động
    H3: Chấm Điểm Tự Động
  H2: Cách Sử Dụng
  H2: Các Chủ Đề Hỗ Trợ
```

### 3. Schema Markup (JSON-LD)

#### SoftwareApplication Schema

```json
{
  "@context": "https://schema.org/",
  "@type": "SoftwareApplication",
  "name": "QuizKen",
  "description": "AI-powered quiz generator for teachers and students",
  "url": "https://quizken.vercel.app",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "VND"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "150"
  }
}
```

#### LocalBusiness Schema (Việt Nam)

```json
{
  "@context": "https://schema.org/",
  "@type": "LocalBusiness",
  "name": "QuizKen Vietnam",
  "description": "Leading AI Quiz Generator in Vietnam",
  "url": "https://quizken.vercel.app",
  "areaServed": "VN",
  "contactType": "Customer Service"
}
```

#### FAQ Schema

Thêm FAQ Schema cho phần FAQ trang web.

### 4. Internal Linking Strategy

```
Trang Chủ
  ├─→ /about → Giới thiệu chi tiết
  ├─→ /blog/how-to-create-quiz → Hướng dẫn
  ├─→ /blog/ai-education → Bài viết chủ đề
  └─→ /how-it-works → Cách hoạt động

About Page
  ├─→ Trang Chủ
  └─→ /blog/why-quizken → Tại sao chọn QuizKen

Blog Posts
  ├─→ Trang Chủ & About
  └─→ Các bài viết liên quan
```

### 5. Image Optimization

- Đặt tên: `quiz-generator-ai-example.webp` (thay vì `image1.png`)
- Alt text: `"Ví dụ đề kiểm tra được tạo bởi QuizKen AI"`
- Format: WebP (đã tối ưu hóa)
- Kích thước: Tối ưu cho mobile (max 100KB cho hero image)

---

## ⚙️ Tối Ưu Hóa Technical SEO

### 1. Core Web Vitals

- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

**Hành động:**

- Tối ưu hóa bundle size (đang làm qua Vite)
- Lazy load images & components
- Preload critical resources
- Minimize JavaScript execution

### 2. Mobile Responsiveness

- ✅ Đã sử dụng Tailwind CSS responsive
- **Action:** Kiểm tra Mobile Friendly Test hàng tháng

### 3. XML Sitemap

Tạo `public/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://quizken.vercel.app/</loc>
    <lastmod>2025-11-03</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://quizken.vercel.app/about</loc>
    <lastmod>2025-11-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://quizken.vercel.app/blog</loc>
    <lastmod>2025-11-03</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

### 4. Robots.txt

Tạo `public/robots.txt`:

```
User-agent: *
Allow: /
Allow: /blog
Disallow: /api/*
Disallow: /admin/*

Sitemap: https://quizken.vercel.app/sitemap.xml
```

### 5. Canonical URLs

```jsx
<link rel="canonical" href="https://quizken.vercel.app/" />
```

### 6. SSL/HTTPS

- ✅ Đã triển khai trên Vercel (tự động HTTPS)

### 7. Page Speed Optimization

**Hiện tại:**

- Lighthouse Score: Cần kiểm tra
- Bundle Size: ~150KB+ (đang tối ưu)

**Khuyến nghị:**

- Gzip compression ✅ (Vercel)
- Image optimization ✅ (WebP)
- CSS-in-JS optimization: Sử dụng Tailwind (tối ưu)
- Code splitting: Vite đã hỗ trợ

### 8. Structured Data (đã bắt đầu)

✅ Có `SeoMeta.tsx` - cần mở rộng để hỗ trợ:

- Product Schema
- Organization Schema
- BreadcrumbList Schema
- Article Schema

---

## 📝 Chiến Lược Content

### Nội Dung Chính Cần Tạo

#### Blog Posts (Content Pillar)

| Tiêu Đề                                                    | Từ Khóa Target     | Độ Dài    | Ưu Tiên |
| ---------------------------------------------------------- | ------------------ | --------- | ------- |
| "Hướng Dẫn Tạo Đề Kiểm Tra AI: 5 Phút Giáo Viên Có Ngay"   | tạo đề kiểm tra AI | 1500-2000 | 🔴 P1   |
| "Tích Hợp Quiz Online Vào Lớp Học: Hướng Dẫn Thực Tế"      | trắc nghiệm online | 1800-2200 | 🔴 P1   |
| "So Sánh: QuizKen vs Kahoot vs Quizizz cho Giáo Viên"      | quiz generator     | 2000-2500 | 🟠 P2   |
| "AI Trong Giáo Dục: Tương Lai Học Tập & Kiểm Tra"          | AI giáo dục        | 2000-2500 | 🟠 P2   |
| "Mẹo Tạo Đề Kiểm Tra Hiệu Quả: Từ Lý Thuyết Đến Thực Hành" | đề kiểm tra        | 1500-2000 | 🟡 P3   |

#### Landing Pages

- `/resources/teachers` - Tài nguyên cho giáo viên
- `/resources/students` - Tài nguyên cho học sinh
- `/features` - Trang tính năng chi tiết

#### Video Content (YouTube SEO)

- "Tạo Quiz AI Trong 3 Phút" (Shorts + Full Video)
- "Tutorial: Từ Đề Tài Đến Quiz Hoàn Chỉnh"
- "Câu Hỏi Thường Gặp QuizKen"

### Content Calendar

**Tháng 11 - 12 (2025):**

- Week 1-2: "Hướng Dẫn Tạo Đề Kiểm Tra AI" (SEO Blog)
- Week 3-4: "Tích Hợp Quiz Online Vào Lớp Học" (SEO Blog)

**Tháng 1 - 3 (2026):**

- Bi-weekly blog posts (2 bài/tháng)
- Monthly comparison posts
- Seasonal content (kỳ thi, học kỳ)

---

## 🔗 Link Building & Off-Page

### 1. Backlink Strategy

#### High-Authority Vietnamese Websites

- **Giáo dục:**
  - VnExpress Giáo Dục
  - Eduviet.vn
  - Thư viện học liệu
- **Tech & Startup:**
  - Viblo.asia
  - Techtalk.vn
  - Startup Vietnam communities

#### International Tech Blogs

- Product Hunt (Product Launch)
- Hacker News (Nếu có AI angle)
- Alternative To (Quiz generators category)

### 2. Digital PR

- Liên hệ với giáo viên blogger
- Press release trên TechCrunch VN
- Guest posting trên education blogs

### 3. Social Media Amplification

- **Facebook:** Tạo page + Community
- **LinkedIn:** Corporate content, use cases
- **YouTube:** Video tutorials, how-tos
- **TikTok:** Short demos, tips (trending)

### 4. Partnerships

- Liên kết với các trường, trung tâm anh ngữ
- Cộng tác với blogger giáo dục
- Co-marketing với EdTech platforms

### 5. Local SEO (Nếu có phiên bản ứng dụng di động)

- Google My Business (QuizKen Vietnam)
- Local citations (Thư viện địa chỉ Việt)

---

## 📊 Monitoring & Analytics

### 1. Tools Setup

#### Google Search Console

- Sitemap submission
- Crawl error monitoring
- Search performance tracking
- Mobile usability issues

#### Google Analytics 4

- **Goals:**

  - Quiz generation (Primary goal)
  - Sign up/Login
  - FAQ viewed
  - Blog article read time > 2 min

- **Custom Events:**
  - `quiz_created`
  - `quiz_shared`
  - `pdf_downloaded`

#### Other Tools

- Semrush / Ahrefs (Monthly ranking check)
- PageSpeed Insights (Weekly)
- Lighthouse (Monthly audit)

### 2. Key Metrics to Track

| Metric                          | Target          | Frequency |
| ------------------------------- | --------------- | --------- |
| Organic Traffic                 | +50% (6 months) | Daily     |
| Keyword Rankings (Top 20)       | +10 keywords    | Weekly    |
| Avg. Position (Target Keywords) | < 15            | Weekly    |
| CTR from SERP                   | > 3%            | Monthly   |
| Bounce Rate                     | < 50%           | Weekly    |
| Avg. Session Duration           | > 2 min         | Weekly    |
| Core Web Vitals                 | All Green       | Real-time |
| Backlink Count                  | +5-10 / month   | Monthly   |

### 3. SEO Audit Checklist (Monthly)

- [ ] Crawl site for broken links
- [ ] Check mobile responsiveness
- [ ] Verify structured data
- [ ] Review meta tags (title/description)
- [ ] Check page speed
- [ ] Analyze keyword rankings
- [ ] Review new backlinks
- [ ] Check competitor activity

---

## 🚀 Timeline & Milestones

### Phase 1: Foundation (Tháng 11-12, 2025) ⏳

**Objectives:**

- ✅ Setup SEO infrastructure
- ✅ Optimize core on-page elements
- ⏳ Publish 2-3 flagship blog posts
- ⏳ Build initial backlinks (5-10)

**Deliverables:**

- Sitemap + Robots.txt
- JSON-LD schema markup
- SEO meta tags improved
- 2-3 blog posts published

### Phase 2: Content Growth (Tháng 1-3, 2026)

**Objectives:**

- Publish 6-8 blog articles
- Build 15-20 quality backlinks
- Reach 1,000 monthly organic sessions
- Target 5-10 keywords in top 30

**KPIs:**

- Organic traffic: 1,000 sessions/month
- Keywords ranking: 5-10 in top 30
- Blog engagement: 2+ min avg. read time

### Phase 3: Acceleration (Tháng 4-6, 2026)

**Objectives:**

- Scale content: 2 posts/week
- Build authority: 20-30 backlinks
- Capture long-tail keywords
- YouTube channel growth

**KPIs:**

- Organic traffic: 3,000+ sessions/month
- 20+ keywords in top 20
- YouTube subscribers: 500+

### Phase 4: Maintenance & Optimization (Tháng 7+)

- Ongoing content updates
- Seasonal campaigns
- Competitor monitoring
- Annual SEO audit

---

## 🎯 Quick Wins (Cần Làm Ngay)

### Tuần 1

- [ ] Submit sitemap to Google Search Console
- [ ] Setup Google Analytics 4 goals
- [ ] Create robots.txt
- [ ] Add more structured data (Schema markup)

### Tuần 2-3

- [ ] Optimize homepage title & meta description
- [ ] Improve internal linking
- [ ] Create first blog post (Hướng dẫn tạo quiz)
- [ ] Setup content calendar

### Tuần 4

- [ ] First backlink outreach campaign
- [ ] Publish first blog post
- [ ] Share on social media
- [ ] Submit to Product Hunt

---

## 📈 Success Metrics & Goals

### 3 Months

- 500+ organic sessions/month
- 3-5 keywords in top 30
- 2-3 high-quality backlinks

### 6 Months

- 2,000+ organic sessions/month
- 10-15 keywords in top 20
- 10-15 quality backlinks
- 5,000+ monthly users

### 12 Months

- 5,000+ organic sessions/month
- 30+ keywords in top 20
- 50+ quality backlinks
- #1 ranking for "quiz generator tiếng Việt"

---

## 📞 Contact & Support

**Responsible:** Product Team  
**Review Frequency:** Monthly  
**Update Last:** November 3, 2025

---

## Ghi Chú

> **Lưu ý quan trọng:**
>
> - Tập trung vào **Tiếng Việt** trước (High-intent market)
> - Thực hiện từng Phase theo thứ tự
> - Đo lường & optimize dựa trên data
> - Patience - SEO thường mất 3-6 tháng để thấy kết quả
> - Content quality > Quantity
