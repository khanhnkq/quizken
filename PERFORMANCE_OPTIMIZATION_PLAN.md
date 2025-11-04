# Performance Optimization Plan - QuizKen

## 📊 Core Web Vitals (CWV) Targets

| Metric                             | Target  | Current Status |
| ---------------------------------- | ------- | -------------- |
| **LCP** (Largest Contentful Paint) | < 2.5s  | 🔴 TBD         |
| **FID** (First Input Delay)        | < 100ms | 🔴 TBD         |
| **CLS** (Cumulative Layout Shift)  | < 0.1   | 🔴 TBD         |
| **TTFB** (Time to First Byte)      | < 600ms | 🔴 TBD         |
| **FCP** (First Contentful Paint)   | < 1.8s  | 🔴 TBD         |

---

## 🔍 Step 1: Analyze Current Performance

### 1.1 Test on PageSpeed Insights

- **URL:** https://pagespeed.web.dev/
- **Test both:** Desktop & Mobile
- **Screenshot results** for baseline comparison

### 1.2 Test on WebPageTest

- **URL:** https://www.webpagetest.org/
- **Location:** US (East Coast) - Simulates users
- **Browser:** Chrome
- **Connection:** 4G LTE

### 1.3 Chrome DevTools Audit

- Open DevTools → Lighthouse
- Run audit for: Performance, Accessibility, Best Practices, SEO

---

## ⚡ Quick Wins (Implementation Priority)

### Phase 1: Immediate Fixes (1-2 hours)

- [ ] **Enable GZIP compression** on Vercel
- [ ] **Lazy load images** that are below fold
- [ ] **Minify CSS/JS** (Vite already does this)
- [ ] **Remove unused CSS** - analyze Tailwind usage
- [ ] **Optimize fonts** - load only Vietnamese characters needed
- [ ] **Defer non-critical JavaScript**
- [ ] **Enable browser caching** headers

### Phase 2: Bundle Optimization (2-3 hours)

- [ ] **Code splitting** - lazy load routes
- [ ] **Tree-shaking** - remove dead code
- [ ] **Split vendor bundle** - separate React, deps from app code
- [ ] **Dynamic imports** for heavy features
- [ ] **Reduce bundle size** - audit dependencies

### Phase 3: Image & Media Optimization (2-3 hours)

- [ ] **WebP format** - convert all PNG/JPG to WebP
- [ ] **Responsive images** - srcset for different screen sizes
- [ ] **Image compression** - use ImageMagick or TinyPNG
- [ ] **SVG optimization** - compress SVG files
- [ ] **Background images** - optimize or remove

### Phase 4: Advanced Caching (1-2 hours)

- [ ] **Service Worker** - offline support + caching
- [ ] **Vercel Edge Caching** - configure cache headers
- [ ] **HTTP/2 Push** - preload critical resources
- [ ] **CDN optimization** - Vercel + CloudFlare

---

## 🛠️ Detailed Implementation Guide

### A. Enable GZIP Compression (Vercel)

**vercel.json:**

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Accept-Encoding",
          "value": "gzip, deflate, br"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, s-maxage=86400"
        }
      ]
    }
  ]
}
```

### B. Lazy Load Images

**Replace static `<img>` with:**

```tsx
<img
  src="placeholder.jpg"
  loading="lazy"
  alt="description"
  srcSet="small.jpg 640w, medium.jpg 1024w, large.jpg 1920w"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

### C. Code Splitting with React.lazy()

**Current:**

```tsx
import QuizGenerator from "@/components/quiz/QuizGenerator";
```

**Optimized:**

```tsx
const QuizGenerator = React.lazy(
  () => import("@/components/quiz/QuizGenerator")
);

<Suspense fallback={<LoadingSpinner />}>
  <QuizGenerator />
</Suspense>;
```

### D. Optimize Fonts

**Current issue:** Loading full CJK font sets (5-10MB)

**Solution:**

```css
/* Only load Vietnamese subset */
@font-face {
  font-family: "VN-Font";
  src: url("/fonts/vn/subset.woff2") format("woff2");
  unicode-range: U+0000-00FF, U+0102-0103, U+20AB;
}
```

### E. Remove Unused CSS

**Tailwind config - only use colors you need:**

```ts
module.exports = {
  content: ["./src/**/*.{tsx,ts}"],
  theme: {
    colors: {
      // Only include used colors
      primary: "#3B82F6",
      secondary: "#10B981",
      // Remove 100+ unused color variants
    },
  },
};
```

### F. Bundle Analysis

```bash
# Install analyzer
npm install --save-dev vite-plugin-visualizer

# vite.config.ts
import { visualizer } from "vite-plugin-visualizer";

export default {
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ]
}

# Build and analyze
npm run build
```

---

## 📈 Performance Monitoring

### Setup Google Analytics 4

```tsx
// src/main.tsx
import { useEffect } from "react";

export function reportWebVitals() {
  const vitals = {
    name: "",
    value: 0,
    delta: 0,
    entries: [],
    id: "",
    attribution: {},
  };

  // Send to Google Analytics
  window.gtag?.("event", vitals.name, {
    value: Math.round(vitals.value),
    event_category: "Web Vitals",
    event_label: vitals.id,
    non_interaction: true,
  });
}
```

### Monitor with Web Vitals Library

```bash
npm install web-vitals
```

```tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

---

## 📊 Performance Checklist

### Before Optimization

- [ ] Screenshot PageSpeed Insights (Desktop)
- [ ] Screenshot PageSpeed Insights (Mobile)
- [ ] Record bundle size: `npm run build`
- [ ] Test with slow 4G on DevTools

### After Each Phase

- [ ] Re-test on PageSpeed Insights
- [ ] Compare bundle size
- [ ] Check Core Web Vitals improvement
- [ ] Test on real device (phone)

---

## 🎯 Expected Improvements

| Metric           | Before | After   | Gain     |
| ---------------- | ------ | ------- | -------- |
| LCP              | TBD    | < 2.5s  | Target   |
| FID              | TBD    | < 100ms | Target   |
| CLS              | TBD    | < 0.1   | Target   |
| Bundle Size      | TBD    | -30%    | Expected |
| Lighthouse Score | TBD    | 90+     | Target   |

---

## 📝 Notes

1. **Vercel CDN** - Already fast, focus on bundle size
2. **React Performance** - Memoize expensive components
3. **Critical Path** - Prioritize above-the-fold content
4. **Mobile First** - Optimize for mobile (slower networks)
5. **Monitoring** - Setup continuous monitoring after optimization

---

## 🔗 Useful Tools

- **PageSpeed Insights:** https://pagespeed.web.dev/
- **WebPageTest:** https://www.webpagetest.org/
- **Bundle Analyzer:** https://bundlephobia.com/
- **GTmetrix:** https://gtmetrix.com/
- **Lighthouse:** Chrome DevTools (F12)
- **Web Vitals:** https://web.dev/vitals/
