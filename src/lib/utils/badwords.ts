/**
 * Vietnamese Badwords List for Chat Moderation
 * Derived from community lists and localized for Quizken.
 */
export const BADWORDS_VI = [
  "địt mẹ", "đụ mẹ", "đụ má", "đù mẹ", "đù má", "đm", "dm", "đmm", "vcl", "vl",
  "clm", "clgt", "vãi lồn", "vãi cặc", "vãi buồi", "vãi lol", "vãi lon", "cặc",
  "buồi", "lồn", "lol", "lon", "đĩ mẹ", "con đĩ", "đồ đĩ", "con điếm", "đồ điếm",
  "con phò", "phò", "dâm đãng", "đồ dâm", "đồ dơ", "tục tĩu", "đồ mất nết",
  "mất dạy", "bố láo", "láo toét", "láo lếu", "láo cá", "thằng chó", "con chó",
  "óc chó", "đồ chó", "đồ khốn", "thằng khốn", "đồ ngu", "đồ điên", "thằng điên",
  "thằng ngu", "con ngu", "ngu học", "ngu như bò", "ngu như chó", "ngu vãi",
  "đần độn", "não phẳng", "đồ ranh", "thằng ranh", "con ranh", "đồ ranh con",
  "vô học", "vô đạo đức", "khốn nạn", "đồ khốn nạn", "vô liêm sỉ", "đê tiện",
  "bỉ ổi", "đểu cáng", "bá dơ", "tao giết mày", "tao đâm mày", "tao đốt nhà mày",
  "tao bắn mày", "tao xử mày", "mày chết chắc", "mày tới số rồi", "giết nó đi",
  "chém nó", "đập chết mẹ mày", "đánh chết mẹ mày", "sex", "địt", "đụ", "hiếp",
  "hiếp dâm", "thủ dâm", "xxx", "porn", "gái gọi", "dâm dục", "hentai", "jav",
  "loạn luân", "gái mại dâm", "gái bao", "đồ dâm tặc", "clip nóng", "ảnh nóng",
  "giao hợp", "dương vật", "âm đạo", "xuất tinh", "liếm", "bú", "hôn hít",
  "húp sò", "bắn tinh", "thổi kèn", "địt nhau", "mẹ mày", "má mày", "con mẹ mày",
  "cha mày", "bố mày", "ông nội mày", "bà nội mày", "mẹ kiếp", "mẹ cha mày"
];

/**
 * Checks if a string contains any blocked words.
 * Returns the detected word if toxic, null otherwise.
 */
export function checkToxicContent(text: string): string | null {
  const normalizedText = text.toLowerCase().trim();
  for (const word of BADWORDS_VI) {
    if (normalizedText.includes(word)) {
      return word;
    }
  }
  return null;
}
