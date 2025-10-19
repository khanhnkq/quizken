import React, { useState, useEffect, type MouseEvent } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2,
  Download,
  Sparkles,
  LogIn,
  XCircle,
  Clock,
  Target,
  Shield,
} from "lucide-react";
import { ScrollVelocityContainer, ScrollVelocityRow } from "./ScrollVelocity";
import jsPDF from "jspdf";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Quiz {
  title: string;
  description: string;
  questions: Question[];
}

const QuizGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [debugData, setDebugData] = useState<unknown>(null);
  const [tokenUsage, setTokenUsage] = useState<{
    prompt: number;
    candidates: number;
    total: number;
  } | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [promptError, setPromptError] = useState<string>("");
  const [isPromptValid, setIsPromptValid] = useState<boolean>(false);
  const [hasReachedLimit, setHasReachedLimit] = useState<boolean>(false);
  const [showQuotaDialog, setShowQuotaDialog] = useState<boolean>(false);
  const [quotaResetMs, setQuotaResetMs] = useState<number | null>(null);
  const [showApiKeyErrorDialog, setShowApiKeyErrorDialog] =
    useState<boolean>(false);
  const [apiKeyError, setApiKeyError] = useState<string>("");

  // Async quiz polling state
  const [quizId, setQuizId] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<string>("");
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [userApiKey, setUserApiKey] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<string>("");
  const [isQuestionCountSelected, setIsQuestionCountSelected] =
    useState<boolean>(false);
  const location = useLocation();
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const isMountedRef = React.useRef<boolean>(true);

  // Initialize AbortController - No automatic cleanup to allow quiz generation
  // during in-app navigation. Only cancel on explicit page unload signals.
  useEffect(() => {
    abortControllerRef.current = new AbortController();
    // IMPORTANT: No cleanup function in this useEffect!
    // We want quiz generation to continue during React Router navigations
    // because SPA navigation doesn't mean user wants to stop the process.
  }, []);

  // We'll simplify: Only cancel on actual tab close/reload/navigation away
  // Don't try to be smart about in-app navigation - let React Router handle it
  useEffect(() => {
    const handlePageHide = () => {
      if (abortControllerRef.current && loading) {
        abortControllerRef.current.abort();
        console.log(
          "🛑 [ABORT] Quiz generation cancelled due to page unload (tab close/reload)"
        );
      }
    };

    // Listen for page hide (user closes tab, refreshes, navigates to external site)
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handlePageHide);

    // Optional: Cancel if user switches tabs for a while (e.g. 5 minutes)
    let tabHiddenTimer: NodeJS.Timeout;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched away from tab
        tabHiddenTimer = setTimeout(() => {
          if (document.hidden && abortControllerRef.current && loading) {
            abortControllerRef.current.abort();
            console.log(
              "🛑 [ABORT] Quiz generation cancelled due to extended tab inactivity (5+ minutes)"
            );
          }
        }, 5 * 60 * 1000); // 5 minutes
      } else {
        // User came back to tab
        if (tabHiddenTimer) clearTimeout(tabHiddenTimer);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (tabHiddenTimer) clearTimeout(tabHiddenTimer);
    };
  }, [loading]); // Only depend on loading state

  // Cleanup only on actual component unmount
  useEffect(() => {
    return () => {
      // Only abort on final component unmount (page close ::=, navigate away)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        console.log(
          "🛑 [ABORT] Quiz generation cancelled due to component final unmount"
        );
      }
    };
  }, []); // Empty dependency array - only run on unmount

  // If navigation passed a quiz via location.state, preload it into the generator
  React.useEffect(() => {
    type LocationState = { quiz?: Quiz | string } | null;
    const locState = location.state as unknown as LocationState;
    const stateQuiz = locState?.quiz;
    if (stateQuiz) {
      try {
        const normalizedQuiz =
          typeof stateQuiz === "string" ? JSON.parse(stateQuiz) : stateQuiz;
        setQuiz(normalizedQuiz as Quiz);
        setUserAnswers([]);
        setShowResults(false);

        // Scroll to quiz section after it renders
        requestAnimationFrame(() => {
          const element = document.getElementById("quiz");
          if (element) {
            const yOffset = -5;
            const y =
              element.getBoundingClientRect().top +
              window.pageYOffset +
              yOffset;
            window.scrollTo({
              top: y,
              behavior: "smooth",
            });
          }
        });

        // Clear history state so navigating back doesn't reopen the quiz unintentionally
        try {
          if (history && history.replaceState) {
            history.replaceState({}, document.title);
          }
        } catch (e) {
          /* ignore */
        }
      } catch (e) {
        console.error("Failed to parse quiz from navigation state:", e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tự động cuộn xuống quiz section khi quiz được tạo xong
  useEffect(() => {
    if (quiz) {
      // Đợi render section điều kiện xong rồi mới scroll
      requestAnimationFrame(() => {
        const element = document.getElementById("quiz");
        if (element) {
          const yOffset = -5; // Khoảng cách từ top (cho header/navbar)
          const y =
            element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({
            top: y,
            behavior: "smooth",
          });
        }
      });
    }
  }, [quiz]);

  // Validate prompt input
  const validatePrompt = (input: string) => {
    const trimmed = input.trim();

    if (trimmed.length === 0) {
      setPromptError("");
      setIsPromptValid(false);
      return false;
    }

    if (trimmed.length < 5) {
      setPromptError("Vui lòng nhập ít nhất 5 ký tự");
      setIsPromptValid(false);
      return false;
    }

    if (trimmed.length > 500) {
      setPromptError("Không được quá 500 ký tự");
      setIsPromptValid(false);
      return false;
    }

    // Check for valid characters (only allow Vietnamese, English, numbers, basic punctuation)
    const validRegex = /^[\p{L}\p{N}\s.,!?"()-]+$/u;
    if (!validRegex.test(trimmed)) {
      setPromptError("Chỉ được sử dụng chữ cái, số và ký tự cơ bản");
      setIsPromptValid(false);
      return false;
    }

    setPromptError("");
    setIsPromptValid(true);
    return true;
  };

  // Real-time validation
  useEffect(() => {
    validatePrompt(prompt);
  }, [prompt]);

  // Check if user has reached anonymous limit
  useEffect(() => {
    if (!user) {
      // Check if quota should be reset first
      const quotaReset = checkQuotaReset();

      const anonymousCount = getAnonymousQuizCount();
      setHasReachedLimit(anonymousCount >= 3);

      // If quota was reset, show notification
      if (quotaReset) {
        toast({
          title: "Quota đã reset!",
          description: "Bạn đã có thể tạo 3 quiz miễn phí mới rồi!",
          variant: "success",
        });
      }
    } else {
      setHasReachedLimit(false);
      loadUserApiKey(); // Load user's API key when authenticated
    }
  }, [user]);

  const getAnonymousQuizCount = () => {
    const count = localStorage.getItem("anonymousQuizzes") || "0";
    return parseInt(count);
  };

  const incrementAnonymousQuizCount = () => {
    const currentCount = getAnonymousQuizCount();
    const newCount = currentCount + 1;
    localStorage.setItem("anonymousQuizzes", newCount.toString());

    // Set reset timestamp on first quiz creation
    if (currentCount === 0) {
      localStorage.setItem("lastQuotaReset", Date.now().toString());
    }

    return newCount;
  };

  const resetAnonymousQuizCount = () => {
    localStorage.setItem("anonymousQuizzes", "0");
    toast({
      title: "Reset thành công",
      description: "Đã reset counter về 0 để test lại",
      variant: "success",
    });
  };

  // Check if quota should reset (every 24 hours)
  const checkQuotaReset = () => {
    const lastQuotaTime = localStorage.getItem("lastQuotaReset");
    if (!lastQuotaTime) return false;

    const timeDiff = Date.now() - parseInt(lastQuotaTime);
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (timeDiff > oneDay) {
      // Reset quota after 24 hours
      localStorage.setItem("anonymousQuizzes", "0");
      localStorage.setItem("lastQuotaReset", Date.now().toString());
      return true;
    }
    return false;
  };

  // Get remaining time for quota reset
  const getTimeUntilReset = () => {
    const lastQuotaTime = localStorage.getItem("lastQuotaReset");
    if (!lastQuotaTime) return null;

    const lastTime = parseInt(lastQuotaTime);
    const timePassed = Date.now() - lastTime;
    const oneDay = 24 * 60 * 60 * 1000;
    const remaining = oneDay - timePassed;

    if (remaining <= 0) return null;

    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

    return { hours, minutes };
  };

  const loadUserApiKey = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("user_api_keys")
        .select("encrypted_key")
        .eq("user_id", user.id)
        .eq("provider", "gemini")
        .eq("is_active", true)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading user API key:", error);
      } else if (data) {
        // Decrypt ở production, ở dev dùng trực tiếp
        setUserApiKey(data.encrypted_key);
        console.log("✅ Loaded user API key from database");
      } else {
        console.log("ℹ️ No active user API key found");
      }
    } catch (error) {
      console.error("Error loading user API key:", error);
    }
  };

  // Expose reset function to window for testing (only in development)
  if (import.meta.env.DEV) {
    (window as { resetQuizCounter?: () => void }).resetQuizCounter =
      resetAnonymousQuizCount;
  }

  // Load quiz generation state from localStorage on mount (for navigation persistence)
  useEffect(() => {
    // First, check if there's ongoing generation state
    const savedGenerationState = localStorage.getItem("currentQuizGeneration");
    if (savedGenerationState && !loading && !quiz) {
      try {
        const generationState = JSON.parse(savedGenerationState);
        const {
          quizId,
          loading: storedLoading,
          generationStatus: storedStatus,
          generationProgress: storedProgress,
        } = generationState;

        // Check if the generation state is recent (not older than 10 minutes)
        const stateAge = Date.now() - generationState.timestamp;
        const maxAge = 10 * 60 * 1000; // 10 minutes

        if (stateAge > maxAge) {
          console.log("❌ Generation state is too old, clearing");
          localStorage.removeItem("currentQuizGeneration");
          localStorage.removeItem("currentQuizId");
          return;
        }

        console.log(
          "▶️ [FRONTEND] Restoring generation state from localStorage"
        );

        // Restore the generation state
        setLoading(storedLoading);
        setGenerationStatus(storedStatus);
        setGenerationProgress(storedProgress || "Đang tạo câu hỏi AI...");
        setQuizId(quizId);

        // Resume polling
        startPolling(quizId);

        console.log("✅ Generation state restored, polling resumed");
        return; // Don't check regular saved quiz if we have active generation
      } catch (error) {
        console.error("❌ Error parsing generation state:", error);
        localStorage.removeItem("currentQuizGeneration");
      }
    }

    // Fallback: Check for saved quiz (for completed quizzes or resumed sessions)
    const savedQuizId = localStorage.getItem("currentQuizId");
    if (savedQuizId && !quiz && !loading) {
      console.log(
        "🔄 [FRONTEND] Checking saved quiz from localStorage:",
        savedQuizId
      );

      // First, check if the quiz is still valid and not expired
      supabase.functions
        .invoke(`generate-quiz/get-quiz-status?quiz_id=${savedQuizId}`, {
          body: {},
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })
        .then(({ data, error }) => {
          if (error || !data) {
            console.log(
              "❌ Saved quiz not found or expired, clearing localStorage"
            );
            localStorage.removeItem("currentQuizId");
            return;
          }

          const status = data.status;
          console.log(`✅ Saved quiz status: ${status}`);

          if (status === "completed") {
            // Quiz already completed, load it directly
            setQuiz(data.quiz);
            localStorage.removeItem("currentQuizId");
            localStorage.removeItem("currentQuizGeneration"); // Clean up generation state
            toast({
              title: "Quiz recovered",
              description: "Previous quiz has been loaded from cache",
              variant: "info",
            });
          } else if (status === "failed") {
            // Quiz failed, clean up
            localStorage.removeItem("currentQuizId");
            localStorage.removeItem("currentQuizGeneration");
            toast({
              title: "Previous quiz failed",
              description: "Starting fresh generation",
              variant: "warning",
            });
          } else if (status === "processing" || status === "pending") {
            // Still processing, resume generation state
            console.log("▶️ Resuming quiz generation from saved state...");
            setLoading(true);
            setGenerationStatus("processing");
            setGenerationProgress("Tiếp tục tạo quiz...");
            setQuizId(savedQuizId);
            startPolling(savedQuizId);
          } else {
            // Expired or unknown status, clean up
            localStorage.removeItem("currentQuizId");
            localStorage.removeItem("currentQuizGeneration");
          }
        })
        .catch((error) => {
          console.error("❌ Error checking saved quiz:", error);
          localStorage.removeItem("currentQuizId");
          localStorage.removeItem("currentQuizGeneration");
        });
    }
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
        setPollInterval(null);
      }
    };
  }, [pollInterval]);

  // Persist generation state across navigation
  const persistGenerationState = (
    partial: Partial<{
      quizId: string;
      loading: boolean;
      generationStatus: string | null;
      generationProgress: string;
    }>
  ) => {
    try {
      const savedRaw = localStorage.getItem("currentQuizGeneration");
      const saved = savedRaw ? JSON.parse(savedRaw) : {};
      const state = {
        ...saved,
        ...partial,
        timestamp: Date.now(),
      };
      localStorage.setItem("currentQuizGeneration", JSON.stringify(state));
    } catch {
      // ignore localStorage errors
    }
  };

  // Start polling quiz status
  const startPolling = (quizIdToPoll: string) => {
    console.log("🔄 [FRONTEND] Starting status polling for:", quizIdToPoll);

    setGenerationStatus((prev) => prev ?? "pending");
    setGenerationProgress((prev) => prev || "Đang chuẩn bị...");

    const interval = setInterval(async () => {
      try {
        // 🔄 CALL NEW API: get-quiz-status endpoint
        const { data, error } = await supabase.functions.invoke(
          `generate-quiz/get-quiz-status?quiz_id=${quizIdToPoll}`,
          {
            body: {},
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (error) throw error;

        const status = data.status;
        const progress = data.progress;

        console.log(`🔄 [FRONTEND] Poll result: ${status} - ${progress}`);

        if (status === "completed") {
          // Success! Load the quiz
          setQuiz(data.quiz);

          // Use actual token usage from backend if available
          // If not available (for older records), fall back to approximation for display
          if (data.quiz.tokenUsage) {
            setTokenUsage(data.quiz.tokenUsage);
          } else {
            // Fallback approximation for older records without token data
            const calculateApproximateTokens = (
              prompt: string,
              questions: Question[]
            ): { prompt: number; candidates: number; total: number } => {
              const promptChars = prompt.length;
              const questionsText = questions
                .map(
                  (q) => q.question + q.options.join("") + (q.explanation || "")
                )
                .join("");

              const promptTokens = Math.ceil(promptChars / 4);
              const responseTokens = Math.ceil(questionsText.length / 4);
              const totalTokens = promptTokens + responseTokens;

              return {
                prompt: promptTokens,
                candidates: responseTokens,
                total: totalTokens,
              };
            };

            const approximateUsage = calculateApproximateTokens(
              data.quiz.description || data.quiz.title || "",
              data.quiz.questions
            );
            setTokenUsage(approximateUsage);
          }

          setGenerationStatus(null); // ✅ Hide progress UI
          setGenerationProgress("");
          setLoading(false); // ✅ Return to form state

          // Clear localStorage (both generation state and legacy id)
          localStorage.removeItem("currentQuizGeneration");
          localStorage.removeItem("currentQuizId");

          // Stop polling
          clearInterval(interval);
          setPollInterval(null);

          // Show toast immediately on current page
          toast({
            title: "Tạo câu hỏi thành công!",
            description: `Đã tạo "${data.quiz.title}" với ${data.quiz.questions.length} câu hỏi`,
            variant: "success",
            duration: 3000, // ⏰ Disappear after 3 seconds
          });

          // Broadcast to other pages for cross-page notifications
          const channel = new BroadcastChannel("quiz-notifications");
          channel.postMessage({
            type: "quiz-complete",
            title: "Tạo câu hỏi thành công!",
            description: `Đã tạo "${data.quiz.title}" với ${data.quiz.questions.length} câu hỏi`,
            variant: "success",
          });
          channel.close();
        } else if (status === "failed") {
          setGenerationStatus(null); // ✅ Hide progress UI on failure too
          setGenerationProgress("");
          setLoading(false); // ✅ Return to form state

          // Stop polling
          clearInterval(interval);
          setPollInterval(null);

          // Clear localStorage (both generation state and legacy id)
          localStorage.removeItem("currentQuizGeneration");
          localStorage.removeItem("currentQuizId");

          toast({
            title: "Tạo câu hỏi thất bại",
            description: data.error || "Có lỗi xảy ra khi tạo quiz",
            variant: "destructive",
          });

          // Broadcast to other pages for cross-page notifications
          const channel = new BroadcastChannel("quiz-notifications");
          channel.postMessage({
            type: "quiz-failed",
            title: "Tạo câu hỏi thất bại",
            description: data.error || "Có lỗi xảy ra khi tạo quiz",
            variant: "destructive",
          });
          channel.close();
        } else if (status === "expired") {
          setGenerationStatus(null); // ✅ Hide progress UI on expired
          setGenerationProgress("");
          setLoading(false); // ✅ Return to form state

          // Stop polling
          clearInterval(interval);
          setPollInterval(null);

          // Clear localStorage (both generation state and legacy id)
          localStorage.removeItem("currentQuizGeneration");
          localStorage.removeItem("currentQuizId");

          toast({
            title: "Quiz đã hết hạn",
            description: "Quiz này đã hết hạn. Vui lòng tạo quiz mới",
            variant: "warning",
          });

          // Broadcast to other pages for cross-page notifications
          const channel = new BroadcastChannel("quiz-notifications");
          channel.postMessage({
            type: "quiz-failed", // Also use quiz-failed type for expired
            title: "Quiz đã hết hạn",
            description: "Quiz này đã hết hạn. Vui lòng tạo quiz mới",
            variant: "warning",
          });
          channel.close();
        } else {
          // Still processing, update progress
          setGenerationStatus(status);
          setGenerationProgress(progress || "Đang xử lý...");

          // Persist progress so when navigating away/back we resume at the same step
          persistGenerationState({
            quizId: quizIdToPoll,
            loading: true,
            generationStatus: status,
            generationProgress: progress || "Đang xử lý...",
          });
        }
      } catch (error) {
        console.error("❌ [FRONTEND] Polling error:", error);
        // Keep polling on error - maybe network issue
      }
    }, 2000); // Poll every 2 seconds

    setPollInterval(interval);
  };

  // Enhanced progress step mapping for nicer loading UI
  const progressSteps = [
    {
      key: "init",
      label: "Khởi tạo",
      match: ["starting generation", "đang chuẩn bị"],
    },
    { key: "auth", label: "Xác thực", match: ["authenticating"] },
    {
      key: "limit",
      label: "Giới hạn",
      match: ["checking rate limits", "rate limit"],
    },
    { key: "generate", label: "Sinh AI", match: ["generating with ai"] },
    { key: "done", label: "Hoàn tất", match: ["completed"] },
  ] as const;

  const getActiveStep = (progressText: string | undefined): number => {
    if (!progressText) return 0;
    const p = progressText.toLowerCase();
    for (let i = progressSteps.length - 1; i >= 0; i--) {
      if (progressSteps[i].match.some((m) => p.includes(m))) return i;
    }
    return 0;
  };

  const generateQuiz = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Vui lòng nhập chủ đề",
        description: "Mô tả chủ đề câu hỏi trắc nghiệm bạn muốn tạo",
        variant: "warning",
      });
      return;
    }

    if (!isQuestionCountSelected) {
      toast({
        title: "Vui lòng chọn số lượng câu hỏi",
        description: "Hãy chọn số lượng câu hỏi bạn muốn tạo",
        variant: "warning",
      });
      return;
    }

    // Check anonymous limits early
    if (!user) {
      const anonymousCount = getAnonymousQuizCount();
      if (anonymousCount >= 3) {
        setShowQuotaDialog(true);
        return;
      }

      toast({
        title: `Quiz mẫu ${anonymousCount + 1}/3`,
        description: "Bạn đang tạo quiz với tư cách không đăng nhập",
        duration: 1500,
        variant: "info",
      });
    }

    console.log("🚀 [FRONTEND] Starting async quiz generation...");

    // Prepare device info for fingerprinting
    const deviceInfo = {
      language: navigator.language,
      platform:
        "platform" in navigator
          ? (navigator as Navigator & { platform?: string }).platform ?? ""
          : "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      userAgent: navigator.userAgent,
      screen: {
        width: window.screen?.width,
        height: window.screen?.height,
        colorDepth: window.screen?.colorDepth,
      },
    };

    // Step 1: Call /start-quiz endpoint
    try {
      setLoading(true);

      const startQuizPayload = {
        prompt,
        device: deviceInfo,
        questionCount: parseInt(questionCount),
        apiKey: userApiKey || undefined,
      };

      console.log("▶️ Starting quiz generation request...");
      const { data: startResponse, error: startError } =
        await supabase.functions.invoke("generate-quiz/start-quiz", {
          body: startQuizPayload,
        });

      if (startError) {
        console.error("❌ Start quiz error:", startError);
        throw new Error(
          startError.message || "Failed to start quiz generation"
        );
      }

      if (!startResponse?.id) {
        console.error("❌ Invalid start response:", startResponse);
        throw new Error("Invalid response from start-quiz endpoint");
      }

      const quizId = startResponse.id;
      console.log(`✅ Quiz started with ID: ${quizId}`);

      // Step 2: Save generation state to localStorage for navigation persistence
      const generationState = {
        quizId,
        loading: true,
        generationStatus: "pending" as string | null,
        generationProgress: "Đang chuẩn bị..." as string,
        timestamp: Date.now(),
      };
      localStorage.setItem(
        "currentQuizGeneration",
        JSON.stringify(generationState)
      );
      localStorage.setItem("currentQuizId", quizId);

      // Step 3: Start polling for status
      startPolling(quizId);

      // Step 4: Increment anonymous counter (for UI feedback)
      if (!user) {
        incrementAnonymousQuizCount();
      }
    } catch (error) {
      console.error("❌ Error starting quiz:", error);

      setLoading(false);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Check for quota exceeded
      if (
        errorMessage.includes("anonymous_quota_exceeded") ||
        errorMessage.includes("quota")
      ) {
        setShowQuotaDialog(true);
        return;
      }

      // Check for auth errors
      if (
        errorMessage.includes("authentication_required") ||
        errorMessage.includes("invalid") ||
        errorMessage.includes("unauthorized")
      ) {
        setApiKeyError(errorMessage);
        setShowApiKeyErrorDialog(true);
        return;
      }

      // Generic error
      toast({
        title: "Tạo câu hỏi thất bại",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const gradeQuiz = () => {
    try {
      // Handle edge case 1: No quiz data
      if (!quiz) {
        toast({
          title: "Không có bài kiểm tra",
          description: "Vui lòng tạo quiz trước khi chấm điểm",
          variant: "destructive",
        });
        return;
      }

      // Handle edge case 2: Invalid quiz structure
      if (!quiz.questions || !Array.isArray(quiz.questions)) {
        toast({
          title: "Dữ liệu quiz không hợp lệ",
          description: "Quiz này không có cấu trúc đúng. Vui lòng tạo quiz mới",
          variant: "destructive",
        });
        return;
      }

      // Handle edge case 3: No questions in quiz
      if (quiz.questions.length === 0) {
        toast({
          title: "Quiz trống",
          description: "Quiz không có câu hỏi nào. Không thể chấm điểm",
          variant: "destructive",
        });
        return;
      }

      // Handle edge case 4: Not all questions answered
      const answeredCount = userAnswers.filter(
        (answer) => answer !== undefined
      ).length;
      if (answeredCount !== quiz.questions.length) {
        toast({
          title: "Chưa hoàn thành bài kiểm tra",
          description: `Bạn đã trả lời ${answeredCount}/${quiz.questions.length} câu hỏi. Vui lòng hoàn thành tất cả`,
          variant: "destructive",
        });
        return;
      }

      // Handle edge case 5: All answers are undefined (shouldn't happen after above check)
      if (answeredCount === 0) {
        toast({
          title: "Chưa trả lời câu hỏi nào",
          description:
            "Vui lòng trả lời ít nhất một câu hỏi trước khi chấm điểm",
          variant: "destructive",
        });
        return;
      }

      // All checks passed, show results
      setShowResults(true);
    } catch (error) {
      console.error("Error grading quiz:", error);
      toast({
        title: "Lỗi chấm điểm",
        description: "Có lỗi xảy ra khi chấm điểm. Vui lòng thử lại",
        variant: "destructive",
      });
    }
  };

  const resetQuiz = () => {
    setUserAnswers([]);
    setShowResults(false);
  };

  const cancelQuizGeneration = () => {
    // Abort the ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      console.log("🛑 [USER] Quiz generation cancelled by user");
    }

    // Stop polling
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }

    // Reset all loading states
    setLoading(false);
    setGenerationStatus(null);
    setGenerationProgress("");
    setQuizId(null);

    // Clear localStorage
    localStorage.removeItem("currentQuizGeneration");
    localStorage.removeItem("currentQuizId");

    // Show cancellation toast
    toast({
      title: "Đã hủy tạo quiz",
      description: "Bạn có thể tạo quiz mới bất cứ lúc nào",
      variant: "info",
    });

    // Reset abort controller for next generation
    abortControllerRef.current = new AbortController();
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    let correct = 0;
    userAnswers.forEach((answer, index) => {
      if (answer === quiz.questions[index].correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  /**
   * PDF font helpers to fix Vietnamese diacritics rendering in jsPDF.
   * We embed a Unicode-capable TTF (Roboto/NotoSans) at runtime from a public CDN,
   * then use it for all PDF text output.
   */
  const arrayBufferToBinaryString = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    return binary;
  };

  const ensurePdfVnFont = async (doc: jsPDF) => {
    // Cache dữ liệu font trong window, nhưng luôn add vào VFS của tài liệu hiện tại
    const w = window as unknown as {
      __pdfVnFontDataReg?: string;
      __pdfVnFontDataBold?: string;
    };

    // Tải Regular nếu chưa có
    if (!w.__pdfVnFontDataReg) {
      const regCandidates = [
        "https://cdn.jsdelivr.net/gh/googlefonts/roboto@v20.0.0/src/hinted/Roboto-Regular.ttf",
        "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/roboto/Roboto-Regular.ttf",
        "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts/hinted/ttf/NotoSans/NotoSans-Regular.ttf",
      ];
      for (const url of regCandidates) {
        try {
          const res = await fetch(url, { mode: "cors" });
          if (!res.ok) continue;
          const buf = await res.arrayBuffer();
          w.__pdfVnFontDataReg = arrayBufferToBinaryString(buf);
          break;
        } catch {
          // thử candidate tiếp theo
        }
      }
    }

    // Tải Bold nếu chưa có
    if (!w.__pdfVnFontDataBold) {
      const boldCandidates = [
        "https://cdn.jsdelivr.net/gh/googlefonts/roboto@v20.0.0/src/hinted/Roboto-Bold.ttf",
        "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/roboto/Roboto-Bold.ttf",
        "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts/hinted/ttf/NotoSans/NotoSans-Bold.ttf",
      ];
      for (const url of boldCandidates) {
        try {
          const res = await fetch(url, { mode: "cors" });
          if (!res.ok) continue;
          const buf = await res.arrayBuffer();
          w.__pdfVnFontDataBold = arrayBufferToBinaryString(buf);
          break;
        } catch {
          // thử candidate tiếp theo
        }
      }
    }

    if (w.__pdfVnFontDataReg) {
      // Luôn add vào VFS của jsPDF hiện tại
      doc.addFileToVFS("Roboto-Regular.ttf", w.__pdfVnFontDataReg);
      doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
      if (w.__pdfVnFontDataBold) {
        doc.addFileToVFS("Roboto-Bold.ttf", w.__pdfVnFontDataBold);
        doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
      }
      return true;
    }

    console.warn(
      "Không thể tải font hỗ trợ tiếng Việt cho jsPDF; sẽ dùng font mặc định (có thể lỗi dấu)."
    );
    return false;
  };

  const downloadQuiz = async () => {
    if (!quiz) return;

    try {
      toast({
        title: "Đang tạo PDF...",
        description: "Vui lòng chờ trong giây lát",
        variant: "info",
        duration: 1500,
      });

      const title = quiz.title || "quiz";
      const filename = `${title.replace(/\s+/g, "-").toLowerCase()}.pdf`;

      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const vnFontReady = await ensurePdfVnFont(doc);
      const FONT_FAMILY = vnFontReady ? "Roboto" : "helvetica";
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginX = 15;
      const marginTop = 15;
      const marginBottom = 15;
      const contentWidth = pageWidth - marginX * 2;

      let y = marginTop;

      const addPageIfNeeded = (increment: number) => {
        if (y + increment > pageHeight - marginBottom) {
          doc.addPage();
          y = marginTop;
        }
      };

      const addBlock = (
        text: string,
        fontSize = 11,
        fontStyle: "normal" | "bold" = "normal",
        gapAfter = 3
      ) => {
        doc.setFont(FONT_FAMILY, fontStyle);
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, contentWidth);
        const lineHeight = fontSize * 0.55;
        lines.forEach((line: string) => {
          addPageIfNeeded(lineHeight);
          doc.text(line, marginX, y);
          y += lineHeight;
        });
        y += gapAfter;
      };

      // Header
      addBlock(title, 16, "bold", 2);
      addBlock(
        `Tải xuống: ${new Date().toLocaleString("vi-VN")}`,
        10,
        "normal",
        4
      );

      // Divider
      addPageIfNeeded(2);
      doc.setDrawColor(200);
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 4;

      // Score (if available)
      if (showResults) {
        const score = `${calculateScore()}/${
          quiz.questions.length
        } (${Math.round((calculateScore() / quiz.questions.length) * 100)}%)`;
        addBlock(`Kết quả: ${score}`, 12, "bold", 4);
      }

      // Questions
      (quiz.questions || []).forEach((q: Question, idx: number) => {
        if (!q) return;

        // Question line
        addBlock(`${idx + 1}. ${q.question}`, 11, "bold", 2);

        // Options
        (q.options || []).forEach((opt: string, i: number) => {
          const isCorrect = showResults ? i === q.correctAnswer : false;
          const userSelected = showResults ? userAnswers[idx] === i : false;
          const prefix = String.fromCharCode(65 + i) + ". ";
          let suffix = "";
          if (showResults) {
            if (isCorrect) suffix = "  ✓";
            else if (userSelected && !isCorrect) suffix = "  ✗";
          }
          addBlock(`${prefix}${opt}${suffix}`, 11, "normal", 1);
        });

        // Explanation
        if (showResults && q.explanation) {
          addBlock(`Giải thích: ${q.explanation}`, 10, "normal", 4);
        } else {
          y += 2;
        }
      });

      // Trigger browser download immediately
      doc.save(filename);

      toast({
        title: "Tải xuống thành công",
        description: `Đã lưu tệp ${filename}`,
        variant: "success",
        duration: 2500,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể tạo hoặc tải xuống PDF.";
      toast({
        title: "Tải xuống thất bại",
        description: message,
        variant: "destructive",
      });
      console.error("PDF download error:", error);
    }
  };

  return (
    <>
      <section
        id="generator"
        className="relative overflow-hidden bg-gradient-to-b from-secondary/30 to-background min-h-screen py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Background scroll velocity effect - within section container */}
          <div className="absolute inset-0 -z-10 opacity-5">
            <ScrollVelocityContainer className="text-6xl md:text-8xl font-bold">
              <ScrollVelocityRow baseVelocity={40} rowIndex={0}>
                AI Education Smart Learning Intelligent Teaching Digital
                Classroom
              </ScrollVelocityRow>
              <ScrollVelocityRow baseVelocity={40} rowIndex={1}>
                Adaptive Assessment Personalized Learning Virtual Teacher
                Cognitive Training
              </ScrollVelocityRow>
              <ScrollVelocityRow baseVelocity={40} rowIndex={2}>
                Educational Analytics Student Engagement Knowledge Discovery
                Learning Analytics
              </ScrollVelocityRow>
              <ScrollVelocityRow baseVelocity={40} rowIndex={3}>
                Artificial Intelligence Machine Learning Neural Networks
                Cognitive Computing
              </ScrollVelocityRow>
              <ScrollVelocityRow baseVelocity={40} rowIndex={4}>
                Interactive Assessment Educational Technology Intelligent
                Tutoring Automated Grading
              </ScrollVelocityRow>
              <ScrollVelocityRow baseVelocity={40} rowIndex={5}>
                AI Education Smart Learning Intelligent Teaching Digital
                Classroom
              </ScrollVelocityRow>
              <ScrollVelocityRow baseVelocity={40} rowIndex={6}>
                Adaptive Assessment Personalized Learning Virtual Teacher
                Cognitive Training
              </ScrollVelocityRow>
              <ScrollVelocityRow baseVelocity={40} rowIndex={7}>
                Educational Analytics Student Engagement Knowledge Discovery
                Learning Analytics
              </ScrollVelocityRow>
              <ScrollVelocityRow baseVelocity={40} rowIndex={8}>
                Artificial Intelligence Machine Learning Neural Networks
                Cognitive Computing
              </ScrollVelocityRow>
              <ScrollVelocityRow baseVelocity={40} rowIndex={9}>
                Interactive Assessment Educational Technology Intelligent
                Tutoring Automated Grading
              </ScrollVelocityRow>
            </ScrollVelocityContainer>
          </div>
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <Sparkles className="w-16 h-16 text-[#B5CC89]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Generate Your Quiz
            </h2>
            <p className="text-lg text-muted-foreground">
              Describe your quiz topic and let AI create engaging questions
            </p>
          </div>

          {/* Quota Limit Dialog */}
          <Dialog open={showQuotaDialog} onOpenChange={setShowQuotaDialog}>
            <DialogContent className="max-w-md bg-gradient-to-br from-card to-secondary/20 border-2 border-border">
              <DialogHeader className="pb-3">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="bg-[#B5CC89] p-1 rounded-md">
                    <Shield className="w-4 h-4 text-black" />
                  </div>
                  <DialogTitle className="text-lg font-bold text-primary">
                    Bạn đã hết lượt miễn phí
                  </DialogTitle>
                </div>
                <DialogDescription className="text-center text-[12px] text-muted-foreground leading-tight">
                  Bạn đã sử dụng 3/3 lượt tạo quiz miễn phí hôm nay.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-3 space-y-3">
                <div className="p-3 bg-[#B5CC89]/10 border border-[#B5CC89]/20 rounded-lg">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#B5CC89]" />
                    <p className="text-xs font-medium text-foreground">
                      Đăng nhập để tiếp tục tạo quiz không giới hạn
                    </p>
                  </div>
                  <ul className="text-[11px] text-muted-foreground leading-tight list-disc list-inside space-y-1">
                    <li>Lưu quiz vào thư viện cá nhân</li>
                    <li>Tải xuống PDF và chia sẻ</li>
                    <li>Quản lý API key cá nhân để tránh rate limit</li>
                  </ul>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {(() => {
                      const t = getTimeUntilReset();
                      return t
                        ? `Lượt miễn phí sẽ reset sau ${t.hours} giờ ${t.minutes} phút`
                        : "Lượt miễn phí sẽ bắt đầu tính từ thời điểm bạn tạo quiz đầu tiên trong ngày";
                    })()}
                  </span>
                </div>
              </div>

              <DialogFooter className="gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQuotaDialog(false)}
                  className="flex-1 h-8 text-xs border-2 hover:bg-primary hover:text-primary-foreground hover:border-foreground">
                  Đóng
                </Button>
                <Button
                  variant="hero"
                  size="sm"
                  onClick={() => {
                    setShowQuotaDialog(false);
                    window.dispatchEvent(new Event("open-auth-modal"));
                  }}
                  className="flex-1 h-8 text-xs group hover:bg-black hover:text-white transition-colors">
                  <LogIn className="mr-1.5 h-3.5 w-3.5" />
                  Đăng nhập
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* API Key Error Dialog */}
          <Dialog
            open={showApiKeyErrorDialog}
            onOpenChange={setShowApiKeyErrorDialog}>
            <DialogContent className="max-w-lg bg-gradient-to-br from-card to-secondary/20 border-2 border-border">
              <DialogHeader className="pb-3">
                <div className="flex items-center justify-center mb-3">
                  <div className="bg-[#B5CC89] p-2 rounded-full">
                    <Shield className="w-6 h-6 text-black" />
                  </div>
                </div>
                <DialogTitle className="text-center text-lg font-bold">
                  Lỗi xác thực API Key
                </DialogTitle>
                <DialogDescription className="text-center text-sm text-muted-foreground">
                  Không thể kết nối tới dịch vụ AI. Vui lòng kiểm tra và cập
                  nhật API Key của bạn.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Error details */}
                <div className="bg-[#B5CC89]/10 border border-[#B5CC89]/30 rounded-lg p-4">
                  <div className="text-sm font-medium text-foreground mb-2">
                    Lỗi: {apiKeyError}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>• API Key không hợp lệ hoặc đã hết hạn</div>
                    <div>• API Key không có quyền truy cập Gemini AI</div>
                    <div>• Đã đạt giới hạn sử dụng API</div>
                    <div>• Lỗi kết nối mạng</div>
                  </div>
                </div>

                {/* Solution steps */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-3 text-sm">
                    Cách khắc phục:
                  </h4>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        1
                      </span>
                      <span>Đăng nhập để sử dụng API key cá nhân</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        2
                      </span>
                      <span>Truy cập API Settings trong Navbar</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        3
                      </span>
                      <div>
                        Lấy API key mới từ{" "}
                        <a
                          href="https://makersuite.google.com/app/apikey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-medium">
                          Google AI Studio
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        4
                      </span>
                      <span>Kích hoạt quyền truy cập Gemini AI</span>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 flex pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKeyErrorDialog(false)}
                  className="flex-1 text-sm">
                  Thử lại sau
                </Button>
                <Button
                  variant="hero"
                  size="sm"
                  onClick={() => {
                    setShowApiKeyErrorDialog(false);
                    window.dispatchEvent(new Event("login-and-settings"));
                  }}
                  className="flex-1 text-sm text-white hover:bg-black hover:text-white">
                  <Shield className="mr-1 h-3 w-3" />
                  Cập nhật API Key
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Card className="mb-8 border-2 hover:border-primary transition-colors duration-300 hover:shadow-lg">
            <CardContent className="p-4 md:p-8 space-y-6">
              {/* Show Form OR Loading Progress */}
              {loading ? (
                /* Loading/Progress State */
                <div className="space-y-6 py-4 md:py-8">
                  <div className="flex justify-center">
                    <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-[#B5CC89] animate-spin" />
                  </div>

                  <div className="space-y-1 text-center px-4">
                    <h3 className="text-lg md:text-xl font-semibold">
                      {generationStatus === "failed"
                        ? "❌ Không thể tạo quiz"
                        : generationStatus === "expired"
                        ? "⏰ Quiz đã hết hạn"
                        : "Đang tạo câu hỏi AI..."}
                    </h3>
                    <p
                      className="text-sm md:text-base text-muted-foreground"
                      role="status"
                      aria-live="polite">
                      {generationProgress || "Đang xử lý..."}
                    </p>
                  </div>

                  {/* Stepper */}
                  <div className="max-w-xl mx-auto px-4">
                    <div className="grid grid-cols-5 gap-1 md:gap-2">
                      {progressSteps.map((s, i) => {
                        const active = getActiveStep(generationProgress) >= i;
                        return (
                          <div
                            key={s.key}
                            className="flex flex-col items-center">
                            <div
                              className={`h-2 w-full rounded-full ${
                                active
                                  ? "bg-[#B5CC89] animate-pulse"
                                  : "bg-secondary"
                              }`}
                            />
                            <span
                              className={`mt-1 md:mt-2 text-[10px] md:text-[11px] text-center ${
                                active
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}>
                              {s.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="max-w-md mx-auto px-4">
                    <Progress
                      value={Math.min(
                        Math.max(
                          Math.round(
                            ((getActiveStep(generationProgress) + 1) /
                              progressSteps.length) *
                              100
                          ),
                          10
                        ),
                        95
                      )}
                      aria-label="Tiến độ tạo quiz"
                      className="h-2"
                    />
                  </div>

                  <p className="text-xs md:text-sm text-center text-muted-foreground px-4">
                    Bạn có thể tiếp tục thao tác khác; tiến trình chạy nền và sẽ
                    hiển thị khi hoàn tất.
                  </p>

                  {/* Cancel button */}
                  <div className="flex justify-center px-4">
                    <Button
                      onClick={cancelQuizGeneration}
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto hover:bg-primary hover:text-primary-foreground hover:border-foreground transition-colors">
                      <XCircle className="mr-2 h-4 w-4" />
                      Hủy tạo quiz
                    </Button>
                  </div>
                </div>
              ) : (
                /* Form Input State */
                <>
                  {/* Quota indicator for anonymous users */}
                  {!user && (
                    <div className="flex items-center justify-between p-3 bg-[#B5CC89]/10 border border-[#B5CC89]/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-[#B5CC89]" />
                        <span className="text-sm font-medium">
                          Lượt tạo miễn phí: {getAnonymousQuizCount()}/3
                        </span>
                      </div>
                      {getAnonymousQuizCount() > 0 && (
                        <button
                          onClick={() => {
                            window.dispatchEvent(new Event("open-auth-modal"));
                          }}
                          className="text-xs text-primary hover:underline font-medium">
                          Đăng nhập để không giới hạn
                        </button>
                      )}
                    </div>
                  )}

                  {/* Topic Input Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="quiz-topic"
                        className="text-sm font-semibold text-foreground">
                        Chủ đề bài kiểm tra
                      </label>
                      <Badge variant="secondary" className="text-xs">
                        Bắt buộc
                      </Badge>
                    </div>
                    <Textarea
                      id="quiz-topic"
                      placeholder="Ví dụ: Tạo bộ câu hỏi trắc nghiệm về lịch sử Thế chiến thứ 2 cho học sinh THPT. Bao gồm các câu hỏi về các trận đánh lớn, nhân vật chủ chốt và ảnh hưởng của chiến tranh đến xã hội."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className={`min-h-[120px] md:min-h-[140px] resize-none transition-all ${
                        promptError
                          ? "border-red-500 focus-visible:ring-red-500"
                          : isPromptValid
                          ? "border-green-500 focus-visible:ring-green-500"
                          : ""
                      }`}
                    />
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {promptError && (
                          <span className="text-red-600 flex items-center gap-1 text-xs md:text-sm">
                            <svg
                              className="w-4 h-4 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="truncate">{promptError}</span>
                          </span>
                        )}
                        {isPromptValid && !promptError && (
                          <span className="text-green-600 flex items-center gap-1 text-xs md:text-sm">
                            <svg
                              className="w-4 h-4 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Đủ điều kiện
                          </span>
                        )}
                      </div>
                      <span className="text-muted-foreground text-xs ml-2 flex-shrink-0">
                        {prompt.trim().length}/500
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Tùy chọn
                      </span>
                    </div>
                  </div>

                  {/* Question Count Selection */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="question-count"
                        className="text-sm font-semibold text-foreground">
                        Số lượng câu hỏi
                      </label>
                      <Badge variant="secondary" className="text-xs">
                        Bắt buộc
                      </Badge>
                    </div>
                    <Select
                      value={questionCount}
                      onValueChange={(value) => {
                        setQuestionCount(value);
                        setIsQuestionCountSelected(true);
                      }}>
                      <SelectTrigger
                        id="question-count"
                        className="w-full md:w-48 hover:bg-primary/5 hover:border-primary transition-colors">
                        <SelectValue placeholder="Chọn số câu hỏi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 câu hỏi</SelectItem>
                        <SelectItem value="15">15 câu hỏi</SelectItem>
                        <SelectItem value="20">20 câu hỏi</SelectItem>
                        <SelectItem value="25">25 câu hỏi</SelectItem>
                        <SelectItem value="30">30 câu hỏi</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Thời gian tạo khoảng{" "}
                      {questionCount
                        ? Math.ceil(parseInt(questionCount) / 10)
                        : 2}
                      -
                      {questionCount
                        ? Math.ceil(parseInt(questionCount) / 5)
                        : 4}{" "}
                      phút
                    </p>
                  </div>

                  {/* Generate Button */}
                  <div className="pt-2">
                    <Button
                      onClick={generateQuiz}
                      disabled={
                        loading || !isPromptValid || !isQuestionCountSelected
                      }
                      variant={
                        isPromptValid && isQuestionCountSelected
                          ? "hero"
                          : "secondary"
                      }
                      size="lg"
                      className={`group text-base flex items-center justify-center gap-2 w-full transition-all ${
                        isPromptValid && isQuestionCountSelected
                          ? "hover:bg-black hover:text-white"
                          : "opacity-50 cursor-not-allowed"
                      }`}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {loadingMessage}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          {isPromptValid && isQuestionCountSelected
                            ? "Tạo Quiz Ngay"
                            : "Vui lòng điền đầy đủ thông tin"}
                          {isPromptValid && isQuestionCountSelected && (
                            <div className="bg-[#B5CC89] p-1 rounded-lg ml-1">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4 text-black group-hover:text-white transition-colors"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                                />
                              </svg>
                            </div>
                          )}
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {quiz && (
        <section
          id="quiz"
          className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/20 py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            {/* Quiz Section Header */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <Sparkles className="w-12 h-12 text-[#B5CC89]" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">{quiz.title}</h2>
              <p className="text-lg text-muted-foreground">
                {quiz.description ||
                  "Answer the questions below and review explanations after grading"}
              </p>
            </div>
            <Card className="border-2 rounded-xl shadow-lg bg-card">
              <CardHeader className="pb-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="secondary">Test</Badge>
                      <Badge className="text-xs">
                        {quiz.questions.length} Questions
                        {tokenUsage && (
                          <span className="ml-1 opacity-75">
                            ({tokenUsage.total} tokens)
                          </span>
                        )}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl md:text-3xl">
                      {quiz.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {quiz.description}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={downloadQuiz}
                    variant="outline"
                    size="sm"
                    className="w-full lg:w-auto self-start">
                    <Download className="mr-2 h-4 w-4" />
                    <span className="hidden xs:inline">Download PDF</span>
                    <span className="xs:hidden">PDF</span>
                  </Button>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
                    <span>Progress</span>
                    <span>
                      {
                        quiz.questions.filter(
                          (_, i) => userAnswers[i] !== undefined
                        ).length
                      }
                      /{quiz.questions.length}
                    </span>
                  </div>
                  <Progress
                    value={Math.round(
                      (quiz.questions.filter(
                        (_, i) => userAnswers[i] !== undefined
                      ).length /
                        quiz.questions.length) *
                        100
                    )}
                  />
                  {showResults && (
                    <div className="mt-4 p-4 bg-[#B5CC89]/10 rounded-lg">
                      <h4 className="text-lg font-semibold">
                        Your Score: {calculateScore()}/{quiz.questions.length} (
                        {Math.round(
                          (calculateScore() / quiz.questions.length) * 100
                        )}
                        %)
                      </h4>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {quiz.questions.map((q, idx) => {
                  try {
                    if (!q || typeof q.question !== "string") {
                      return (
                        <div key={idx} className="text-red-500">
                          Question {idx} is malformed
                        </div>
                      );
                    }

                    return (
                      <Card
                        key={idx}
                        className="border-2 hover:border-[#B5CC89] transition-colors duration-300 hover:shadow-lg">
                        <CardContent className="p-8 space-y-4">
                          <div className="space-y-3">
                            {q.question && (
                              <h3 className="text-lg font-semibold text-foreground">
                                {idx + 1}. {q.question}
                              </h3>
                            )}
                            <div className="space-y-2">
                              {q.options && Array.isArray(q.options) ? (
                                q.options.map((option, optIdx) => {
                                  const isSelected =
                                    userAnswers[idx] === optIdx;
                                  const isCorrect = optIdx === q.correctAnswer;
                                  const userSelectedWrong =
                                    showResults && isSelected && !isCorrect;
                                  const userSelectedCorrect =
                                    showResults && isSelected && isCorrect;

                                  return (
                                    <label
                                      key={optIdx}
                                      className={`flex items-center p-3 rounded-lg border cursor-pointer ${
                                        showResults && isCorrect
                                          ? "bg-green-50 border-green-500"
                                          : userSelectedWrong
                                          ? "bg-red-50 border-red-500"
                                          : userSelectedCorrect
                                          ? "bg-green-50 border-green-500"
                                          : "bg-muted/50 border-gray-200 hover:bg-muted/80"
                                      }`}>
                                      <input
                                        type="radio"
                                        name={`question-${idx}`}
                                        value={optIdx}
                                        checked={isSelected}
                                        onChange={() =>
                                          handleAnswerSelect(idx, optIdx)
                                        }
                                        disabled={showResults}
                                        className="mr-3"
                                      />
                                      <span className="font-medium mr-2">
                                        {String.fromCharCode(65 + optIdx)}.
                                      </span>
                                      <span className="flex-1">{option}</span>
                                      {showResults && isCorrect && (
                                        <span className="ml-2 text-green-600 font-semibold">
                                          ✓ Correct Answer
                                        </span>
                                      )}
                                      {userSelectedWrong && (
                                        <span className="ml-2 text-red-600 font-semibold">
                                          ✗ Your Answer
                                        </span>
                                      )}
                                      {userSelectedCorrect && (
                                        <span className="ml-2 text-green-600 font-semibold">
                                          ✓ Your Answer
                                        </span>
                                      )}
                                    </label>
                                  );
                                })
                              ) : (
                                <div className="text-red-500">
                                  No options available for question {idx}
                                </div>
                              )}
                            </div>
                            {showResults && q.explanation && (
                              <div className="pt-2 border-t">
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-semibold">
                                    Explanation:
                                  </span>{" "}
                                  {q.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  } catch (error) {
                    console.error(`Error rendering question ${idx}:`, error);
                    return (
                      <div
                        key={idx}
                        className="text-red-500 border border-red-300 p-4 rounded">
                        Error rendering question {idx}:{" "}
                        {error instanceof Error
                          ? error.message
                          : "Unknown error"}
                      </div>
                    );
                  }
                })}
              </CardContent>

              <CardFooter className="flex justify-center gap-4 pt-2">
                {!showResults ? (
                  <Button
                    onClick={gradeQuiz}
                    disabled={
                      userAnswers.filter((ans) => ans !== undefined).length !==
                      quiz.questions.length
                    }
                    variant="outline"
                    size="lg"
                    className="text-base w-full sm:w-auto hover:bg-primary hover:text-primary-foreground hover:border-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {userAnswers.filter((ans) => ans !== undefined).length !==
                    quiz.questions.length
                      ? `Vui lòng trả lời hết tất cả ${
                          quiz.questions.length
                        } câu hỏi (${
                          userAnswers.filter((ans) => ans !== undefined).length
                        }/${quiz.questions.length} đã trả lời)`
                      : "Grade Quiz"}
                  </Button>
                ) : (
                  <Button onClick={resetQuiz} variant="outline" size="lg">
                    Retake Quiz
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </section>
      )}
    </>
  );
};

export default QuizGenerator;
