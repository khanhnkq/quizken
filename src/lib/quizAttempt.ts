import { supabase } from "@/integrations/supabase/client";

export interface QuizAttemptResult {
    success: boolean;
    score?: number;
    correct_answers?: number;
    total_questions?: number;
    attempt_id?: string;
}

/**
 * Submit quiz attempt via Edge Function for SERVER-SIDE score validation.
 * This prevents client-side score manipulation (cheating).
 */
export async function saveQuizAttempt(
    quizId: string,
    answers: number[],
    timeTakenSeconds: number
): Promise<QuizAttemptResult> {
    try {
        // Get current session for auth token
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        if (!accessToken) {
            console.error("No access token available");
            return { success: false };
        }

        // Call Edge Function for server-side validation
        const { data, error } = await supabase.functions.invoke("submit-quiz-attempt", {
            body: {
                quiz_id: quizId,
                answers: answers,
                time_taken_seconds: timeTakenSeconds,
            },
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (error) {
            console.error("Error submitting quiz attempt:", error);
            return { success: false };
        }

        console.log("✅ Quiz attempt saved (server-validated):", data);
        return {
            success: true,
            score: data.score,
            correct_answers: data.correct_answers,
            total_questions: data.total_questions,
            attempt_id: data.attempt_id,
        };
    } catch (err) {
        console.error("Unexpected error:", err);
        return { success: false };
    }
}

/**
 * Increment usage count for a quiz.
 */
export async function incrementQuizUsage(quizId: string): Promise<void> {
    try {
        await supabase.rpc("increment_quiz_usage", { quiz_id: quizId });
    } catch (error) {
        console.error("Failed to increment usage count:", error);
    }
}
