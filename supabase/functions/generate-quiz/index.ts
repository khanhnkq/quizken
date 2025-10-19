// @ts-expect-error Deno import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-expect-error Deno import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.6?target=deno";

declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined;
    };
  };
}

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

// CẤU HÌNH: Số câu hỏi mặc định
const QUESTIONS_COUNT = 15;

const QUIZ_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  EXPIRED: "expired",
} as const;

type QuizStatus = (typeof QUIZ_STATUS)[keyof typeof QUIZ_STATUS];

interface QuizGenerationPayload {
  prompt?: string;
  device?: DeviceInfo;
  fingerprint?: string;
  questionCount?: number;
  apiKey?: string;
}

function getClientIp(req: Request): string {
  const fwd = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  const real = (req.headers.get("x-real-ip") || "").trim();
  const cf = (req.headers.get("cf-connecting-ip") || "").trim();
  return fwd || real || cf || "unknown";
}

function simpleHash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return `fp_${Math.abs(h).toString(36)}`;
}

interface DeviceInfo {
  language?: string;
  platform?: string;
  timezone?: string;
  userAgent?: string;
  screen?: {
    width?: number;
    height?: number;
    colorDepth?: number;
  };
}

function buildFingerprint(
  fingerprint: string | undefined,
  device: DeviceInfo | undefined,
  ip: string,
  ua: string
): string {
  if (fingerprint && fingerprint.length > 0) return fingerprint;
  const lang = device?.language || "";
  const platform = device?.platform || "";
  const tz = device?.timezone || "";
  const screen = device?.screen
    ? `${device.screen.width || 0}x${device.screen.height || 0}x${
        device.screen.colorDepth || 0
      }`
    : "";
  return simpleHash([ua || "", lang, platform, tz, screen, ip || ""].join("|"));
}

function todayDate() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
    .toISOString()
    .slice(0, 10);
}

// Background processing function
async function processQuizGeneration(
  quizId: string,
  payload: Record<string, unknown>,
  req: Request
) {
  console.log(`🚀 [BACKEND] Starting async quiz generation for ID: ${quizId}`);

  if (!adminClient) {
    console.error("No database client available");
    return;
  }

  try {
    // Update status to processing immediately
    await adminClient
      .from("quizzes")
      .update({
        status: QUIZ_STATUS.PROCESSING,
        progress: "Starting generation...",
      })
      .eq("id", quizId);

    const providedFingerprint =
      typeof payload.fingerprint === "string" ? payload.fingerprint : undefined;
    const device = payload.device as DeviceInfo | undefined;
    const questionCount =
      typeof payload.questionCount === "number"
        ? payload.questionCount
        : QUESTIONS_COUNT;

    const ip = getClientIp(req);
    const userAgent =
      req.headers.get("user-agent") || device?.userAgent || "unknown";
    const fingerprint = buildFingerprint(
      providedFingerprint,
      device,
      ip,
      userAgent
    );

    const apiKey =
      typeof payload.apiKey === "string" ? payload.apiKey : undefined;

    // Update progress
    await adminClient
      .from("quizzes")
      .update({ progress: "Authenticating..." })
      .eq("id", quizId);

    // Check authentication
    const authHeader =
      req.headers.get("Authorization") ||
      req.headers.get("authorization") ||
      "";
    const accessToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
    let isAuthenticated = false;

    if (adminClient && accessToken) {
      try {
        const { data, error } = await adminClient.auth.getUser(accessToken);
        isAuthenticated = !!data?.user && !error;
      } catch {
        isAuthenticated = false;
      }
    }

    // API Key setup and authentication
    const SERVER_GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (apiKey && !isAuthenticated) {
      await updateQuizStatus(
        quizId,
        QUIZ_STATUS.FAILED,
        "Authentication required for user API key"
      );
      return;
    }

    let apiKeyToUse = SERVER_GEMINI_API_KEY;
    let usingUserKey = false;
    let skipUsageLimit = false;

    if (apiKey && apiKey.trim().length > 0 && isAuthenticated) {
      try {
        const testResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );
        if (testResponse.ok) {
          apiKeyToUse = apiKey;
          usingUserKey = true;
          skipUsageLimit = true; // Skip limits when using user key
        } else {
          console.log(
            `User API key invalid (HTTP ${testResponse.status}) - falling back to server key`
          );
        }
      } catch {
        // fallback to server key
      }
    }

    if (!apiKeyToUse) {
      console.error("❌ No valid Gemini API key found!");
      console.error("SERVER_GEMINI_API_KEY exists:", !!SERVER_GEMINI_API_KEY);
      console.error("User provided key:", !!apiKey);
      await updateQuizStatus(
        quizId,
        QUIZ_STATUS.FAILED,
        "No valid Gemini API key available. Please set GEMINI_API_KEY in Supabase secrets."
      );
      return;
    }

    // Update progress
    await adminClient
      .from("quizzes")
      .update({ progress: "Checking rate limits..." })
      .eq("id", quizId);

    // Anonymous usage limiting (skip if using user key)
    const DAILY_LIMIT = 3;
    if (!skipUsageLimit && !isAuthenticated && adminClient) {
      const day = todayDate();
      const { data: rows, error: usageErr } = await adminClient
        .from("anonymous_usage")
        .select("*")
        .eq("ip", ip)
        .eq("fingerprint", fingerprint)
        .eq("day_date", day)
        .limit(1);

      if (!usageErr && rows && rows.length > 0) {
        const row = rows[0];
        if ((row.count ?? 0) >= DAILY_LIMIT) {
          await updateQuizStatus(
            quizId,
            QUIZ_STATUS.FAILED,
            "Anonymous quota exceeded"
          );
          return;
        }
        await adminClient
          .from("anonymous_usage")
          .update({
            count: (row.count ?? 0) + 1,
            last_used_at: new Date().toISOString(),
            user_agent: userAgent,
          })
          .eq("id", row.id);
      } else {
        await adminClient.from("anonymous_usage").insert({
          ip,
          fingerprint,
          user_agent: userAgent,
          day_date: day,
          count: 1,
          last_used_at: new Date().toISOString(),
        });
      }
    }

    // Update progress
    await adminClient
      .from("quizzes")
      .update({ progress: "Generating with AI..." })
      .eq("id", quizId);

    // Generate quiz with detailed prompt
    const createPrompt = (
      topic: string,
      count: number
    ): string => `Bạn phải trả về CHỈ JSON hợp lệ, không có ký tự đặc biệt, không có văn bản bên ngoài hoặc markdown formatting.

Chủ đề: ${topic}

Cấu trúc JSON bắt buộc (không được thêm bất kỳ ký tự nào khác):
{
  "title": "tiêu đề thích hợp bằng tiếng Việt",
  "description": "mô tả ngắn gọn bằng tiếng Việt",
  "questions": [
    {
      "question": "câu hỏi bằng tiếng Việt",
      "options": ["lựa chọn A", "lựa chọn B", "lựa chọn C", "lựa chọn D"],
      "correctAnswer": 0,
      "explanation": "giải thích bằng tiếng Việt"
    },
    {
      "question": "câu hỏi thứ 2",
      "options": ["lựa chọn A", "lựa chọn B", "lựa chọn C", "lựa chọn D"],
      "correctAnswer": 1,
      "explanation": "giải thích"
    },
    {"question": "câu hỏi...", "options": ["A", "B", "C", "D"], "correctAnswer": 2, "explanation": "..."}
  ]
}

YÊU CẦU NGHIÊM NGẶT:
- ĐÚNG ${count} câu hỏi (không nhiều, không ít) - giả sử bạn tạo ${count} câu hỏi thì chỉ trả về ${count} câu
- CHỈ trả về JSON hợp lệ
- KHÔNG có markdown blocks (\`\`\`json) hoặc backticks
- KHÔNG có văn bản trước hoặc sau JSON
- KHÔNG có ký tự đặc biệt, emoji, định dạng
- Bạn phải đếm chính xác ${count} câu hỏi trước khi trả về`;

    const generateQuiz = async (
      promptText: string,
      apiKey: string
    ): Promise<Response> =>
      await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            },
          }),
        }
      );

    let data, quizData, tokenUsage;
    let retryCount = 0;
    const maxRetries = 3;

    do {
      const response = await generateQuiz(
        createPrompt(
          typeof payload.prompt === "string"
            ? payload.prompt
            : "Default quiz topic",
          questionCount
        ),
        apiKeyToUse
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ Gemini API Error (${response.status}):`, errorData);

        if (response.status === 429) {
          await updateQuizStatus(
            quizId,
            QUIZ_STATUS.FAILED,
            "Gemini rate limit exceeded. Please check your API quota."
          );
          return;
        }
        if (response.status === 401) {
          await updateQuizStatus(
            quizId,
            QUIZ_STATUS.FAILED,
            "Invalid Gemini API key. Please check your configuration."
          );
          return;
        }
        if (response.status === 403) {
          await updateQuizStatus(
            quizId,
            QUIZ_STATUS.FAILED,
            "Gemini API access forbidden. Check your account status."
          );
          return;
        }
        const errorMsg = errorData?.error?.message || `Gemini API request failed: ${response.status}`;
        throw new Error(errorMsg);
      }

      data = await response.json();

      // Capture token usage from Gemini API response
      tokenUsage = data.usageMetadata
        ? {
            prompt: data.usageMetadata.promptTokenCount || 0,
            candidates: data.usageMetadata.candidatesTokenCount || 0,
            total: data.usageMetadata.totalTokenCount || 0,
          }
        : {
            prompt: 0,
            candidates: 0,
            total: 0,
          };

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("No quiz data generated");

      // Parse JSON (same logic as original)
      let jsonText = text.trim();
      if (jsonText.startsWith("```")) {
        const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        jsonText = jsonMatch ? jsonMatch[1].trim() : jsonText;
      }
      const jsonObjectMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) jsonText = jsonObjectMatch[0];

      try {
        quizData = JSON.parse(jsonText);
      } catch {
        throw new Error("Invalid JSON from AI");
      }

      const actualCount = quizData.questions?.length || 0;
      if (actualCount !== questionCount && retryCount < maxRetries) {
        retryCount++;
        continue;
      }
      break;
    } while (retryCount <= maxRetries);

    // Success! Save to database
    await adminClient
      .from("quizzes")
      .update({
        title: quizData.title,
        description: quizData.description,
        questions: quizData.questions,
        status: QUIZ_STATUS.COMPLETED,
        progress: "Completed!",
        prompt_tokens: tokenUsage.prompt,
        candidates_tokens: tokenUsage.candidates,
        total_tokens: tokenUsage.total,
        is_public: true, // Always set completed quizzes as public
      })
      .eq("id", quizId);

    console.log(`✅ [BACKEND] Quiz generation completed for ID: ${quizId}`);
  } catch (error) {
    console.error(
      `❌ [BACKEND] Quiz generation failed for ID: ${quizId}`,
      error
    );
    await updateQuizStatus(
      quizId,
      QUIZ_STATUS.FAILED,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

// Helper function to update quiz status
async function updateQuizStatus(
  quizId: string,
  status: QuizStatus,
  progress: string
) {
  await adminClient
    .from("quizzes")
    .update({ status, progress })
    .eq("id", quizId);
}

// API Endpoints
async function handleStartQuiz(req: Request) {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  // Check database connection first
  if (!adminClient) {
    console.error(
      "❌ [BACKEND] Database client not available - check env vars"
    );
    return new Response(
      JSON.stringify({
        error: "Database connection failed",
        details: "Environment variables not configured",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const payload = await req.json().catch(() => ({}));

    // Get user_id
    const authHeader =
      req.headers.get("Authorization") ||
      req.headers.get("authorization") ||
      "";
    const accessToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
    let userId = null;

    if (adminClient && accessToken) {
      const { data } = await adminClient.auth.getUser(accessToken);
      userId = data?.user?.id || null;
    }

    // Create quiz record
    const quizId = crypto.randomUUID();
    const sessionId = crypto.randomUUID();

    console.log(`[START-QUIZ] Attempting to insert quiz record: ${quizId}`);

    const insertResult = await adminClient!.from("quizzes").insert({
      id: quizId,
      status: QUIZ_STATUS.PENDING,
      prompt: payload.prompt || "Custom quiz topic",
      title: payload.prompt || "Custom Quiz", // ✅ Required title
      questions: [], // ✅ Required questions - empty array initially
      session_id: sessionId,
      user_id: userId,
      progress: "Initializing...",
      question_count: payload.questionCount || 15,
    });

    // Check if insert failed
    if (insertResult.error) {
      console.error(`[START-QUIZ] Database insert failed:`, insertResult.error);
      return new Response(
        JSON.stringify({
          error: "Failed to save quiz to database",
          details: insertResult.error.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(
      `[START-QUIZ] Insert successful, starting background processing for: ${quizId}`
    );

    // Start background processing - only if insert succeeded
    processQuizGeneration(quizId, payload, req);

    // Always respond immediately (don't wait for background processing)
    const responseObject = {
      id: quizId,
      status: QUIZ_STATUS.PENDING,
    };

    console.log(`[START-QUIZ] Sending response:`, responseObject);

    return new Response(JSON.stringify(responseObject), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to start quiz" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

async function handleGetQuizStatus(req: Request) {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const quizId = url.searchParams.get("quiz_id");

    if (!adminClient || !quizId) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: quiz } = await adminClient
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    if (!quiz) {
      return new Response(
        JSON.stringify({
          status: QUIZ_STATUS.FAILED,
          error: "Quiz not found",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        status: quiz.status,
        quiz:
          quiz.status === QUIZ_STATUS.COMPLETED
            ? {
                title: quiz.title,
                description: quiz.description,
                questions: quiz.questions,
                tokenUsage: {
                  prompt: quiz.prompt_tokens || 0,
                  candidates: quiz.candidates_tokens || 0,
                  total: quiz.total_tokens || 0,
                },
              }
            : null,
        progress: quiz.progress || "Processing...",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to get status" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

// Main server function
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split("/").pop();

  if (path === "start-quiz") {
    return handleStartQuiz(req);
  } else if (path === "get-quiz-status") {
    return handleGetQuizStatus(req);
  }

  // Default blocking endpoint for backwards compatibility
  return new Response(JSON.stringify({ error: "Endpoint not found" }), {
    status: 404,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
