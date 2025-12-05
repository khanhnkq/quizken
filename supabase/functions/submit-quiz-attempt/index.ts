// @ts-expect-error Deno import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-expect-error Deno import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.6?target=deno";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("PROJECT_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY");

const adminClient =
    SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
        ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        : null;

interface Question {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
}

interface Quiz {
    id: string;
    questions: Question[];
}

interface SubmitAttemptPayload {
    quiz_id: string;
    answers: number[];
    time_taken_seconds?: number;
}

interface AttemptResult {
    success: boolean;
    score: number;
    correct_answers: number;
    total_questions: number;
    error?: string;
}

serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    // Only allow POST
    if (req.method !== "POST") {
        return new Response(
            JSON.stringify({ error: "Method not allowed" }),
            {
                status: 405,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }

    try {
        // Check database client
        if (!adminClient) {
            throw new Error("Database client not configured");
        }

        // Authenticate user
        const authHeader =
            req.headers.get("Authorization") ||
            req.headers.get("authorization") ||
            "";
        const accessToken = authHeader.startsWith("Bearer ")
            ? authHeader.slice(7)
            : null;

        if (!accessToken) {
            return new Response(
                JSON.stringify({ error: "Authentication required" }),
                {
                    status: 401,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        // Verify user
        const { data: userData, error: authError } = await adminClient.auth.getUser(accessToken);
        if (authError || !userData?.user) {
            return new Response(
                JSON.stringify({ error: "Invalid authentication token" }),
                {
                    status: 401,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        const userId = userData.user.id;

        // Parse request body
        const payload: SubmitAttemptPayload = await req.json();
        const { quiz_id, answers, time_taken_seconds } = payload;

        // Validate required fields
        if (!quiz_id || !Array.isArray(answers)) {
            return new Response(
                JSON.stringify({ error: "Missing required fields: quiz_id, answers" }),
                {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        // Fetch quiz from database (using service role to bypass RLS)
        const { data: quizData, error: quizError } = await adminClient
            .from("quizzes")
            .select("id, questions")
            .eq("id", quiz_id)
            .single();

        if (quizError || !quizData) {
            console.error("Quiz fetch error:", quizError);
            return new Response(
                JSON.stringify({ error: "Quiz not found" }),
                {
                    status: 404,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        const quiz = quizData as Quiz;
        const questions = quiz.questions;

        // Validate answer count matches question count
        if (answers.length !== questions.length) {
            return new Response(
                JSON.stringify({
                    error: `Answer count mismatch. Expected ${questions.length}, got ${answers.length}`,
                }),
                {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        // ========================================
        // SERVER-SIDE SCORE CALCULATION
        // ========================================
        let correctCount = 0;
        for (let i = 0; i < questions.length; i++) {
            const userAnswer = answers[i];
            const correctAnswer = questions[i].correctAnswer;

            // Validate answer is a valid index
            if (
                typeof userAnswer === "number" &&
                userAnswer >= 0 &&
                userAnswer < questions[i].options.length &&
                userAnswer === correctAnswer
            ) {
                correctCount++;
            }
        }

        const totalQuestions = questions.length;
        const score = Math.round((correctCount / totalQuestions) * 100);

        console.log(
            `✅ [SUBMIT-ATTEMPT] User ${userId} | Quiz ${quiz_id} | Score: ${score}% (${correctCount}/${totalQuestions})`
        );

        // ========================================
        // INSERT VALIDATED ATTEMPT INTO DATABASE
        // ========================================
        const { data: attemptData, error: insertError } = await adminClient
            .from("quiz_attempts")
            .insert({
                quiz_id: quiz_id,
                user_id: userId,
                score: score,
                total_questions: totalQuestions,
                correct_answers: correctCount,
                answers: answers,
                time_taken_seconds: time_taken_seconds || null,
                completed_at: new Date().toISOString(),
            })
            .select("id")
            .single();

        if (insertError) {
            console.error("Insert attempt error:", insertError);
            return new Response(
                JSON.stringify({ error: "Failed to save quiz attempt" }),
                {
                    status: 500,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        // Return validated result
        const result: AttemptResult = {
            success: true,
            score: score,
            correct_answers: correctCount,
            total_questions: totalQuestions,
        };

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : "Internal server error",
            }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
