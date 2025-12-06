// @ts-expect-error Deno import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-expect-error Deno import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.6?target=deno";
/**
 * Embedded badwords list to avoid importing project files at deploy time.
 * Deploy environments (Edge/Deno) cannot resolve file:/// paths to repo files.
 * Keep this list relatively small — it's derived from src/assets/filter/badwords_vi.json.
 */ const badwordsData = {
  tuc_tieu: [
    "địt mẹ",
    "đụ mẹ",
    "đụ má",
    "đù mẹ",
    "đù má",
    "đm",
    "dm",
    "đmm",
    "vcl",
    "vl",
    "clm",
    "clgt",
    "vãi lồn",
    "vãi cặc",
    "vãi buồi",
    "vãi lol",
    "vãi lon",
    "cặc",
    "buồi",
    "lồn",
    "lol",
    "lon",
    "đĩ mẹ",
    "con đĩ",
    "đồ đĩ",
    "con điếm",
    "đồ điếm",
    "con phò",
    "phò",
    "dâm đãng",
    "đồ dâm",
    "đồ dơ",
    "tục tĩu",
    "đồ mất nết",
    "mất dạy",
    "bố láo",
    "láo toét",
    "láo lếu",
    "láo cá",
  ],
  xuc_pham: [
    "thằng chó",
    "con chó",
    "óc chó",
    "đồ chó",
    "đồ khốn",
    "thằng khốn",
    "đồ ngu",
    "đồ điên",
    "thằng điên",
    "thằng ngu",
    "con ngu",
    "ngu học",
    "ngu như bò",
    "ngu như chó",
    "ngu vãi",
    "đần độn",
    "não phẳng",
    "đồ ranh",
    "thằng ranh",
    "con ranh",
    "đồ ranh con",
    "vô học",
    "vô đạo đức",
    "mất dạy",
    "khốn nạn",
    "đồ khốn nạn",
    "đồ mất dạy",
    "vô liêm sỉ",
    "đê tiện",
    "bỉ ổi",
    "đểu cáng",
    "bá dơ",
  ],
  phan_biet: [
    "đồ mọi",
    "đồ dân tộc",
    "đồ chệt",
    "đồ tây ba lô",
    "bọn tàu",
    "bọn mọi",
    "bọn chệt",
    "bọn do thái",
    "đồ da đen",
    "đồ da vàng",
  ],
  bao_luc_de_doa: [
    "tao giết mày",
    "tao đâm mày",
    "tao đốt nhà mày",
    "tao bắn mày",
    "tao xử mày",
    "mày chết chắc",
    "mày tới số rồi",
    "giết nó đi",
    "chém nó",
    "đập chết mẹ mày",
    "đánh chết mẹ mày",
  ],
  nhay_cam_tinh_duc: [
    "sex",
    "địt",
    "đụ",
    "hiếp",
    "hiếp dâm",
    "thủ dâm",
    "xxx",
    "porn",
    "gái gọi",
    "dâm dục",
    "hentai",
    "jav",
    "loạn luân",
    "gái mại dâm",
    "gái bao",
    "đồ dâm tặc",
    "clip nóng",
    "ảnh nóng",
    "giao hợp",
    "dương vật",
    "âm đạo",
    "xuất tinh",
    "liếm",
    "bú",
    "hôn hít",
    "húp sò",
    "bắn tinh",
    "thổi kèn",
    "địt nhau",
  ],
  chui_rua_thong_dung: [
    "mẹ mày",
    "má mày",
    "con mẹ mày",
    "cha mày",
    "bố mày",
    "ông nội mày",
    "bà nội mày",
    "mẹ kiếp",
    "mẹ cha mày",
    "mẹ nó",
    "má nó",
    "bố mày nói",
    "mày ngu",
    "mày khùng",
    "mày điên",
    "mày câm",
    "mày dốt",
    "mày mất dạy",
  ],
  viet_tat_bien_the: [
    "đm",
    "dm",
    "đmm",
    "dmm",
    "đcm",
    "cl",
    "vl",
    "vcl",
    "cc",
    "clgt",
    "clm",
    "đjt",
    "đjtme",
    "djtme",
    "đjt mẹ",
    "djt mẹ",
    "đjt ma",
    "djt ma",
    "đjtmm",
    "đụmm",
    "đụm",
    "đụmẹ",
    "đụmá",
    "đụmạ",
  ],
  profanity: [
    "đm",
    "dm",
    "địt",
    "đjt",
    "đụ",
    "đù",
    "đéo",
    "cl",
    "clgt",
    "vcl",
    "cặc",
    "lồn",
    "loz",
    "mẹ",
    "cc",
    "vãi",
    "vl",
    "ml",
    "óc chó",
    "ngu",
    "thằng ngu",
    "bố mày",
    "tao",
    "mày",
    "đồ ngu",
    "chó má",
    "đồ khốn",
    "đồ ranh",
    "thằng chó",
    "thằng điên",
    "con ngu",
    "đồ hâm",
    "cờ hó",
    "chó đẻ",
    "đồ chó đẻ",
    "ngu như bò",
    "ngu như lợn",
    "đần",
    "óc lợn",
    "óc bò",
    "não phẳng",
    "não tàn",
    "não chó",
    "đụmẹ",
    "địtmẹ",
    "dume",
    "ditme",
    "chome",
    "chó má",
  ],
  sexual: [
    "dâm",
    "sexy",
    "hiếp",
    "hiếp dâm",
    "đồi trụy",
    "tục tĩu",
    "giao phối",
    "thủ dâm",
    "kích dục",
    "nứng",
    "jav",
    "porn",
    "xxx",
    "hentai",
    "loạn luân",
    "dildo",
    "sướng",
    "biến thái",
    "gái gọi",
    "trai bao",
    "buồi",
    "chim",
    "bướm",
    "vú",
    "đít",
    "mông",
    "ngực",
  ],
  violence: [
    "giết",
    "chém",
    "bắn",
    "đâm",
    "hành hung",
    "đập chết",
    "máu me",
    "khủng bố",
    "bom",
    "tự tử",
    "tự sát",
    "đánh nhau",
    "bạo lực",
    "đe dọa",
    "thủ tiêu",
    "giết người",
    "tàn sát",
    "tra tấn",
    "hành hạ",
    "thảm sát",
    "diệt chủng",
    "thanh trừng",
  ],
  discrimination: [
    "đồ ngu",
    "đồ khùng",
    "đồ điên",
    "con điên",
    "vô học",
    "rác rưởi",
    "thằng ranh",
    "đồ chó",
    "hạ đẳng",
    "ngu si",
    "miệt thị",
    "phân biệt chủng tộc",
    "kỳ thị",
    "gay",
    "les",
    "lgbt",
    "pê đê",
    "bóng",
    "less",
    "đồng tính",
  ],
  political: [
    "phản động",
    "lật đổ",
    "chính trị",
    "chế độ",
    "đảng",
    "biểu tình",
    "xâm phạm nhà nước",
    "tôn giáo",
    "thiên chúa",
    "phật giáo",
    "hồi giáo",
    "chửi chính quyền",
    "lãnh tụ",
    "hồ chí minh",
    "võ nguyên giáp",
    "nguyễn phú trọng",
    "việt tân",
    "nhà nước",
    "công an",
    "chính phủ",
  ],
};
// Build a simple sanitizer from the JSON list (case-insensitive, unicode-aware)
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
const rawWords = Object.values(badwordsData)
  .flat()
  .filter(Boolean)
  .map((w) => String(w).trim())
  .filter(Boolean);
const sortedEscaped = Array.from(new Set(rawWords))
  .sort((a, b) => b.length - a.length)
  .map((w) => escapeRegExp(w));
const BADWORDS_REGEX =
  sortedEscaped.length > 0 ? new RegExp(sortedEscaped.join("|"), "giu") : /a^/;
function sanitizeVietnameseBadwords(text, maskChar = "[removed]") {
  if (!text) return text;
  return text.replace(BADWORDS_REGEX, () => maskChar);
}
function containsVietnameseBadwords(text) {
  if (!text) return false;
  return BADWORDS_REGEX.test(text);
}
/**
 * Replace badwords with a safe placeholder for sending to AI.
 * Avoid using '*' masking because it confuses AI output (shows as **** in generated text).
 * Use a bracketed placeholder like "[removed]" which is clearer and won't break JSON.
 */ function replaceBadwordsForAi(text, placeholder = "[removed]") {
  if (!text) return text;
  return text.replace(BADWORDS_REGEX, placeholder);
}
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const SUPABASE_URL = Deno.env.get("PROJECT_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY");
const adminClient =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;
// CẤU HÌNH: Số câu hỏi mặc định
const QUESTIONS_COUNT = 10;
const QUIZ_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  EXPIRED: "expired",
};
function getClientIp(req) {
  const fwd = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  const real = (req.headers.get("x-real-ip") || "").trim();
  const cf = (req.headers.get("cf-connecting-ip") || "").trim();
  return fwd || real || cf || "unknown";
}
function simpleHash(input) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return `fp_${Math.abs(h).toString(36)}`;
}
function buildFingerprint(fingerprint, device, ip, ua) {
  if (fingerprint && fingerprint.length > 0) return fingerprint;
  const lang = device?.language || "";
  const platform = device?.platform || "";
  const tz = device?.timezone || "";
  const screen = device?.screen
    ? `${device.screen.width || 0}x${device.screen.height || 0}x${device.screen.colorDepth || 0
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
async function processQuizGeneration(quizId, payload, req) {
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
    const device = payload.device;
    const questionCount =
      typeof payload.questionCount === "number"
        ? payload.questionCount
        : QUESTIONS_COUNT;
    const idempotencyKey =
      typeof payload.idempotencyKey === "string"
        ? payload.idempotencyKey
        : undefined;
    // Extract language parameter (default to Vietnamese)
    const language = typeof payload.language === "string" ? payload.language : "vi";
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
      .update({
        progress: "Authenticating...",
      })
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
    let authenticatedUser = null;
    if (adminClient && accessToken) {
      try {
        const { data: authData, error } = await adminClient.auth.getUser(accessToken);
        isAuthenticated = !!authData?.user && !error;
        authenticatedUser = authData?.user;
      } catch {
        isAuthenticated = false;
        authenticatedUser = null;
      }
    }
    // 0. Enforce Authentication - Block Anonymous Users
    if (!isAuthenticated) {
      // Return 401 Unauthorized
      await updateQuizStatus(
        quizId,
        QUIZ_STATUS.FAILED,
        "Authentication required. Please log in to create quizzes."
      );
      return new Response(
        JSON.stringify({
          error: "Authentication required",
          message: "Please log in to create quizzes.",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // API Key setup and authentication
    const SERVER_GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    let apiKeyToUse = SERVER_GEMINI_API_KEY;
    let usingUserKey = false;
    let skipUsageLimit = false;

    // Try to get user key from payload OR database
    let userApiKey = apiKey;

    // If no key in payload, check DB for authenticated user
    if (!userApiKey && isAuthenticated && adminClient && authenticatedUser) {
      console.log(`🔍 Checking DB for API Key. User ID: ${authenticatedUser.id}`);
      try {
        const { data: keyData, error: keyError } = await adminClient
          .from("user_api_keys")
          .select("encrypted_key")
          .eq("user_id", authenticatedUser.id)
          .eq("provider", "gemini")
          .eq("is_active", true)
          .single();

        if (keyError) {
          console.error("❌ Error querying user_api_keys:", keyError);
        } else {
          console.log("✅ Query result:", keyData ? "Found Data" : "No Data");
        }

        if (keyData?.encrypted_key) {
          userApiKey = keyData.encrypted_key;
          console.log("🔑 Found active user API key in database");
        }
      } catch (e) {
        console.error("Error fetching user API key:", e);
      }
    }

    if (userApiKey && userApiKey.trim().length > 0 && isAuthenticated) {
      // Optimistically trust the user key to avoid "Quota Reached" false positives 
      // if the verification check fails due to network issues.
      // If the key is actually invalid, the main generation loop will fail with 401/403.
      apiKeyToUse = userApiKey;
      usingUserKey = true;
      skipUsageLimit = true; // Skip limits when using user key
      console.log("Using User API Key (Optimistic)");
    }
    if (!apiKeyToUse) {
      console.error("❌ No valid Gemini API key found!");
      console.error("SERVER_GEMINI_API_KEY exists:", !!SERVER_GEMINI_API_KEY);
      console.error("User provided key:", !!apiKey);
      // Provide clearer failure details to frontend with guidance links
      const detailedMsg =
        "No valid Gemini API key available (server or user). " +
        "If you are the project owner, add a server-side Gemini key to Supabase secrets: " +
        "`supabase secrets set GEMINI_API_KEY=your_server_key`. " +
        "If you are a user, verify your personal key and permissions. " +
        "Docs: https://makersuite.google.com/app/apikey and https://developers.generativeai.google/docs/";
      await updateQuizStatus(quizId, QUIZ_STATUS.FAILED, detailedMsg);
      return;
    }
    // Update progress
    await adminClient
      .from("quizzes")
      .update({
        progress: "Checking rate limits...",
      })
      .eq("id", quizId);
    // Authenticated User Quota Check
    const USER_DAILY_LIMIT = 5;

    // 0. Enforce Authentication - Block Anonymous Users
    if (!isAuthenticated) {
      // Return 401 Unauthorized
      await updateQuizStatus(
        quizId,
        QUIZ_STATUS.FAILED,
        "Authentication required. Please log in to create quizzes."
      );
      return new Response(
        JSON.stringify({
          error: "Authentication required",
          message: "Please log in to create quizzes.",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 1. Authenticated User Quota Check
    if (!skipUsageLimit && isAuthenticated && adminClient && authenticatedUser) {
      const userId = authenticatedUser.id;
      const day = todayDate();

      // Check user usage
      const { data: usageData, error: usageError } = await adminClient
        .from("profiles")
        .select("daily_quiz_count, last_daily_reset")
        .eq("id", userId)
        .single();

      if (usageError) {
        console.error("Error checking user usage:", usageError);
        // Fail open or closed? Let's fail open for now but log it, or safe fail.
      }

      let currentCount = 0;
      let lastResetDate = day;

      if (usageData) {
        currentCount = usageData.daily_quiz_count ?? 0;
        lastResetDate = usageData.last_daily_reset ?? day;
      }

      // Reset if new day
      if (lastResetDate !== day) {
        currentCount = 0;
      }

      if (currentCount >= USER_DAILY_LIMIT) {
        await updateQuizStatus(
          quizId,
          QUIZ_STATUS.FAILED,
          `Daily quota limit reached (${USER_DAILY_LIMIT}/day). Please add your own API Key in Settings.`
        );
        return;
      }

      // Increment usage (Update profiles)
      const { error: updateError } = await adminClient
        .from("profiles")
        .update({
          daily_quiz_count: currentCount + 1,
          last_daily_reset: day
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Error incrementing user usage:", updateError);
      }
    }


    // Update progress
    await adminClient
      .from("quizzes")
      .update({
        progress: "Generating with AI...",
      })
      .eq("id", quizId);
    // Generate quiz with detailed prompt
    const createPrompt = (
      topic: string,
      count: number,
      language: string = 'vi'
    ) => {
      const isVietnamese = language === 'vi';
      if (isVietnamese) {
        return `Tạo một JSON duy nhất, không có văn bản hay markdown, về chủ đề "${topic}".
**QUY TẮC NGHIÊM NGẶT:**
1.  **Định dạng:** Chỉ trả về JSON hợp lệ.
2.  **Ngôn ngữ:** Toàn bộ nội dung phải bằng tiếng Việt.
3.  **Số lượng:** JSON phải chứa chính xác **${count}** câu hỏi.
4.  **Chất lượng:** Các câu hỏi phải có "bẫy" (lựa chọn sai gây nhầm lẫn) và phân bổ độ khó như sau:
    *   **20% Trung bình:** Yêu cầu hiểu biết, bẫy dựa trên lỗi sai phổ biến.
    *   **30% Nâng cao:** Kiến thức sâu, bẫy thuyết phục.
    *   **50% Cực khó:** Dành cho chuyên gia, bẫy cực kỳ tinh vi dựa trên chi tiết nhỏ/ngoại lệ.
**Cấu trúc JSON bắt buộc:**
{
  "title": "tiêu đề tiếng Việt về ${topic}",
  "description": "mô tả ngắn gọn về bài kiểm tra và độ khó của nó",
  "category": "Tự do đặt tên category phù hợp nhất (1-2 từ, lowercase, tiếng Anh hoặc Việt không dấu). VD: history, technology, science, art, music, cooking, gaming, anime, fashion, fitness, literature, math, psychology, philosophy, economics, law, architecture, photography, film, etc. Bạn có thể sáng tạo category mới nếu chủ đề đặc biệt.",
  "difficulty": "chọn 1 trong: easy, medium, hard - dựa vào độ khó của các câu hỏi",
  "tags": ["từ khóa 1", "từ khóa 2", "từ khóa 3"] - 3-5 tags ngắn gọn phù hợp với chủ đề (viết thường, không dấu hoặc có dấu),
  "questions": [
    {
      "question": "câu hỏi tiếng Việt",
      "options": ["lựa chọn A", "lựa chọn B", "lựa chọn C", "lựa chọn D"],
      "correctAnswer": 0,
      "explanation": "giải thích chi tiết tại sao đáp án đúng (1-2 câu)"
    }
  ]
}`;
      } else {
        return `Create a single JSON object, without any text or markdown, about the topic "${topic}".
**STRICT RULES:**
1.  **Format:** Return only valid JSON.
2.  **Language:** All content must be in English.
3.  **Count:** JSON must contain exactly **${count}** questions.
4.  **Quality:** Questions must have "traps" (misleading wrong choices) and difficulty distribution:
    *   **20% Medium:** Requires understanding, traps based on common mistakes.
    *   **30% Advanced:** Deep knowledge, convincing traps.
    *   **50% Expert:** For experts, extremely subtle traps based on small details/exceptions.
**Required JSON structure:**
{
  "title": "English title about ${topic}",
  "description": "Brief description of the test and its difficulty",
  "category": "Choose the most appropriate category name (1-2 words, lowercase). E.g.: history, technology, science, art, music, cooking, gaming, anime, fashion, fitness, literature, math, psychology, philosophy, economics, law, architecture, photography, film, etc. You can create new categories if the topic is special.",
  "difficulty": "choose one: easy, medium, hard - based on question difficulty",
  "tags": ["keyword 1", "keyword 2", "keyword 3"] - 3-5 short tags relevant to the topic (lowercase),
  "questions": [
    {
      "question": "question in English",
      "options": ["choice A", "choice B", "choice C", "choice D"],
      "correctAnswer": 0,
      "explanation": "detailed explanation why the answer is correct (1-2 sentences)"
    }
  ]
}`;
      }
    };

    const generateQuiz = async (promptText, apiKey) =>
      await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: promptText,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.4,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 41000,
            },
          }),
        }
      );
    let data,
      quizData,
      tokenUsage = null;
    // Improved retry/backoff and logging metrics
    let retryCount = 0;
    const maxRetries = 5; // increase retries for transient errors
    const baseDelayMs = 1000;
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Check for cancellation before starting AI generation loop
    {
      const { data: checkQuiz } = await adminClient.from("quizzes").select("status").eq("id", quizId).single();
      if (checkQuiz?.status === 'cancelled' || checkQuiz?.status === 'failed') {
        console.log(`🛑 [BACKEND] Quiz ${quizId} was cancelled or failed. Stopping generation.`);
        return;
      }
    }

    for (retryCount = 0; retryCount <= maxRetries; retryCount++) {
      const attempt = retryCount + 1;
      try {
        console.log(
          `🔁 [BACKEND] Gemini attempt ${attempt}/${maxRetries + 1
          } for quiz ${quizId}`
        );
        // Persist attempt count & progress to DB for observability
        try {
          await adminClient
            .from("quizzes")
            .update({
              progress: `Generating with AI... (attempt ${attempt})`,
              attempts: attempt,
              last_attempt_at: new Date().toISOString(),
            })
            .eq("id", quizId);
        } catch (e) {
          // Non-fatal: just log if metrics update fails
          console.warn(
            "[BACKEND] Failed to persist attempt/metrics to DB:",
            e instanceof Error ? e.message : e
          );
        }
        const topicForAI =
          typeof payload.prompt === "string"
            ? replaceBadwordsForAi(payload.prompt, "[removed]")
            : "Default quiz topic";
        const response = await generateQuiz(
          createPrompt(topicForAI, questionCount, language),
          apiKeyToUse
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error(
            `❌ Gemini API Error (${response.status}) on attempt ${attempt}:`,
            errorData
          );
          // Handle non-retriable status codes immediately
          if (response.status === 429) {
            const msg429 =
              "Gemini rate limit exceeded (HTTP 429). This usually means the API key's quota was reached. " +
              "If you are using a personal key, check your usage in Google AI Studio. " +
              "If using the server key, consider requesting higher quota or using user keys for authenticated users. " +
              "See: https://makersuite.google.com/app/apikey";
            await updateQuizStatus(quizId, QUIZ_STATUS.FAILED, msg429);
            return;
          }
          if (response.status === 401) {
            const msg401 =
              "Authentication error (HTTP 401). The provided Gemini API key is invalid or revoked. " +
              "For user keys, re-generate in Google AI Studio. For server key, ensure GEMINI_API_KEY is set in Supabase secrets. " +
              "Guide: https://makersuite.google.com/app/apikey";
            await updateQuizStatus(quizId, QUIZ_STATUS.FAILED, msg401);
            return;
          }
          if (response.status === 403) {
            const msg403 =
              "Access forbidden (HTTP 403). The API key does not have permission to use the Gemini model or account access is restricted. " +
              "Check IAM/permissions and that the key is enabled for generative AI. See: https://developers.generativeai.google/docs/";
            await updateQuizStatus(quizId, QUIZ_STATUS.FAILED, msg403);
            return;
          }
          // For 5xx and other transient errors, retry with backoff
          if (response.status >= 500 && retryCount < maxRetries) {
            const jitter = 0.5 + Math.random() * 0.5;
            const delay = Math.round(
              baseDelayMs * Math.pow(2, retryCount) * jitter
            );
            console.warn(
              `[BACKEND] Transient Gemini error (status=${response.status}). Retrying in ${delay}ms...`
            );
            await sleep(delay);
            continue;
          }
          const errorMsg =
            errorData?.error?.message ||
            `Gemini API request failed: ${response.status}`;
          throw new Error(errorMsg);
        }
        // Parse response JSON safely
        data = await response.json().catch((e) => {
          throw new Error(`Failed to parse Gemini JSON response: ${e}`);
        });
        // Normalize parsed 'data' to a record for safe property access
        const parsedData = data || {};
        // Capture token usage from Gemini API response (if available)
        const usageMetadata = parsedData["usageMetadata"];
        tokenUsage = usageMetadata
          ? {
            prompt: Number(usageMetadata["promptTokenCount"] ?? 0),
            candidates: Number(usageMetadata["candidatesTokenCount"] ?? 0),
            total: Number(usageMetadata["totalTokenCount"] ?? 0),
          }
          : {
            prompt: 0,
            candidates: 0,
            total: 0,
          };
        // Extract generated text safely from nested structure
        let text;
        try {
          const candidates = parsedData["candidates"];
          if (Array.isArray(candidates) && candidates.length > 0) {
            const first = candidates[0];
            const content = first["content"];
            const parts = content?.["parts"];
            if (Array.isArray(parts) && parts.length > 0) {
              const part0 = parts[0];
              const maybeText = part0["text"];
              if (typeof maybeText === "string") text = maybeText;
            }
          }
        } catch {
          text = undefined;
        }
        if (!text) {
          const msg = "No quiz data generated";
          throw new Error(msg);
        }
        // Parse JSON from AI output robustly
        let jsonText = text.trim();
        if (jsonText.startsWith("```")) {
          const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          jsonText = jsonMatch ? jsonMatch[1].trim() : jsonText;
        }
        const jsonObjectMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonObjectMatch) jsonText = jsonObjectMatch[0];
        // Parse quiz JSON and compute actual question count safely
        try {
          const parsedQuiz = JSON.parse(jsonText);
          quizData = parsedQuiz;
        } catch (parseErr) {
          console.error(
            `[BACKEND] JSON parse error on attempt ${attempt} for quiz ${quizId}:`,
            parseErr instanceof Error ? parseErr.message : parseErr
          );
          if (retryCount < maxRetries) {
            const jitter = 0.5 + Math.random() * 0.5;
            const delay = Math.round(
              baseDelayMs * Math.pow(2, retryCount) * jitter
            );
            console.warn(
              `[BACKEND] Invalid JSON from AI. Retrying in ${delay}ms (attempt ${attempt})...`
            );
            await sleep(delay);
            continue;
          }
          throw new Error("Invalid JSON from AI");
        }
        const quizDataObj = quizData || {};
        const questionsArr = Array.isArray(quizDataObj["questions"])
          ? quizDataObj["questions"]
          : [];
        const actualCount = questionsArr.length;
        if (actualCount !== questionCount) {
          const msg = `AI returned ${actualCount} questions (expected ${questionCount})`;
          console.warn(
            `[BACKEND] ${msg} on attempt ${attempt} for quiz ${quizId}`
          );
          if (retryCount < maxRetries) {
            const jitter = 0.5 + Math.random() * 0.5;
            const delay = Math.round(
              baseDelayMs * Math.pow(2, retryCount) * jitter
            );
            console.warn(
              `[BACKEND] Question count mismatch. Retrying in ${delay}ms (attempt ${attempt})...`
            );
            await sleep(delay);
            continue;
          } else {
            throw new Error(msg);
          }
        }
        // Success: break out of retry loop
        console.log(
          `✅ [BACKEND] Successfully generated quiz on attempt ${attempt} for ${quizId}`
        );
        break;
      } catch (err) {
        console.error(
          `❌ [BACKEND] Attempt ${attempt} failed for quiz ${quizId}:`,
          err instanceof Error ? err.message : err
        );
        // If last attempt, rethrow to be handled by outer catch
        if (retryCount >= maxRetries) {
          console.error(
            `[BACKEND] Max retries reached (${maxRetries}). Failing generation for ${quizId}`
          );
          throw err;
        }
        // Backoff before next retry
        const jitter = 0.5 + Math.random() * 0.5;
        const delay = Math.round(
          baseDelayMs * Math.pow(2, retryCount) * jitter
        );
        console.log(`[BACKEND] Waiting ${delay}ms before next retry...`);
        await sleep(delay);
        continue;
      }
    }
    // Success! Use original AI output for DB so frontend shows original words.
    // We still produce a sanitized copy if needed (not saved by default).
    const quizObj = quizData || {};
    const rawTitle = String(quizObj.title ?? "");
    const rawDescription = String(quizObj.description ?? "");
    const rawCategory = String(quizObj.category ?? "general");
    const rawDifficulty = String(quizObj.difficulty ?? "medium");
    const rawTags = Array.isArray(quizObj.tags)
      ? quizObj.tags.slice(0, 5).map((t) => String(t ?? "").toLowerCase())
      : [];
    const rawQuestions = Array.isArray(quizObj.questions)
      ? quizObj.questions
      : [];
    // Keep sanitizedQuestions locally (not saved) in case needed for logging/debug
    const sanitizedQuestions = rawQuestions.map((q) => {
      const qq = q;
      const optionsRaw = Array.isArray(qq.options) ? qq.options : [];
      const safeOptions = optionsRaw.map((o) =>
        sanitizeVietnameseBadwords(String(o ?? ""), "[censored]")
      );
      return {
        question: sanitizeVietnameseBadwords(
          String(qq.question ?? ""),
          "[censored]"
        ),
        options: safeOptions,
        correctAnswer:
          typeof qq.correctAnswer === "number" ? qq.correctAnswer : 0,
        explanation: sanitizeVietnameseBadwords(
          String(qq.explanation ?? ""),
          "[censored]"
        ),
      };
    });
    // Save original AI output to DB so the UI shows the quiz as generated by AI

    // Check for cancellation before final save (to avoid overwriting 'cancelled' status)
    {
      const { data: checkQuiz } = await adminClient.from("quizzes").select("status").eq("id", quizId).single();
      if (checkQuiz?.status === 'cancelled' || checkQuiz?.status === 'failed') {
        console.log(`🛑 [BACKEND] Quiz ${quizId} was cancelled/failed during generation. Aborting save.`);
        return;
      }
    }

    await adminClient
      .from("quizzes")
      .update({
        title: rawTitle,
        description: rawDescription,
        questions: rawQuestions,
        category: rawCategory,
        difficulty: rawDifficulty,
        tags: rawTags,
        status: QUIZ_STATUS.COMPLETED,
        progress: "Completed!",
        prompt_tokens: (
          tokenUsage ?? {
            prompt: 0,
            candidates: 0,
            total: 0,
          }
        ).prompt,
        candidates_tokens: (
          tokenUsage ?? {
            prompt: 0,
            candidates: 0,
            total: 0,
          }
        ).candidates,
        total_tokens: (
          tokenUsage ?? {
            prompt: 0,
            candidates: 0,
            total: 0,
          }
        ).total,
        is_public: true,
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
async function updateQuizStatus(quizId, status, progress) {
  await adminClient
    .from("quizzes")
    .update({
      status,
      progress,
    })
    .eq("id", quizId);
}
// API Endpoints
async function handleStartQuiz(req) {
  if (req.method === "OPTIONS")
    return new Response(null, {
      headers: corsHeaders,
    });
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
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
  try {
    const payload = await req.json().catch(() => ({}));
    // Check for duplicate request using idempotency key
    const idempotencyKey =
      typeof payload.idempotencyKey === "string"
        ? payload.idempotencyKey
        : undefined;
    if (idempotencyKey && adminClient) {
      const { data: duplicateCheck, error: duplicateError } =
        await adminClient.rpc("check_duplicate_quiz_request", {
          p_idempotency_key: idempotencyKey,
          p_minutes_threshold: 5,
        });
      if (duplicateError) {
        console.warn("Error checking for duplicate request:", duplicateError);
        // Continue with request if check fails (fail open)
      } else if (duplicateCheck && duplicateCheck.length > 0) {
        // Return existing quiz if found within 5 minutes
        const existingQuiz = duplicateCheck[0];
        console.log(
          `Duplicate request detected, returning existing quiz: ${existingQuiz.quiz_id}`
        );
        return new Response(
          JSON.stringify({
            id: existingQuiz.quiz_id,
            status: QUIZ_STATUS.PENDING,
            duplicate: true,
            message: "Request already processed",
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }
    }
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
    const rawPromptForInsert =
      typeof payload.prompt === "string" ? payload.prompt : "Custom quiz topic";
    const sanitizedPromptForInsert = sanitizeVietnameseBadwords(
      rawPromptForInsert,
      "[censored]"
    );
    const insertTitle =
      sanitizedPromptForInsert && sanitizedPromptForInsert.length > 0
        ? sanitizedPromptForInsert
        : "Custom Quiz";
    const insertResult = await adminClient.from("quizzes").insert({
      id: quizId,
      status: QUIZ_STATUS.PENDING,
      prompt: sanitizedPromptForInsert,
      title: insertTitle,
      questions: [],
      session_id: sessionId,
      user_id: userId,
      progress: "Initializing...",
      question_count: payload.questionCount || 15,
      idempotency_key: idempotencyKey,
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
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
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
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to start quiz",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
}
async function handleGetQuizStatus(req) {
  if (req.method === "OPTIONS")
    return new Response(null, {
      headers: corsHeaders,
    });
  try {
    const url = new URL(req.url);
    const quizId = url.searchParams.get("quiz_id");
    if (!adminClient || !quizId) {
      return new Response(
        JSON.stringify({
          error: "Invalid request",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
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
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
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
              category: quiz.category || "general",
              difficulty: quiz.difficulty || "medium",
              tags: quiz.tags || [],
              tokenUsage: {
                prompt: quiz.prompt_tokens || 0,
                candidates: quiz.candidates_tokens || 0,
                total: quiz.total_tokens || 0,
              },
            }
            : null,
        progress: quiz.progress || "Processing...",
        error: quiz.status === QUIZ_STATUS.FAILED ? quiz.progress : undefined
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to get status",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
}

async function handleCancelQuiz(req) {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  if (!adminClient) {
    return new Response(JSON.stringify({ error: "Database unavailable" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // Auth Check
  const authHeader = req.headers.get("Authorization") || "";
  const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  let user = null;

  if (accessToken) {
    const { data } = await adminClient.auth.getUser(accessToken);
    user = data?.user;
  }

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const { quiz_id } = await req.json();
    if (!quiz_id) throw new Error("Missing quiz_id");

    // Check current status
    const { data: quiz, error: fetchError } = await adminClient
      .from("quizzes")
      .select("status, user_id")
      .eq("id", quiz_id)
      .single();

    console.log(`[CANCEL-QUIZ] Found quiz: ${quiz_id}, status: ${quiz?.status}`);

    if (fetchError || !quiz) throw new Error("Quiz not found");
    if (quiz.user_id !== user.id) throw new Error("Unauthorized access to quiz");

    // Only cancel if processing or pending
    if (quiz.status === QUIZ_STATUS.PROCESSING || quiz.status === QUIZ_STATUS.PENDING) {
      // 1. Update status
      console.log(`[CANCEL-QUIZ] Updating status to cancelled for quiz: ${quiz_id}`);
      const { error: updateError } = await adminClient
        .from("quizzes")
        .update({ status: 'cancelled', progress: 'Cancelled by user' })
        .eq("id", quiz_id);

      if (updateError) {
        console.error(`[CANCEL-QUIZ] Failed to update status:`, updateError);
        throw new Error("Failed to update quiz status");
      }
      console.log(`[CANCEL-QUIZ] Successfully cancelled quiz: ${quiz_id}`);

      // 2. Refund Logic REMOVED per user request
      // Cancellation now consumes the quota attempt as the process was initiated.
      // const { data: profile } = await adminClient.from("profiles").select("daily_quiz_count").eq("id", user.id).single();
      // if (profile && profile.daily_quiz_count > 0) {
      //   await adminClient.from("profiles").update({ daily_quiz_count: profile.daily_quiz_count - 1 }).eq("id", user.id);
      // }
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
}

// Main server function
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  const url = new URL(req.url);
  const path = url.pathname.split("/").pop();
  if (path === "start-quiz") {
    return handleStartQuiz(req);
  } else if (path === "get-quiz-status") {
    return handleGetQuizStatus(req);
  } else if (path === "cancel-quiz") {
    return handleCancelQuiz(req);
  }
  // Default blocking endpoint for backwards compatibility
  return new Response(
    JSON.stringify({
      error: "Endpoint not found",
    }),
    {
      status: 404,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
});
