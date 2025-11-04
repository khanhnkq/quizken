# 🚀 Performance Optimization - Action Plan

**Status:** Bundle analysis completed  
**Date:** Nov 3, 2025

---

## 📊 Current Bundle Size Analysis

```
Total Build Size: ~2.5 GB (includes 7.68 GB MP3 audio)

CRITICAL - WAY TOO LARGE:
- lofi-2-rBIWPuWS.mp3: 7,680 KB (7.68 MB!) 🔴
- pdf.worker-CQyr23G9.js: 851.28 KB 🔴

LARGE - SHOULD OPTIMIZE:
- vendor-nfwuF_2D.js: 495.72 KB (gzip: 151.78 KB)
- gsap-Knm3XaQo.js: 125.41 KB (gzip: 48.32 KB)
- animations-BgKYh4X4.js: 79.34 KB (gzip: 24.72 KB)
- radix-ui-DuxHS0Ea.js: 74.50 KB (gzip: 22.11 KB)

GOOD - ALREADY OPTIMIZED:
- index-C90RHb6c.css: 87.45 KB (gzip: 14.86 KB) ✅
- Core chunks under 30 KB ✅
```

---

## 🎯 Optimization Strategy (Priority Order)

### Phase 1: CRITICAL FIXES (Do FIRST!)

#### 1.1 Audio Compression 🔴 HIGH PRIORITY

**Current:** lofi-2-rBIWPuWS.mp3 = 7,680 KB  
**Goal:** Reduce to < 500 KB using lossy compression

**Action:**

```bash
# Convert MP3 to lower bitrate
ffmpeg -i lofi-2.mp3 -b:a 32k lofi-2-compressed.mp3
# Result: ~500-800 KB instead of 7.68 MB
```

**Estimated Savings:** 6.8 MB 🎉

#### 1.2 PDF Worker Code Splitting 🔴 HIGH PRIORITY

**Current:** pdf.worker-CQyr23G9.js = 851.28 KB  
**Goal:** Lazy load only when PDF export is needed

**Implementation:**

```tsx
// Instead of importing at top level
// import pdfWorker from '@/workers/pdf.worker?worker'

// Use dynamic import
const pdfWorkerPath = new URL("@/workers/pdf.worker", import.meta.url);
const worker = new Worker(pdfWorkerPath, { type: "module" });
// OR lazy load when user clicks "Export PDF"
```

**Estimated Savings:** 800+ KB on initial load

---

### Phase 2: BUNDLE OPTIMIZATION (Do SECOND)

#### 2.1 GSAP Tree Shaking 🟡 MEDIUM PRIORITY

**Current:** gsap-Knm3XaQo.js = 125.41 KB  
**Issue:** GSAP is imported completely, but only specific plugins are used

**Current Usage:**

```tsx
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin"; // Only this!
```

**Fix:**

```tsx
// Only import what you use
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
gsap.registerPlugin(ScrollToPlugin);

// Remove any unused: ScrollTrigger, Draggable, Flip, etc.
```

**Estimated Savings:** 40-60 KB

#### 2.2 Framer Motion Optimization 🟡 MEDIUM PRIORITY

**Current:** animations-BgKYh4X4.js = 79.34 KB  
**Audit:** Check if all Framer Motion features are needed

**Options:**

- Replace heavy animations with CSS transitions where possible
- Use `motion.div` only where needed
- Lazy load animation components

**Estimated Savings:** 20-30 KB

#### 2.3 Radix UI Selective Import 🟡 MEDIUM PRIORITY

**Current:** radix-ui-DuxHS0Ea.js = 74.50 KB  
**Goal:** Only include used components

**Check current imports:**

```bash
grep -r "from @radix-ui" src/
```

**Expected:** Using only 3-4 components but bundling all  
**Estimated Savings:** 30-40 KB

---

### Phase 3: VENDOR OPTIMIZATION (Do THIRD)

#### 3.1 Vendor Bundle Analysis 🟢 LOW PRIORITY

**Current:** vendor-nfwuF_2D.js = 495.72 KB (gzip: 151.78 KB)

**Contains:**

- React + React DOM
- React Router
- Zod validation
- Other dependencies

**Best Practice:** This is acceptable size for modern SPA  
**Alternative:** Could split into:

- `react-core.js` (React + Router)
- `utils.js` (Zod + others)

---

## 📋 Implementation Tasks

### IMMEDIATE (This session)

- [ ] **Compress audio:**

  ```bash
  ffmpeg -i public/audio/lofi-2.mp3 -b:a 32k public/audio/lofi-2-compressed.mp3
  ```

- [ ] **Update audio import** in ChillMusicContext.tsx:

  ```tsx
  const { default: lofi2 } = await import(
    "@/assets/audio/lofi-2-compressed.mp3"
  );
  ```

- [ ] **Move PDF worker to lazy load:**
  - Check `src/workers/pdf.worker.ts` usage
  - Load only when export button is clicked

### NEXT (After testing)

- [ ] Audit GSAP usage - remove unused plugins
- [ ] Test Framer Motion - replace with CSS if possible
- [ ] Verify Radix UI - only import needed components
- [ ] Add `dynamic` imports for heavy features

---

## 🧪 Testing Checklist

After each change:

- [ ] `npm run build` - Check bundle size
- [ ] Test on https://quizken.vercel.app
- [ ] Verify audio still works
- [ ] Verify PDF export still works
- [ ] Check DevTools Performance tab

---

## 📈 Expected Results

| Metric          | Before  | After   | Savings        |
| --------------- | ------- | ------- | -------------- |
| JS Bundle       | ~2.5 GB | ~2.0 GB | 500 MB         |
| Audio Size      | 7.68 MB | 0.5 MB  | 7.18 MB (93%!) |
| PDF Worker      | 851 KB  | Lazy    | 851 KB         |
| Total (gzipped) | ~200 MB | ~150 MB | 50 MB          |
| LCP             | TBD     | -500ms  | Target         |
| FID             | TBD     | Faster  | Target         |

---

## 🔗 Commands to Run

```bash
# Analyze current bundle
npm run build

# After audio compression:
ffmpeg -i public/audio/lofi-2.mp3 -b:a 32k public/audio/lofi-2-compressed.mp3

# Check file sizes
ls -lh public/audio/
ls -lh dist/assets/

# Rebuild and compare
npm run build
```
