# Badwords Filter Improvement Plan - Frontend Text Validation

**Date:** Nov 3, 2025  
**Issue:** False positives in Vietnamese badwords filter (e.g., "tạo" is blocked)  
**Status:** Planning & Implementation

---

## 🔍 Problem Analysis

### Current Issues

1. **"tạo" (create) is blocked** 
   - Reason: Badwords list contains "tao" (meaning "I" in slang/colloquial Vietnamese)
   - Pattern: "tao" is matched as standalone word
   - False positive: "tạo" contains "tao" after Unicode normalization

2. **Other potential false positives:**
   - "tạo" → matches "tao" (I/me in slang)
   - "mày" (you in slang) could match legitimate words containing it
   - "bố" (father in slang) could match legitimate uses
   - Short words are problematic with phrase-based matching

3. **Root Cause:**
   - Badwords list mixes legitimate Vietnamese words with slang
   - Unicode normalization removes diacritics: "tạo" → "tao"
   - Word boundaries sometimes too permissive

---

## 📋 Solution Strategy

### Strategy 1: Smart Whitelisting (QUICK FIX) ⭐ RECOMMENDED

**Pros:**
- Fast implementation
- Minimal changes
- Handles false positives case-by-case
- Easy to maintain list

**Cons:**
- Reactive (fixes reported issues)
- Limited scalability

**Implementation:**
```typescript
// vnBadwordsFilter.ts
const WHITELIST = new Set([
  "tạo",           // create (confuses with slang "tao")
  "tạo bài",       // create quiz
  "bố mẹ",         // parents (legitimate family term)
  "con",           // child (legitimate family term)
  // Add more as needed
]);

// In containsVietnameseBadwords() function:
if (WHITELIST.has(normalizedText)) return false;
```

---

### Strategy 2: Context-Aware Filtering (MEDIUM-TERM)

**Separate badwords by context:**
- **Direct Insults:** "đồ ngu", "khốn nạn" (always bad)
- **Slang Pronouns:** "tao", "mày" (only bad in confrontational phrases)
- **Contextual:** "con" (can be innocent or offensive)

**Example:**
```typescript
const SLANG_PRONOUNS = new Set(["tao", "mày", "gì"]);
const DIRECT_INSULTS = new Set(["đồ ngu", "khốn nạn"]);

// Only flag if slang pronoun is in confrontational context
// e.g., "tao giết mày" YES, but "tạo quiz" NO
```

---

### Strategy 3: Refactor Badwords List (LONG-TERM)

**Clean up `badwords_vi.json`:**

1. **Remove single-character/2-char words** that cause too many false positives:
   - "tao" → Remove (confuses with "tạo")
   - "mày" → Remove (too common in legitimate text)
   - "gì" → Remove (means "what" in Vietnamese)
   - Keep: Longer, clearly offensive phrases

2. **Add context metadata:**
```json
{
  "tuc_tieu": [
    {
      "word": "địt mẹ",
      "severity": "high",
      "context": "direct_insult"
    }
  ]
}
```

3. **Categorize by severity:**
   - HIGH: Never acceptable
   - MEDIUM: Contextual warning
   - LOW: Depends on context

---

## 🛠️ Implementation Plan (This Session)

### Phase 1: Quick Fix (30 minutes) ✅ DO THIS NOW

1. **Add common false positives to whitelist**
2. **Test with user-reported examples**
3. **Deploy immediately**

### Phase 2: Collect Data (Ongoing)

1. **Track false positives** from users
2. **Log what words are being flagged**
3. **Build comprehensive whitelist**

### Phase 3: Refactor (Next Session)

1. **Reorganize badwords list**
2. **Add severity levels**
3. **Implement context-aware filtering**

---

## 📝 Quick Fix Implementation

### Step 1: Update Whitelist in vnBadwordsFilter.ts

```typescript
// Around line 90-100
const WHITELIST = new Set([
  // False positive fixes (words that are legitimate but match badwords)
  "tạo",                    // create (confuses with slang "tao")
  "tạo bài kiểm tra",       // create quiz
  "tạo bài",                // create exercise
  "tạo quiz",               // create quiz (English context)
  "bố mẹ",                  // parents (family context)
  "con chó",                // dog (animal context)
  "con mèo",                // cat (animal context)
  "con người",              // human/person
  
  // Add more as you discover them
]);

export function containsVietnameseBadwords(text: string): boolean {
  if (!text) return false;

  // Check whitelist first
  const normalizedForWhitelist = normalizeForCompare(text.trim());
  for (const w of WHITELIST) {
    if (normalizedForWhitelist === normalizeForCompare(w)) {
      return false; // Whitelisted, not a badword
    }
  }

  // Then check badwords... (existing logic)
  const normalized = normalizeForCompare(text);
  // ... rest of function
}
```

### Step 2: Add More Aggressive Word Boundary

Current implementation might allow partial matches. Options:

**Option A: Stricter boundaries**
```typescript
// Only match complete words, not parts of words
const BADWORDS_REGEX = new RegExp(
  patternsWithBoundaries.join("|"),
  "giu"
);
// Add: must be surrounded by word boundaries OR line boundaries
```

**Option B: Phrase-only matching**
```typescript
// Only flag if it's a multi-word phrase (harder to accidentally match)
const isPhrase = patterns.some(p => p.includes(separator));
if (!isPhrase) {
  // Single word - only flag if it's a known bad word on its own
  // not just part of another word
}
```

---

## 🧪 Testing Strategy

### Test Cases

```javascript
// Test suite to validate
const testCases = [
  // Current false positives
  { input: "tạo", expected: false, reason: "legitimate word 'create'" },
  { input: "tạo bài kiểm tra", expected: false, reason: "quiz creation context" },
  { input: "Tạo quiz cho học sinh", expected: false, reason: "normal use case" },
  
  // Should still catch real badwords
  { input: "địt mẹ", expected: true, reason: "direct insult" },
  { input: "đồ ngu", expected: true, reason: "insult" },
  { input: "vcl", expected: true, reason: "abbreviation" },
  
  // Edge cases
  { input: "tạo giết người", expected: true, reason: "contains threat" },
  { input: "Con chó", expected: false, reason: "animal reference" },
  { input: "bố mẹ em", expected: false, reason: "family context" },
];

// Run tests
testCases.forEach(test => {
  const result = containsVietnameseBadwords(test.input);
  const passed = result === test.expected;
  console.log(`${passed ? '✅' : '❌'} ${test.input}: ${test.reason}`);
});
```

---

## 📊 Comparison: Before vs After

| Scenario | Before | After | Fix Type |
|----------|--------|-------|----------|
| User enters "tạo" | ❌ Blocked | ✅ Allowed | Whitelist |
| "tạo bài kiểm tra" | ❌ Blocked | ✅ Allowed | Whitelist |
| "địt mẹ" insult | ✅ Caught | ✅ Caught | No change |
| "con chó" (dog) | ❌ Blocked | ✅ Allowed | Context |
| "bố mẹ" (parents) | ❌ Blocked | ✅ Allowed | Context |

---

## 🔧 Files to Modify

### Phase 1 (This session)
1. **`src/lib/vnBadwordsFilter.ts`**
   - Add comprehensive whitelist
   - Improve word boundary logic
   - Add logging for debugging

### Phase 2 (Next session)
1. **`src/assets/filter/badwords_vi.json`**
   - Reorganize and cleanup
   - Remove problematic single words
   - Add severity metadata

### Phase 3 (Future)
1. **`src/components/ui/TextField.tsx`** (if exists)
   - Add real-time feedback
   - Show which word triggered filter
   - Provide suggestions

---

## 📌 Decision Point

**Which approach do you want?**

**Option A: Quick Fix Now** (Recommended)
- Add whitelist for "tạo", "con", "bố", etc.
- Deploy in 30 minutes
- ✅ Pros: Immediate relief, simple
- ❌ Cons: Not scalable long-term

**Option B: Refactor Now**
- Reorganize badwords_vi.json
- Implement severity levels
- Add context awareness
- ⏳ Pros: Better architecture
- ❌ Cons: Takes 2-3 hours

**Option C: Hybrid**
- Quick whitelist now (Phase 1)
- Plan refactor for next session (Phase 2)
- ✅ Best of both worlds

---

## 🚀 Quick Implementation Checklist

- [ ] Identify all false positives (you report them)
- [ ] Add to whitelist in vnBadwordsFilter.ts
- [ ] Run test cases
- [ ] Deploy to production
- [ ] Monitor for more false positives
- [ ] Build comprehensive list over time

**Next Question:** Should I start with the quick fix (whitelist approach)?

