import { supabase } from '@/integrations/supabase/client';

interface PronunciationFeedback {
    accuracy: number;
    error: string;
    tip: string;
    isCorrect: boolean;
}

interface GeminiResponse {
    candidates: Array<{
        content: {
            parts: Array<{
                text: string;
            }>;
        };
    }>;
}

/**
 * Get user's Gemini API key from Supabase
 */
export async function getUserGeminiKey(userId: string): Promise<string | null> {
    const { data, error } = await supabase
        .from('user_api_keys')
        .select('encrypted_key')
        .eq('user_id', userId)
        .eq('provider', 'gemini')
        .single();

    if (error || !data) {
        return null;
    }

    return data.encrypted_key;
}

/**
 * Analyze pronunciation using Gemini API
 */
export async function getPronunciationFeedback(
    targetWord: string,
    userTranscript: string,
    apiKey: string,
    isVietnamese: boolean = true
): Promise<PronunciationFeedback> {
    const prompt = isVietnamese
        ? `Bạn là huấn luyện viên phát âm tiếng Anh cho người Việt.

Từ cần nói: "${targetWord}"
Speech Recognition nghe được: "${userTranscript}"

Phân tích:
1. Nếu transcript khớp hoặc gần khớp với từ gốc (bỏ qua hoa thường), cho điểm cao
2. Nếu khác, phân tích lỗi phát âm phổ biến người Việt mắc phải
3. Đưa ra mẹo cải thiện cụ thể

Trả lời CHÍNH XÁC dưới dạng JSON:
{ "accuracy": <số từ 0-100>, "error": "<mô tả lỗi hoặc 'Phát âm tốt!''>", "tip": "<mẹo cải thiện>" }`
        : `You are an English pronunciation coach.

Target word: "${targetWord}"
Speech Recognition heard: "${userTranscript}"

Analyze:
1. If transcript matches or nearly matches the target (case insensitive), give high score
2. If different, analyze common pronunciation errors
3. Give specific improvement tips

Respond EXACTLY in JSON format:
{ "accuracy": <number 0-100>, "error": "<error description or 'Great pronunciation!'">", "tip": "<improvement tip>" }`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.0-flash-preview:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 256,
                    },
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data: GeminiResponse = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Extract JSON from response (handle markdown code blocks)
        let jsonStr = textResponse;
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }

        const parsed = JSON.parse(jsonStr);

        return {
            accuracy: Number(parsed.accuracy) || 0,
            error: parsed.error || '',
            tip: parsed.tip || '',
            isCorrect: Number(parsed.accuracy) >= 80,
        };
    } catch (error) {
        console.error('Gemini pronunciation analysis error:', error);

        // Fallback: simple text comparison
        const isMatch = targetWord.toLowerCase().trim() === userTranscript.toLowerCase().trim();

        return {
            accuracy: isMatch ? 100 : calculateSimilarity(targetWord, userTranscript),
            error: isMatch
                ? (isVietnamese ? 'Phát âm tốt!' : 'Great pronunciation!')
                : (isVietnamese ? 'Phát âm chưa khớp với từ gốc' : 'Pronunciation does not match target'),
            tip: isMatch
                ? (isVietnamese ? 'Tiếp tục phát huy!' : 'Keep it up!')
                : (isVietnamese ? 'Hãy nghe lại và thử lần nữa' : 'Listen again and try once more'),
            isCorrect: isMatch,
        };
    }
}

/**
 * Calculate string similarity (Levenshtein distance based)
 */
function calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 100;
    if (s1.length === 0 || s2.length === 0) return 0;

    const matrix: number[][] = [];

    for (let i = 0; i <= s1.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= s2.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= s1.length; i++) {
        for (let j = 1; j <= s2.length; j++) {
            if (s1[i - 1] === s2[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    const maxLen = Math.max(s1.length, s2.length);
    const distance = matrix[s1.length][s2.length];
    const similarity = ((maxLen - distance) / maxLen) * 100;

    return Math.round(similarity);
}

export default getPronunciationFeedback;
