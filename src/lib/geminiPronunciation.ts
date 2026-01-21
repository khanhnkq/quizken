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
    audioBase64: string,
    apiKey: string,
    isVietnamese: boolean = true
): Promise<PronunciationFeedback> {
    const systemInstruction = isVietnamese
        ? `Bạn là huấn luyện viên phát âm tiếng Anh cho người Việt.
Nhiệm vụ: Nghe file âm thanh và so sánh với từ mục tiêu: "${targetWord}".

Phân tích:
1. Độ chính xác (0-100%): Dựa trên độ rõ ràng, ngữ điệu và độ khớp với từ gốc.
2. Lỗi sai: Chỉ ra các âm bị sai (ví dụ: thiếu ending sound, sai nguyên âm...).
3. Mẹo: Đưa ra lời khuyên ngắn gọn để sửa lỗi.

Trả lời CHÍNH XÁC JSON:
{ "accuracy": <số>, "error": "<nhận xét ngắn>", "tip": "<lời khuyên>" }`
        : `You are an English pronunciation coach.
Task: Listen to the audio and compare with target word: "${targetWord}".

Analyze:
1. Accuracy (0-100%): Based on clarity, intonation, and match.
2. Error: Point out specific mispronounced sounds.
3. Tip: Brief advice to improve.

Respond EXACTLY in JSON:
{ "accuracy": <number>, "error": "<short comment>", "tip": "<advice>" }`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: systemInstruction },
                                {
                                    inline_data: {
                                        mime_type: "audio/webm;codecs=opus",
                                        data: audioBase64
                                    }
                                }
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.1,
                        response_mime_type: "application/json"
                    },
                }),
            }
        );

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errData)}`);
        }

        const data: GeminiResponse = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        const parsed = JSON.parse(textResponse);

        return {
            accuracy: Number(parsed.accuracy) || 0,
            error: parsed.error || '',
            tip: parsed.tip || '',
            isCorrect: Number(parsed.accuracy) >= 80,
        };
    } catch (error) {
        console.error('Gemini pronunciation analysis error:', error);
        return {
            accuracy: 0,
            error: isVietnamese ? 'Lỗi xử lý âm thanh' : 'Audio processing error',
            tip: isVietnamese ? 'Vui lòng thử lại' : 'Please try again',
            isCorrect: false,
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
