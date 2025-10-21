import badwordsData from "@/assets/filter/badwords_vi.json";

/**
 * Vietnamese bad-words filter (improved)
 *
 * Improvements:
 * - Matches multi-word phrases by allowing punctuation/whitespace between words.
 * - Sorts by length to prefer longer phrases.
 * - Uses Unicode-aware regex ('u') and case-insensitive ('i').
 *
 * Notes:
 * - This is a pragmatic approach for frontend sanitization. For perfect matching
 *   across normalization variants you may add extra normalization steps.
 */

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const rawWords: string[] = Object.values(badwordsData)
  .flat()
  .filter(Boolean)
  .map((w) => String(w).trim())
  .filter(Boolean);

// Build flexible patterns for phrases:
// - split phrase on whitespace, escape each part
// - join with a permissive separator that allows spaces or punctuation between words
const separator = "[\\s\\p{P}\\p{Zs}]+"; // whitespace, punctuation, space separators
const patterns = Array.from(new Set(rawWords))
  .sort((a, b) => b.length - a.length)
  .map((w) =>
    w
      .split(/\s+/)
      .map((part) => escapeRegExp(part))
      .join(separator)
  );

// Add Unicode-aware boundaries so we don't match inside other words.
// Use negative lookbehind/lookahead for Unicode letters to emulate word boundaries.
const boundaryLeft = "(?<!\\p{L})";
const boundaryRight = "(?!\\p{L})";

const patternsWithBoundaries = patterns.map(
  (p) => `${boundaryLeft}(?:${p})${boundaryRight}`
);

// If there are no patterns, use a regex that never matches.
const BADWORDS_REGEX =
  patternsWithBoundaries.length > 0
    ? new RegExp(patternsWithBoundaries.join("|"), "giu")
    : /a^/;

/**
 * Replace matched badwords with maskChar repeated to match length.
 * Keeps surrounding text intact.
 */
export function sanitizeVietnameseBadwords(
  text: string,
  maskChar = "*"
): string {
  if (!text) return text;
  return text.replace(BADWORDS_REGEX, (match) => maskChar.repeat(match.length));
}

/**
 * Check whether text contains any badwords.
 */
/**
 * Normalize text for simple substring comparison:
 * - NFKC normalization
 * - toLowerCase
 * - replace punctuation/symbols with spaces
 * - collapse whitespace
 */
function normalizeForCompare(s: string): string {
  return (
    s
      .normalize("NFKC")
      // decompose and remove diacritic marks so "vãi" -> "vai"
      .normalize("NFD")
      .replace(/\p{M}+/gu, "")
      .toLowerCase()
      .replace(/[\p{P}\p{S}]+/gu, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

export function containsVietnameseBadwords(text: string): boolean {
  if (!text) return false;

  // Quick whitelist: normalized phrases that should NOT be considered profane
  // Add more entries here as needed (normalized using normalizeForCompare)
  // Include both expected normalized forms (observed and ideal)
  const WHITELIST = new Set(["dung do", "ung o"]); // whitelist for "đụng độ"
  const normalizedForWhitelist = normalizeForCompare(text);
  if (normalizedForWhitelist) {
    for (const w of WHITELIST) {
      if (normalizedForWhitelist.includes(w)) return false;
    }
  }

  // Fast path: regex-based match (handles many cases including multi-word)
  if (BADWORDS_REGEX.test(text)) return true;

  // Fallback: normalized substring check to catch variants (non-breaking spaces,
  // extra punctuation, small normalization differences) — helps for examples like "vãi lồn"
  const normalizedText = normalizeForCompare(text);
  if (!normalizedText) return false;

  const normalizedWords = normalizedText.split(" ");
  for (const w of Array.from(new Set(rawWords))) {
    const normalizedWord = normalizeForCompare(w);
    if (!normalizedWord) continue;

    const parts = normalizedWord.split(" ");
    if (parts.length === 1) {
      // single-word badword: require whole-word match
      if (normalizedWords.includes(parts[0])) return true;
    } else {
      // multi-word badword: require contiguous sequence of words
      for (let i = 0; i <= normalizedWords.length - parts.length; i++) {
        let ok = true;
        for (let j = 0; j < parts.length; j++) {
          if (normalizedWords[i + j] !== parts[j]) {
            ok = false;
            break;
          }
        }
        if (ok) return true;
      }
    }
  }

  return false;
}

/**
 * If the input contains any badword, mark the entire text as sensitive.
 * This returns the original text with every non-whitespace character replaced
 * by the maskChar so the whole input is treated as "sensitive".
 *
 * Example:
 * maskEntireTextIfContains("hello mẹ mày", "*") -> "***** *** ***"
 */
export function maskEntireTextIfContains(text: string, maskChar = "*"): string {
  if (!text) return text;
  if (!containsVietnameseBadwords(text)) return text;
  // Replace any non-whitespace character so spaces stay for readability
  return text.replace(/\S/g, maskChar);
}

/**
 * Convenience: returns true if text is sensitive (alias).
 */
export const isSensitive = containsVietnameseBadwords;
