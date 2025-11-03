# SEO Testing & Verification Guide - QuizKen

**Ngày tạo:** November 3, 2025  
**Mục đích:** Xác minh SEO implementation hoạt động đúng

---

## 📋 Mục Lục

1. [Local Testing](#local-testing)
2. [Online SEO Audit Tools](#online-seo-audit-tools)
3. [Google Search Console Setup](#google-search-console-setup)
4. [Kiểm Tra Meta Tags](#kiểm-tra-meta-tags)
5. [Schema Markup Validation](#schema-markup-validation)
6. [Page Speed Testing](#page-speed-testing)
7. [Structured Data Checker](#structured-data-checker)

---

## 🔍 Local Testing

### 1️⃣ **Kiểm Tra Files Tồn Tại**

```bash
# Kiểm tra sitemap.xml
curl -I https://quizken.vercel.app/sitemap.xml

# Kiểm tra robots.txt
curl -I https://quizken.vercel.app/robots.txt

# Xem nội dung robots.txt
curl https://quizken.vercel.app/robots.txt
```

**Kết quả mong đợi:**

```
HTTP/2 200
content-type: text/xml
content-length: 500+
```

---

### 2️⃣ **Kiểm Tra Meta Tags Trong Browser**

**Bước 1:** Mở browser → F12 (DevTools)

**Bước 2:** Kiểm tra:

```html
<!-- Mở quizken.vercel.app → DevTools → Elements → Head -->

✅ <title>QuizKen - Tạo Bài Kiểm Tra AI...</title> ✅
<meta name="description" content="QuizKen giúp giáo viên..." /> ✅
<meta name="keywords" content="..." /> ✅
<meta property="og:title" content="..." /> ✅
<meta property="og:image" content="..." /> ✅
<link rel="canonical" href="..." /> ✅
<link rel="sitemap" href="/sitemap.xml" />
```

**Bước 3:** Kiểm tra Schema Markup

```html
<!-- Tìm <script type="application/ld+json"> -->
✅ Phải có Organization Schema ✅ Phải có SoftwareApplication Schema
```

---

### 3️⃣ **Network Tab Kiểm Tra**

**Bước 1:** F12 → Network tab

**Bước 2:** Load trang → Filter by "document"

**Bước 3:** Click vào request đầu tiên (index.html)

**Bước 4:** Xem Response Headers:

```
✅ content-type: text/html
✅ x-powered-by: (nếu có)
✅ cache-control: (kiểm tra caching policy)
```

---

## 🌐 Online SEO Audit Tools

### 📌 **Tool 1: Google Mobile-Friendly Test**

**Url:** https://search.google.com/test/mobile-friendly

**Bước:**

1. Nhập: `https://quizken.vercel.app`
2. Click "Test URL"
3. Kiểm tra:
   - ✅ Mobile Friendly: PASS
   - ✅ Usability Issues: NONE
   - ✅ Viewport: Configured
   - ✅ Text Size: Appropriate

---

### 📌 **Tool 2: Google PageSpeed Insights**

**Url:** https://pagespeed.web.dev/

**Bước:**

1. Nhập: `https://quizken.vercel.app`
2. Click "Analyze"
3. Kiểm tra scores:
   - **Performance:** > 70 (Green)
   - **Accessibility:** > 80
   - **Best Practices:** > 85
   - **SEO:** > 90 ✅

**Yếu tố quan trọng:**

- Largest Contentful Paint (LCP): < 2.5s
- First Input Delay (FID): < 100ms
- Cumulative Layout Shift (CLS): < 0.1

---

### 📌 **Tool 3: Screaming Frog SEO Spider (Free Version)**

**Download:** https://www.screamingfrog.co.uk/seo-spider/

**Setup:**

1. Download & Install
2. Start > Enter URL: `https://quizken.vercel.app`
3. Click "Start"

**Kiểm tra:**

- **Sitemaps:** Crawl → Sitemaps → Check sitemap.xml
- **Meta Tags:** Click trang > View Response > Meta data
- **Crawl errors:** Filters > Status codes > 404s (should be 0)
- **Page titles:** Check duplicates, length (50-60 chars)
- **Meta descriptions:** Check duplicates, length (150-160 chars)

---

### 📌 **Tool 4: Ahrefs Free SEO Tools**

**Url:** https://ahrefs.com/tools

**Các tools hữu ích:**

- **SEO Toolbar:** Browser extension
- **Website Authority Checker:** Check domain authority
- **Backlink Checker:** Check backlinks

**Kiểm tra:**

```
https://ahrefs.com/website-authority-checker
→ Nhập: quizken.vercel.app
→ Xem: Domain Rating (DR), Referring Domains
```

---

### 📌 **Tool 5: Semrush Free Tools**

**Url:** https://www.semrush.com/

**Kiểm tra:**

1. **Site Audit (Free):** Check 100 pages
2. **SEO Dashboard:** Ranking keywords
3. **Backlink Checker:** Competitor analysis

---

## 🔧 Google Search Console Setup

### **Step 1: Add Property**

1. Truy cập: https://search.google.com/search-console
2. Click "Add property"
3. Chọn "URL prefix"
4. Nhập: `https://quizken.vercel.app`
5. Click "Continue"

### **Step 2: Verify Ownership**

**Option A: HTML file (Recommended)**

1. Download HTML verification file
2. Upload to `public/` folder
3. Verify

**Option B: Meta tag**

1. Copy meta tag
2. Add to `index.html` head
3. Verify

**Option C: Domain name provider**

1. Add TXT record tại registrar
2. Verify

### **Step 3: Submit Sitemap**

1. Trong Search Console → Sitemaps
2. Click "Add/test sitemaps"
3. Nhập: `sitemap.xml`
4. Click "Submit"

**Xem kết quả sau 2-3 ngày:**

- Sitemaps > sitemap.xml
- Xem: Indexed URLs, Errors, Warnings

### **Step 4: Monitor Performance**

1. Search Console → Performance
2. Xem:
   - **Total clicks:** Người click từ search
   - **Impressions:** Lần hiển thị trong search
   - **Avg. CTR:** Click-through rate
   - **Avg. Position:** Vị trí xếp hạng

---

## ✅ Kiểm Tra Meta Tags

### **Trang Chủ (Homepage)**

```bash
# Copy-paste vào browser console
curl -s https://quizken.vercel.app | grep -A 5 "<title>"
```

**Kiểm tra:**

```html
✅ Title: "QuizKen - Tạo Bài Kiểm Tra AI Miễn Phí | Quiz Generator" ✅ Length:
65 characters (Good - 50-60 chars optimal) ✅ Meta Description: "QuizKen giúp
giáo viên và học sinh tạo đề kiểm tra..." ✅ Length: 155 characters (Good -
150-160 optimal) ✅ Keywords: "tạo đề kiểm tra, quiz generator, ..." ✅
og:title: "QuizKen - Tạo Bài Kiểm Tra AI Miễn Phí" ✅ og:description: "Tạo đề
kiểm tra chất lượng cao với AI..." ✅ og:image:
"https://quizken.vercel.app/image/seo.jpg" ✅ twitter:card:
"summary_large_image" ✅ twitter:title: "QuizKen - AI Quiz Generator" ✅
canonical: "https://quizken.vercel.app/"
```

### **Trang About**

```html
✅ Title: "Về QuizKen - Nền Tảng Quiz AI Hàng Đầu Việt Nam" ✅ Meta Description:
"Tìm hiểu về QuizKen, sứ mệnh cung cấp công cụ..." ✅ Keywords: "về quizken,
giới thiệu, quiz ai..." ✅ Canonical: "https://quizken.vercel.app/about"
```

---

## 🔗 Schema Markup Validation

### **Tool: Google Rich Results Test**

**Url:** https://search.google.com/test/rich-results

**Bước:**

1. Nhập: `https://quizken.vercel.app`
2. Click "Test URL"
3. Kiểm tra:
   - ✅ Organization schema
   - ✅ SoftwareApplication schema
   - ✅ WebPage schema

**Kết quả mong đợi:**

```
✅ No errors
✅ 3-5 rich result types detected
```

---

### **Tool: Schema.org Validator**

**Url:** https://validator.schema.org/

**Bước:**

1. Copy HTML source của trang
2. Paste vào validator
3. Kiểm tra errors & warnings

---

## ⚡ Page Speed Testing

### **Metrics Quan Trọng (Core Web Vitals)**

| Metric                         | Target  | Tool               |
| ------------------------------ | ------- | ------------------ |
| LCP (Largest Contentful Paint) | < 2.5s  | PageSpeed Insights |
| FID (First Input Delay)        | < 100ms | PageSpeed Insights |
| CLS (Cumulative Layout Shift)  | < 0.1   | PageSpeed Insights |

### **Test:**

1. Truy cập: https://pagespeed.web.dev/
2. Nhập URL
3. Xem "Web Vitals" section
4. Optimize nếu có issues

---

## 📊 Structured Data Checker

### **Test JSON-LD Schemas**

```bash
# Mở DevTools Console (F12)
# Chạy lệnh này:
copy(JSON.stringify(JSON.parse(document.querySelector('script[type="application/ld+json"]').innerText), null, 2))
```

**Kiểm tra:**

```json
✅ Organization schema:
{
  "@context": "https://schema.org/",
  "@type": "Organization",
  "name": "QuizKen",
  "url": "https://quizken.vercel.app",
  "logo": "https://quizken.vercel.app/image/seo.jpg"
}

✅ SoftwareApplication schema:
{
  "@context": "https://schema.org/",
  "@type": "SoftwareApplication",
  "name": "QuizKen",
  "applicationCategory": "EducationalApplication",
  "offers": {
    "@type": "Offer",
    "price": "0"
  }
}
```

---

## 🚀 Quick Testing Checklist

### **Ngay Bây Giờ (5 phút)**

- [ ] **Local Check:**

  - [ ] Mở F12 → kiểm tra `<title>`, `<meta description>`
  - [ ] Kiểm tra `<script type="application/ld+json">`
  - [ ] Kiểm tra `<link rel="canonical">`

- [ ] **File Check:**
  - [ ] Mở: `https://quizken.vercel.app/sitemap.xml` (nên thấy XML)
  - [ ] Mở: `https://quizken.vercel.app/robots.txt` (nên thấy text)

---

### **Hôm Nay (30 phút)**

- [ ] **Google Mobile-Friendly Test:**

  - [ ] Truy cập: https://search.google.com/test/mobile-friendly
  - [ ] Test: `https://quizken.vercel.app`
  - [ ] Result: PASS

- [ ] **PageSpeed Insights:**

  - [ ] Truy cập: https://pagespeed.web.dev/
  - [ ] Test: `https://quizken.vercel.app`
  - [ ] Scores: SEO > 90

- [ ] **Rich Results Test:**
  - [ ] Truy cập: https://search.google.com/test/rich-results
  - [ ] Test: `https://quizken.vercel.app`
  - [ ] Result: No errors

---

### **Tuần Này (1-2 giờ)**

- [ ] **Google Search Console:**

  - [ ] Verify property
  - [ ] Submit sitemap.xml
  - [ ] Monitor crawl errors
  - [ ] Check coverage

- [ ] **Screaming Frog:**
  - [ ] Crawl site
  - [ ] Check duplicate titles/descriptions
  - [ ] Check 404 errors
  - [ ] Check redirect chains

---

## 📈 Kỳ Vọng Kết Quả

### **Ngay Lập Tức (1 tuần)**

- ✅ Sitemap được Google crawl
- ✅ Meta tags đúng trên tất cả trang
- ✅ Schema markup valid
- ✅ Mobile-friendly: PASS
- ✅ Page Speed: 80+

### **2-4 Tuần**

- ✅ Pages bắt đầu appear trong Google Search
- ✅ 1-2 keywords ranking top 100
- ✅ CTR từ search console > 0

### **2-3 Tháng**

- ✅ 5-10 keywords ranking top 50
- ✅ 50-100 organic sessions/month
- ✅ Improved CTR & impressions

---

## 🔴 Troubleshooting

### **Vấn đề: Sitemap không xuất hiện**

```
Solution:
1. Kiểm tra curl: curl https://quizken.vercel.app/sitemap.xml
2. Nếu 404: Check file exists tại public/sitemap.xml
3. Nếu vẫn 404: Restart dev server hoặc rebuild
4. Verify trong Search Console → Coverage
```

### **Vấn đề: Meta tags không cập nhật**

```
Solution:
1. Hard refresh: Ctrl+Shift+R (Windows) hoặc Cmd+Shift+R (Mac)
2. Clear browser cache
3. Check DevTools → Sources → check new version
4. View Page Source (Ctrl+U) để confirm
```

### **Vấn đề: Schema markup không validate**

```
Solution:
1. Copy exact JSON từ console
2. Paste vào: https://validator.schema.org/
3. Fix errors theo suggestion
4. Re-test
```

---

## 📞 Tools Summary

| Tool                   | Purpose             | Free | Time   |
| ---------------------- | ------------------- | ---- | ------ |
| Google Mobile-Friendly | Mobile optimization | ✅   | 2 min  |
| PageSpeed Insights     | Core Web Vitals     | ✅   | 5 min  |
| Rich Results Test      | Schema validation   | ✅   | 3 min  |
| Search Console         | Google integration  | ✅   | 10 min |
| Screaming Frog         | SEO audit           | ✅   | 10 min |
| Google Lighthouse      | Performance audit   | ✅   | 3 min  |

---

## ✨ Next Steps

1. ✅ **Test All Tools** (Checklist above)
2. ✅ **Setup Google Search Console** (Most important)
3. ✅ **Monitor Rankings** (2-3 months)
4. ✅ **Iterate & Optimize** (Based on data)

---

**Hãy chạy tests trên và báo cáo kết quả! 🚀**
