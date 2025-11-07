# Badwords Filter Fix - Testing Guide

**Deployed Commit:** `2f336cd`  
**Date:** Nov 3, 2025  
**Status:** 🟢 LIVE

---

## 🧪 How to Test the Fix

### Test on Live Site: https://quizken.vercel.app

**Wait 2-3 minutes for Vercel deployment**, then:

#### Test 1: Text Fields with Previously Blocked Words

1. **Go to Quiz Generator page**
2. **Try entering these texts** (should now be ALLOWED):
   - ✅ "tạo" (create)
   - ✅ "tạo bài kiểm tra" (create quiz)
   - ✅ "Tạo quiz Toán cho lớp 10"
   - ✅ "con chó" (dog)
   - ✅ "bố mẹ" (parents)
   - ✅ "con trai" (boy)
   - ✅ "con gái" (girl)

**Expected:** No red error message about "sensitive content"

#### Test 2: Verify Real Badwords Still Blocked

1. **Try entering obviously offensive words** (should be BLOCKED):
   - ❌ "địt mẹ" → Should show error
   - ❌ "đồ ngu" → Should show error
   - ❌ "vcl" → Should show error

**Expected:** Error message shows "Nội dung nhạy cảm" (Sensitive content)

#### Test 3: Generate Quiz with "tạo" in Description

1. **Create a quiz**
2. **In description field, enter:** "Tạo bài kiểm tra Tiếng Việt cho học sinh"
3. **Try to submit the form**

**Expected:** Form submits successfully (no false positive)

---

## 🔍 Where to Check

### In the UI:

- Look for text input fields in Quiz Generator
- Previously they would show: 🔴 "Nội dung chứa từ không phù hợp"
- Now they should: ✅ Allow these words

### In Browser Console (DevTools):

```javascript
// If you want to test the function directly in console
// You can check the filter logic via the built component
```

---

## 📋 Known Changes

| Word/Phrase | Before     | After            | Reason                          |
| ----------- | ---------- | ---------------- | ------------------------------- |
| "tạo"       | ❌ Blocked | ✅ Allowed       | Common in "create quiz" context |
| "con chó"   | ❌ Blocked | ✅ Allowed       | Animal reference, not insult    |
| "bố mẹ"     | ❌ Blocked | ✅ Allowed       | Family term, not offensive      |
| "địt mẹ"    | ❌ Blocked | ❌ Still Blocked | Real profanity                  |
| "đồ ngu"    | ❌ Blocked | ❌ Still Blocked | Real insult                     |

---

## 🎯 What Changed Under the Hood

**File:** `src/lib/vnBadwordsFilter.ts`

**Added:**

- Comprehensive whitelist with 20+ legitimate words
- Better handling of single-word badwords
- Double-check against whitelist before flagging

**Logic:**

1. Check if text is in whitelist → Allow
2. Run regex badwords check → Flag if found
3. Run normalized substring check → Flag if found
4. Otherwise → Allow

---

## 📝 How to Report False Positives/Negatives

If you find any issues:

1. **Screenshot the error** (if any)
2. **Note the exact text** you entered
3. **Tell me:**
   - What text was entered
   - What happened (blocked or not)
   - What should happen
   - Example: "I entered 'tạo bài' and it was blocked, but it should be allowed"

### Example False Positive Report:

```
Text: "Bài tập về tạo thành từ"
Result: ❌ Blocked
Expected: ✅ Should be allowed
Reason: Contains legitimate Vietnamese phrase
```

### Example Missing Badword Report:

```
Text: "Bạn là [profanity]"
Result: ✅ Allowed
Expected: ❌ Should be blocked
Reason: This is offensive and should be caught
```

---

## 🔄 Future Improvements

**Phase 2 (When you collect more data):**

- Add more words to whitelist as you discover false positives
- Reorganize badwords_vi.json to separate by severity
- Implement context-aware filtering

**How to help:**

- Use the app and report false positives
- Send list of words that should/shouldn't be blocked
- Suggest context rules (e.g., "tao" is only bad in confrontational phrases)

---

## ✅ Deployment Checklist

- [x] Code changes committed
- [x] Build successful
- [x] Pushed to GitHub
- [x] Vercel deploying (wait 2-3 min)
- [ ] Test on live site
- [ ] Report results

---

## 🚀 Ready to Test?

1. **Wait for Vercel deployment** (check: https://quizken.vercel.app should be fresh)
2. **Try the test cases above**
3. **Let me know results!**

If there are issues, send me the exact text and what happened. 📸
