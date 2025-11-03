# 🚀 SEO Testing - Quick Reference Card

**Print này hoặc bookmark để tiện tham khảo!**

---

## ✅ Testing Checklist (Do This Today)

### **5-Minute Browser Check**

```
[ ] 1. Open: https://quizken.vercel.app
[ ] 2. Press: F12 (open DevTools)
[ ] 3. Tab: Elements/Inspector
[ ] 4. Search: "og:title" → Should find it ✅
[ ] 5. Search: "Organization" → Should find it ✅
[ ] 6. Go to: /about
[ ] 7. Search: "BreadcrumbList" → Should find it ✅
```

**Result:** ✅ All found = SEO working!

---

### **Google Tools Testing (20 minutes)**

| Tool | URL | Enter | Expected |
|------|-----|-------|----------|
| 📱 **Mobile** | search.google.com/test/mobile-friendly | quizken.vercel.app | PASS ✅ |
| 🚀 **Speed** | pagespeed.web.dev | quizken.vercel.app | SEO > 90 ✅ |
| 🏆 **Rich Results** | search.google.com/test/rich-results | quizken.vercel.app | No errors ✅ |
| 💡 **Lighthouse** | F12 → Lighthouse | Run audit | SEO > 90 ✅ |

---

### **File Accessibility Check**

```bash
# Run in terminal:

curl -I https://quizken.vercel.app/sitemap.xml
# Should see: HTTP/2 200

curl -I https://quizken.vercel.app/robots.txt
# Should see: HTTP/2 200
```

**Result:** Both 200 OK = Files accessible ✅

---

## 📋 Meta Tags Checklist

### **Homepage Should Have:**

```html
✅ <title> - Unique & keyword-rich
   "QuizKen - Tạo Bài Kiểm Tra AI..."

✅ <meta name="description"> - 150-160 chars
   "QuizKen giúp giáo viên tạo đề kiểm tra..."

✅ <meta name="keywords">
   "tạo đề kiểm tra, quiz generator..."

✅ <meta property="og:title">
✅ <meta property="og:description">
✅ <meta property="og:image">
✅ <meta property="og:type"> = "website"

✅ <meta name="twitter:card">
✅ <link rel="canonical">
✅ <script type="application/ld+json"> (Schema)
```

### **About Page Should Have:**

```html
✅ Different <title>
   "Về QuizKen - Nền Tảng Quiz AI..."

✅ Different <meta name="description">
✅ Different <meta property="og:title">
✅ <link rel="canonical"> = /about
✅ Breadcrumb Schema in JSON-LD
```

---

## 🔧 Quick Debug Tips

### **"I don't see meta tags in DevTools"**

```
1. Hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
2. Clear cache:
   F12 → Application → Clear storage → Clear all
3. Check in incognito mode
4. Wait for page to fully load
```

### **"curl shows empty meta tags"**

```
✓ NORMAL! (React renders client-side)
✓ Google Crawler will see them (supports JS)
✓ Browser will show them (after loading)
✓ This is not a problem!
```

### **"PageSpeed score is low"**

```
Check:
- Performance tab (LCP, FID, CLS)
- JavaScript unused
- Unoptimized images
- Third-party scripts

Fix:
- Code split components
- Lazy load images
- Minimize bundle size
```

---

## 📊 Google Search Console Setup

### **3-Step Setup**

```
Step 1: Verify
└─ Go: https://search.google.com/search-console
└─ Sign in with Google account
└─ Add property: quizken.vercel.app
└─ Verify: Add HTML tag to index.html

Step 2: Submit
└─ Go to: Sitemaps
└─ Add: sitemap.xml
└─ Click: Submit

Step 3: Monitor
└─ Wait: 2-3 days
└─ Check: Coverage tab
└─ Watch: Performance tab daily
```

---

## 📈 What to Track Weekly

| Metric | Tool | Goal |
|--------|------|------|
| Indexed Pages | Search Console → Coverage | All pages indexed |
| Impressions | Search Console → Performance | 10-50/day |
| Clicks | Search Console → Performance | 1-10/week |
| CTR | Search Console → Performance | 1-3% |
| Rankings | Search Console → Performance | Track position |
| Page Speed | PageSpeed Insights | SEO > 90 |
| Mobile | Mobile-Friendly Test | PASS |

---

## ⏱️ Timeline Expectations

```
🟢 Now (Day 0)
   └─ SEO code live
   └─ All tests should PASS

🟡 1 Week (Day 7)
   └─ Sitemap detected by Google
   └─ Initial crawl happening
   ⏳ Waiting for indexing...

🟠 2-3 Weeks (Day 14-21)
   └─ Pages start appearing in search
   └─ First clicks in Search Console
   └─ Average position: 50-100

🔵 1 Month (Day 30)
   └─ Better rankings (top 50)
   └─ 5-20 clicks
   └─ Noticeable traffic increase

🟣 2-3 Months (Day 60-90)
   └─ 5-10 keywords top 30
   └─ 50-100 organic sessions
   └─ Natural growth continuing

⭐ 6 Months+
   └─ Strong authority
   └─ 1,000+ organic sessions
   └─ Multiple keywords top 10
```

---

## 🎯 Success Criteria

### **This Week ✅**

- [ ] All browser tests show meta tags
- [ ] Google tools: All pass
- [ ] Sitemap & robots.txt: HTTP 200
- [ ] Mobile-friendly: PASS
- [ ] PageSpeed SEO: > 90

### **This Month ✅**

- [ ] Google Search Console: Property verified
- [ ] Sitemap: Submitted & detected
- [ ] Pages: Start appearing in search
- [ ] Search Console: First clicks recorded

### **3 Months ✅**

- [ ] Keywords: 5-10 in top 50
- [ ] Traffic: 50-100 organic sessions
- [ ] Rankings: Improving weekly
- [ ] CTR: 1-3% from search

---

## 🔗 Important Links

```
📱 Mobile-Friendly Test
   https://search.google.com/test/mobile-friendly

🚀 PageSpeed Insights
   https://pagespeed.web.dev/

🏆 Rich Results Test
   https://search.google.com/test/rich-results

📊 Google Search Console
   https://search.google.com/search-console

🔗 Schema Validator
   https://validator.schema.org/

🐛 Lighthouse
   F12 (DevTools) → Lighthouse tab
```

---

## 💡 Pro Tips

1. **Check different pages:**
   - Homepage, About, Blog (when ready)
   - Each should have unique meta tags

2. **Test regularly:**
   - Weekly: PageSpeed Insights
   - Weekly: Search Console Performance
   - Monthly: Full site audit

3. **Monitor competitors:**
   - Check their title tags
   - Check their meta descriptions
   - Inspiration for your strategy

4. **Update meta tags for content:**
   - Each page = unique title (50-60 chars)
   - Each page = unique description (150-160 chars)
   - Each page = relevant keywords

---

## 🚀 Next Steps After Testing

```
After all tests PASS ✅

1. Setup Google Search Console (This week)
2. Submit sitemap (Day 1-2)
3. Monitor for 2-3 weeks (Watch indexing)
4. Start creating content (Blog posts)
5. Build backlinks (Outreach)
6. Track rankings weekly (Google Console)
```

---

**Print this → Bookmark it → Use it! 📌**
