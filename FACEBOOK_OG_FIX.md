# 🔧 Fix Facebook Open Graph Image - QuizKen

**Problem:** Hình ảnh không hiển thị khi chia sẻ link trên Facebook

---

## 🎯 Quick Diagnostic

### **Step 1: Test với Facebook Debugger**

1. Truy cập: https://developers.facebook.com/tools/debug/og/object/
2. Nhập URL: `https://quizken.vercel.app/`
3. Click "Scrape Again"
4. Xem kết quả

**Kiểm tra:**
- ✅ og:image: Có xuất hiện không?
- ✅ Image URL: Accessible không?
- ✅ Image size: Đủ lớn không? (1200x630px minimum)
- ⚠️ Errors/Warnings: Có lỗi gì không?

---

## 🖼️ Image Requirements (Facebook)

### **Kích Thước Tối Ưu**
```
Minimum:   1200 x 630 px
Optimal:   1200 x 630 px (16:9)
Maximum:   1200 x 1500 px
Format:    JPG, PNG, GIF, WebP
Size:      < 8 MB (recommended < 300KB)
```

### **Hiện Tại**
File: `public/image/seo.jpg`
Cần kiểm tra kích thước

---

## 🔍 Troubleshooting Steps

### **Issue 1: Image URL Không Accessible**

```bash
# Test URL accessibility
curl -I https://quizken.vercel.app/image/seo.jpg

# Kết quả mong đợi:
# HTTP/2 200
# Content-Type: image/jpeg
# Content-Length: xxxxx
```

**Fix nếu 404:**
1. Kiểm tra file tồn tại: `public/image/seo.jpg`
2. Đúng path trong index.html: `og:image` = `/image/seo.jpg`
3. Rebuild & deploy

---

### **Issue 2: Image Size Quá Nhỏ**

Facebook yêu cầu **minimum 1200x630px**

**Check size:**
```bash
# macOS
sips -g pixelWidth -g pixelHeight public/image/seo.jpg

# Linux
identify public/image/seo.jpg

# Online tool
https://www.imagesize.org/
```

**Fix nếu quá nhỏ:**
- Resize to 1200x630px
- Use tool: Canva, Photoshop, or online resize

---

### **Issue 3: Image Format Problems**

```
✅ Works:    JPG, PNG, GIF, WebP
❌ Doesn't:  SVG, BMP, TIFF
```

**Fix:**
- Convert to JPG if needed
- Keep as PNG (lossless)
- Recommend: **JPG 1200x630px, ~50-100KB**

---

## ✅ Solution Checklist

### **Check 1: File Exists**
```bash
# Should return file info
ls -lh public/image/seo.jpg

# Expected output:
# -rw-r--r--  1 user  group  XXKb  Nov  3 12:34 public/image/seo.jpg
```

### **Check 2: URL Accessible**
```bash
curl -I https://quizken.vercel.app/image/seo.jpg
# HTTP/2 200 ✅
```

### **Check 3: Image Size**
```
Current:   ? px (need to check)
Required:  1200 x 630 px
Status:    ❓
```

### **Check 4: OG Tags in HTML**
```html
✅ Present in index.html:
<meta property="og:image" content="https://quizken.vercel.app/image/seo.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

### **Check 5: Facebook Debugger**
```
Status:  Need to test
URL:     https://developers.facebook.com/tools/debug/og/object/
Steps:   Enter URL → Click "Scrape Again"
```

---

## 🚀 Quick Fix Guide

### **If Image Shows No Errors in Debugger**

But still not showing on Facebook:

1. **Clear Facebook Cache**
   - https://developers.facebook.com/tools/debug/og/object/
   - Click "Fetch new shares information"
   - Wait 5-10 minutes

2. **Share Again**
   - Go to: https://quizken.vercel.app/
   - Copy full URL
   - Paste in Facebook post
   - Wait for preview to load

3. **Check Preview**
   - Image should appear
   - Title should appear
   - Description should appear

---

### **If Image Shows Error**

**Common Errors:**

```
Error: "Image not found"
→ Fix: Check URL accessible (curl test)
→ Fix: Check file exists in public/
→ Fix: Rebuild & redeploy

Error: "Image too small"
→ Fix: Resize to 1200x630px
→ Fix: Use image editor (Canva, Photoshop)

Error: "Image corrupted"
→ Fix: Download fresh image
→ Fix: Verify file integrity
→ Fix: Try PNG instead of JPG

Error: "SSL certificate issue"
→ Fix: Should be automatic (Vercel HTTPS)
→ Fix: Check domain has SSL (it should)
```

---

## 📊 Testing Process

### **Step-by-Step**

```
1. Terminal Check
   ├─ File exists?        curl -I https://quizken.vercel.app/image/seo.jpg
   ├─ File size OK?       Should be < 300KB
   └─ HTML updated?       Check index.html has og:image

2. Facebook Debugger
   ├─ Go to: developers.facebook.com/tools/debug/og/object/
   ├─ Enter: https://quizken.vercel.app/
   ├─ Click: "Scrape Again"
   └─ Check: Image shows? ✅/❌

3. Manual Test
   ├─ Go to: https://quizken.vercel.app/
   ├─ Right-click → Share to Facebook
   ├─ Check preview
   └─ Image shows? ✅/❌

4. If Still Broken
   ├─ Check browser console (F12)
   ├─ Look for image loading errors
   ├─ Check network tab
   └─ Verify CORS headers
```

---

## 🎨 Image Recommendations

### **What Works Best for Facebook**

✅ **Optimal Image**
- Size: 1200 x 630 px
- Format: JPG (quality 80-90)
- File size: 50-150 KB
- Content: Clear, professional, text overlay optional
- Color: Vibrant, eye-catching

✅ **Example Specs**
```
Image: Quiz screenshot + logo + text
Size: 1200x630px
Format: JPG
Colors: Brand colors (bright)
Text: "QuizKen - Create Quiz AI" (large)
Logo: Bottom right corner
```

### **Tools to Create**
- Canva (free, easy): canva.com
- Photoshop (paid, professional)
- GIMP (free, open-source)
- Online resizers: tinypng.com, imageresizer.com

---

## 🔗 All OG Tags Check

### **Should Have in index.html**

```html
<!-- Image (Main) -->
<meta property="og:image" content="https://quizken.vercel.app/image/seo.jpg" />
<meta property="og:image:secure_url" content="https://quizken.vercel.app/image/seo.jpg" />
<meta property="og:image:type" content="image/jpeg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<!-- Alternate Image (Optional, good practice) -->
<meta property="og:image" content="https://quizken.vercel.app/image/seo2.jpg" />

<!-- Basic OG Tags -->
<meta property="og:type" content="website" />
<meta property="og:title" content="QuizKen - Tạo Bài Kiểm Tra AI" />
<meta property="og:description" content="..." />
<meta property="og:url" content="https://quizken.vercel.app/" />
<meta property="og:site_name" content="QuizKen" />
<meta property="og:locale" content="vi_VN" />

<!-- Twitter Card (Separate) -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://quizken.vercel.app/image/seo.jpg" />
```

✅ **Current index.html** appears to have these!

---

## 📝 Debugging Checklist

### **Right Now (5 min)**

- [ ] Check image file exists
  ```bash
  ls -lh public/image/seo.jpg
  ```

- [ ] Check image size (pixels)
  ```bash
  sips -g pixelWidth -g pixelHeight public/image/seo.jpg
  ```

- [ ] Check file size (bytes)
  ```bash
  ls -lh public/image/seo.jpg | awk '{print $5}'
  ```

- [ ] Check URL works
  ```bash
  curl -I https://quizken.vercel.app/image/seo.jpg
  ```

### **Today (10 min)**

- [ ] Test on Facebook Debugger
  - URL: https://developers.facebook.com/tools/debug/og/object/
  - Enter: https://quizken.vercel.app/
  - Check results

- [ ] Manual Facebook share test
  - Open: https://quizken.vercel.app/
  - Right-click → Share to Facebook
  - Check preview

- [ ] If still broken, try:
  - Clear browser cache (Ctrl+Shift+Del)
  - Try incognito mode
  - Try different browser

### **If Still Not Working**

- [ ] Check index.html has og:image tags
- [ ] Verify image path is correct
- [ ] Try different image format (JPG vs PNG)
- [ ] Resize image to exactly 1200x630px
- [ ] Reduce file size (optimize with tinypng.com)
- [ ] Redeploy to Vercel
- [ ] Wait 24 hours for Facebook cache to update

---

## 🎯 Expected Results

### **After Fix**

When you share on Facebook:

```
✅ Title appears:         "QuizKen - Tạo Bài Kiểm Tra AI"
✅ Description appears:   "Tạo đề kiểm tra chất lượng cao..."
✅ Image appears:         [1200x630 preview image]
✅ Preview looks good:    Professional, clear, branded
```

---

## 💡 Pro Tips

1. **Test Multiple URLs**
   - Homepage: /
   - About: /about
   - Each page needs og:image

2. **Use og:image:secure_url**
   - Always use HTTPS
   - Include both http and https versions

3. **Multiple Images**
   - Can have multiple og:image tags
   - Facebook will try them in order

4. **Cache Clearing**
   - Facebook caches previews
   - "Scrape Again" in debugger refreshes cache
   - May take 5-24 hours to update

5. **Monitor**
   - Test again after changes
   - Use debugger to verify
   - Check Facebook page insights for impressions

---

## 🔗 Resources

**Facebook Tools:**
- OG Debugger: https://developers.facebook.com/tools/debug/og/object/
- Share Dialog: https://developers.facebook.com/docs/sharing/web
- OG Documentation: https://ogp.me/

**Image Tools:**
- Canva: https://www.canva.com/
- TinyPNG: https://tinypng.com/
- ImageResizer: https://imageresizer.com/

**Verification:**
- cURL: `curl -I [url]`
- Online tools: https://www.curl.se/

---

## 📞 Still Have Issues?

**Next Steps:**

1. Complete all checks above
2. Test on Facebook Debugger
3. Share results
4. If error: screenshot & analyze error message
5. If working: celebrate! 🎉

---

**Need specific help?**
- Share the error from Facebook Debugger
- Tell me image pixel size
- Tell me file size
- Then I can give specific fix! ✅

