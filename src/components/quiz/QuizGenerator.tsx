import * as React from "react";
import { useState, useEffect, useCallback, type MouseEvent } from "react";
import { useLocation } from "react-router-dom";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
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
  Music4,
  PauseCircle,
} from "@/lib/icons";
import {
  ScrollVelocityContainer,
  ScrollVelocityRow,
} from "@/components/ScrollVelocity";
import { warmupPdfWorker, generateAndDownloadPdf } from "@/lib/pdfWorkerClient";
import { containsVietnameseBadwords } from "@/lib/vnBadwordsFilter";
import type { Quiz, Question } from "@/types/quiz";
import { GenerationProgress } from "@/components/quiz/GenerationProgress";
import { QuotaLimitDialog } from "@/components/quiz/QuotaLimitDialog";
import { ApiKeyErrorDialog } from "@/components/quiz/ApiKeyErrorDialog";
import { QuizContent } from "@/components/quiz/QuizContent";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import useQuizGeneration from "@/hooks/useQuizGeneration";
import { useGenerationPersistence } from "@/hooks/useGenerationPersistence";
import { useAnonQuota } from "@/hooks/useAnonQuota";
import useChillMusic from "@/hooks/useChillMusic";
import { useIsMobile } from "@/hooks/use-mobile";
import { killActiveScroll, scrollToTarget } from "@/lib/scroll";

type TokenUsage = { prompt: number; candidates: number; total: number };

type GenerationState = {
  quizId: string;
  loading: boolean;
  generationStatus: string | null;
  generationProgress: string;
  timestamp?: number;
};

const QuizGenerator = () => {
  const customIsProfane = (input: string) =>
    containsVietnameseBadwords(String(input || ""));
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
  const [showQuotaDialog, setShowQuotaDialog] = useState<boolean>(false);
  const [showApiKeyErrorDialog, setShowApiKeyErrorDialog] =
    useState<boolean>(false);
  const [apiKeyError, setApiKeyError] = useState<string>("");
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

  // Chill background music via hook
  const {
    isPlaying: isChillPlaying,
    toggle: toggleChill,
    pause: pauseChill,
  } = useChillMusic();

  // Async quiz polling state
  const [quizId, setQuizId] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<string>("");
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [userApiKey, setUserApiKey] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<string>("");
  const [isQuestionCountSelected, setIsQuestionCountSelected] =
    useState<boolean>(false);
  const location = useLocation();
  const cameFromLibraryRef = React.useRef<boolean>(
    !!(location.state as { scrollToQuiz?: boolean } | null)?.scrollToQuiz
  );
  const isMobile = useIsMobile();
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const isMountedRef = React.useRef<boolean>(true);
  const {
    status: genStatus,
    progress: genProgress,
    startPolling: startPollingHook,
    stopPolling,
    reset,
  } = useQuizGeneration<Quiz>();
  const {
    read: readPersist,
    write: writePersist,
    clear: clearPersist,
    setLegacyId,
    getLegacyId,
  } = useGenerationPersistence();
  const {
    count: anonCount,
    hasReachedLimit,
    increment: incrementAnon,
    getTimeUntilReset,
    DAILY_LIMIT,
  } = useAnonQuota();

  const loadUserApiKey = useCallback(async () => {
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
  }, [user]);

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

  // Smooth scroll helper with fallback to account for sticky navbar and SPA timing
  function scrollToWithFallback(sectionId: string) {
    try {
      killActiveScroll();
      const el = document.getElementById(sectionId);
      const targetArg: HTMLElement | string = el ?? sectionId;
      scrollToTarget(targetArg, { align: "top" });
    } catch (e) {
      console.debug("scrollToWithFallback failed", e);
    }
  }
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

        // Scroll to quiz section after it renders (skip when navigation already triggers auto-scroll)
        if (!cameFromLibraryRef.current) {
          requestAnimationFrame(() => {
            const element = document.getElementById("quiz");
            if (element) {
              killActiveScroll();
              scrollToTarget("quiz", { align: "top" });
            }
          });
        }

        // Clear history state so navigating back doesn't reopen the quiz unintentionally
        try {
          if (history && history.replaceState) {
            history.replaceState({}, document.title);
          }
        } catch (e) {
          console.debug("history.replaceState not available", e);
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
      // Skip internal auto-scroll if navigation already requested scrolling
      if (!cameFromLibraryRef.current) {
        requestAnimationFrame(() => {
          const element = document.getElementById("quiz");
          if (element) {
            killActiveScroll();
            scrollToTarget("quiz", { align: "top" });
          }
        });
      }
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

    if (customIsProfane(trimmed)) {
      setPromptError("Chủ đề không được chứa từ ngữ không phù hợp");
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

  // Load quiz generation state from persistence on mount (for navigation persistence)
  useEffect(() => {
    // First, check if there's ongoing generation state
    const generationState = readPersist();
    if (generationState && !loading && !quiz) {
      try {
        const {
          quizId,
          loading: storedLoading,
          generationStatus: storedStatus,
          generationProgress: storedProgress,
          timestamp,
        } = generationState as GenerationState;

        // Check if the generation state is recent (not older than 10 minutes)
        const stateAge = timestamp ? Date.now() - timestamp : 0;
        const maxAge = 10 * 60 * 1000; // 10 minutes

        if (stateAge > maxAge) {
          console.log("❌ Generation state is too old, clearing");
          clearPersist();
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

        // Resume polling via hook
        startPollingHook(quizId, {
          onCompleted: ({ quiz, tokenUsage }) => {
            setQuiz(quiz);
            if (tokenUsage) setTokenUsage(tokenUsage as TokenUsage);
            setGenerationStatus(null);
            setGenerationProgress("");
            setLoading(false);
            localStorage.removeItem("currentQuizGeneration");
            localStorage.removeItem("currentQuizId");
            toast({
              title: "Tạo câu hỏi thành công!",
              description: `Đã tạo "${quiz.title}" với ${quiz.questions.length} câu hỏi`,
              variant: "success",
              duration: 3000,
            });
            const channel = new BroadcastChannel("quiz-notifications");
            channel.postMessage({
              type: "quiz-complete",
              title: "Tạo câu hỏi thành công!",
              description: `Đã tạo "${quiz.title}" với ${quiz.questions.length} câu hỏi`,
              variant: "success",
            });
            channel.close();
          },
          onFailed: (errorMessage?: string) => {
            setGenerationStatus(null);
            setGenerationProgress("");
            setLoading(false);
            localStorage.removeItem("currentQuizGeneration");
            localStorage.removeItem("currentQuizId");
            const msg = errorMessage || "Có lỗi xảy ra khi tạo quiz";
            toast({
              title: "Tạo câu hỏi thất bại",
              description: msg,
              variant: "destructive",
            });
            try {
              const reasonText = String(errorMessage || "").toLowerCase();
              if (
                reasonText.includes("authentication") ||
                reasonText.includes("unauthorized") ||
                reasonText.includes("invalid") ||
                reasonText.includes("api key") ||
                reasonText.includes("forbidden") ||
                reasonText.includes("rate limit") ||
                reasonText.includes("quota")
              ) {
                setApiKeyError(errorMessage || msg);
                setShowApiKeyErrorDialog(true);
              }
            } catch (err) {
              console.debug("classify API key error (restore flow)", err);
            }
            const channel = new BroadcastChannel("quiz-notifications");
            channel.postMessage({
              type: "quiz-failed",
              title: "Tạo câu hỏi thất bại",
              description: msg,
              variant: "destructive",
            });
            channel.close();
          },
          onExpired: () => {
            setGenerationStatus(null);
            setGenerationProgress("");
            setLoading(false);
            localStorage.removeItem("currentQuizGeneration");
            localStorage.removeItem("currentQuizId");
            toast({
              title: "Quiz đã hết hạn",
              description: "Quiz này đã hết hạn. Vui lòng tạo quiz mới",
              variant: "warning",
            });
            const channel = new BroadcastChannel("quiz-notifications");
            channel.postMessage({
              type: "quiz-failed",
              title: "Quiz đã hết hạn",
              description: "Quiz này đã hết hạn. Vui lòng tạo quiz mới",
              variant: "warning",
            });
            channel.close();
          },
          onProgress: (status, progress) => {
            setGenerationStatus(status);
            setGenerationProgress(progress || "Đang xử lý...");
            persistGenerationState({
              quizId,
              loading: true,
              generationStatus: status,
              generationProgress: progress || "Đang xử lý...",
            });
          },
        });

        console.log("✅ Generation state restored, polling resumed");
        return; // Don't check regular saved quiz if we have active generation
      } catch (error) {
        console.error("❌ Error parsing generation state:", error);
        clearPersist();
      }
    }

    // Fallback: Check for saved quiz (for completed quizzes or resumed sessions)
    const savedQuizId = getLegacyId();
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
            clearPersist();
            return;
          }

          const status = data.status;
          console.log(`✅ Saved quiz status: ${status}`);

          if (status === "completed") {
            // Quiz already completed, load it directly
            setQuiz(data.quiz);
            clearPersist();
            toast({
              title: "Đã khôi phục quiz",
              description: "Đã tải lại quiz trước đó từ bộ nhớ tạm",
              variant: "info",
            });
          } else if (status === "failed") {
            // Quiz failed, clean up
            clearPersist();
            toast({
              title: "Quiz trước đó thất bại",
              description: "Bắt đầu tạo mới",
              variant: "warning",
            });
          } else if (status === "processing" || status === "pending") {
            // Still processing, resume generation state
            console.log("▶️ Resuming quiz generation from saved state...");
            setLoading(true);
            setGenerationStatus("processing");
            setGenerationProgress("Tiếp tục tạo quiz...");
            setQuizId(savedQuizId);
            startPollingHook(savedQuizId, {
              onCompleted: ({ quiz, tokenUsage }) => {
                setQuiz(quiz);
                if (tokenUsage) setTokenUsage(tokenUsage as TokenUsage);
                setGenerationStatus(null);
                setGenerationProgress("");
                setLoading(false);
                clearPersist();
                toast({
                  title: "Tạo câu hỏi thành công!",
                  description: `Đã tạo "${quiz.title}" với ${quiz.questions.length} câu hỏi`,
                  variant: "success",
                  duration: 3000,
                });
                const channel = new BroadcastChannel("quiz-notifications");
                channel.postMessage({
                  type: "quiz-complete",
                  title: "Tạo câu hỏi thành công!",
                  description: `Đã tạo "${quiz.title}" với ${quiz.questions.length} câu hỏi`,
                  variant: "success",
                });
                channel.close();
              },
              onFailed: (errorMessage?: string) => {
                setGenerationStatus(null);
                setGenerationProgress("");
                setLoading(false);
                localStorage.removeItem("currentQuizGeneration");
                localStorage.removeItem("currentQuizId");
                const msg = errorMessage || "Có lỗi xảy ra khi tạo quiz";
                toast({
                  title: "Tạo câu hỏi thất bại",
                  description: msg,
                  variant: "destructive",
                });
                try {
                  const reasonText = String(errorMessage || "").toLowerCase();
                  if (
                    reasonText.includes("authentication") ||
                    reasonText.includes("unauthorized") ||
                    reasonText.includes("invalid") ||
                    reasonText.includes("api key") ||
                    reasonText.includes("forbidden") ||
                    reasonText.includes("rate limit") ||
                    reasonText.includes("quota")
                  ) {
                    setApiKeyError(errorMessage || msg);
                    setShowApiKeyErrorDialog(true);
                  }
                } catch (err) {
                  console.debug("classify API key error (resume flow)", err);
                }
                const channel = new BroadcastChannel("quiz-notifications");
                channel.postMessage({
                  type: "quiz-failed",
                  title: "Tạo câu hỏi thất bại",
                  description: msg,
                  variant: "destructive",
                });
                channel.close();
              },
              onExpired: () => {
                setGenerationStatus(null);
                setGenerationProgress("");
                setLoading(false);
                localStorage.removeItem("currentQuizGeneration");
                localStorage.removeItem("currentQuizId");
                toast({
                  title: "Quiz đã hết hạn",
                  description: "Quiz này đã hết hạn. Vui lòng tạo quiz mới",
                  variant: "warning",
                });
                const channel = new BroadcastChannel("quiz-notifications");
                channel.postMessage({
                  type: "quiz-failed",
                  title: "Quiz đã hết hạn",
                  description: "Quiz này đã hết hạn. Vui lòng tạo quiz mới",
                  variant: "warning",
                });
                channel.close();
              },
              onProgress: (status, progress) => {
                setGenerationStatus(status);
                setGenerationProgress(progress || "Đang xử lý...");
                persistGenerationState({
                  quizId: savedQuizId,
                  loading: true,
                  generationStatus: status,
                  generationProgress: progress || "Đang xử lý...",
                });
              },
            });
          } else {
            // Expired or unknown status, clean up
            clearPersist();
          }
        })
        .catch((error) => {
          console.error("❌ Error checking saved quiz:", error);
          clearPersist();
        });
    }
  }, []);

  // Cleanup polling on unmount handled by hook if needed

  // Persist generation state across navigation
  const persistGenerationState = (
    partial: Partial<{
      quizId: string;
      loading: boolean;
      generationStatus: string | null;
      generationProgress: string;
    }>
  ) => {
    // timestamp sẽ được thêm trong hook useGenerationPersistence.write()
    writePersist({ ...partial });
  };

  // Progress UI moved to GenerationProgress component

  // Generate idempotency key to prevent duplicate requests
  const generateIdempotencyKey = (prompt: string, questionCount: string, userId?: string) => {
    const timestamp = Math.floor(Date.now() / (1000 * 60)); // Round to minute for 5-minute window
    const data = `${userId || 'anonymous'}-${prompt}-${questionCount}-${timestamp}`;
    
    // Simple hash function for idempotency key
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `quiz_${Math.abs(hash).toString(36)}_${timestamp}`;
  };

  const generateQuiz = async () => {
    if (!user && hasReachedLimit) {
      setShowQuotaDialog(true);
      toast({
        title: "Đã hết lượt miễn phí",
        description: "Đăng nhập để tiếp tục tạo quiz không giới hạn",
        variant: "warning",
      });
      return;
    }

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

    // Block create if prompt contains sensitive words (client-side validation)
    if (containsVietnameseBadwords(prompt)) {
      setPromptError("Chủ đề không được chứa từ ngữ không phù hợp");
      setIsPromptValid(false);
      toast({
        title: "Chủ đề không hợp lệ",
        description: "Chủ đề chứa từ ngữ nhạy cảm, vui lòng chỉnh sửa.",
        variant: "destructive",
      });
      return;
    }

    // Reset any ongoing generation and clear current quiz UI before starting a new one
    stopPolling();
    reset();
    setQuiz(null);
    setUserAnswers([]);
    setShowResults(false);
    setTokenUsage(null);
    setGenerationStatus("pending");
    setGenerationProgress("Đang chuẩn bị...");
    setLoading(true);
    // Clear persisted state for previous generation
    clearPersist();

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

      // Generate idempotency key to prevent duplicate requests
      const idempotencyKey = generateIdempotencyKey(prompt, questionCount, user?.id);

      const startQuizPayload = {
        prompt,
        device: deviceInfo,
        questionCount: parseInt(questionCount),
        idempotencyKey,
      };

      console.log("▶️ Starting quiz generation request...");
      const { data: startResponse, error: startError } =
        await supabase.functions.invoke<{ id: string; duplicate?: boolean; message?: string }>(
          "generate-quiz/start-quiz",
          {
            body: startQuizPayload,
          }
        );
      // Debug: log the raw response from Supabase Functions to ensure frontend receives quiz id
      // (Remove these logs after debugging)

      console.log("[DEBUG] generate-quiz/start-quiz response:", {
        startResponse,
        startError,
      });

      if (startError) {
        console.error("❌ Start quiz error:", startError);
        const errMsg =
          typeof (startError as { message?: unknown }).message === "string"
            ? (startError as { message: string }).message
            : "Failed to start quiz generation";
        throw new Error(errMsg);
      }

      if (!startResponse?.id) {
        console.error("❌ Invalid start response:", startResponse);
        throw new Error("Invalid response from start-quiz endpoint");
      }

      const quizId = startResponse.id;
      console.log(`✅ Quiz started with ID: ${quizId}`);

      // Handle duplicate request response
      if (startResponse.duplicate) {
        console.log("🔄 Duplicate request detected, using existing quiz");
        toast({
          title: "Yêu cầu đã được xử lý",
          description: "Quiz này đang được tạo từ yêu cầu trước đó",
          variant: "info",
        });
      }

      // Step 2: Save generation state to localStorage for navigation persistence
      const generationState = {
        quizId,
        loading: true,
        generationStatus: "pending" as string | null,
        generationProgress: "Đang chuẩn bị..." as string,
        timestamp: Date.now(),
      };
      writePersist(generationState as GenerationState);
      setLegacyId(quizId);

      // Step 3: Start polling for status via hook
      startPollingHook(quizId, {
        onCompleted: ({ quiz, tokenUsage }) => {
          setQuiz(quiz);
          if (tokenUsage) setTokenUsage(tokenUsage as TokenUsage);
          setGenerationStatus(null);
          setGenerationProgress("");
          setLoading(false);
          // Auto-scroll to quiz section after creation (robust for sticky navbar)
          try {
            const el = document.getElementById("quiz");
            if (el) {
              killActiveScroll();
              scrollToTarget(el, { align: "top" });
            }
          } catch (e) {
            console.debug("scrollTo quiz fallback failed", e);
          }
          clearPersist();

          toast({
            title: "Tạo câu hỏi thành công!",
            description: `Đã tạo "${quiz.title}" với ${quiz.questions.length} câu hỏi`,
            variant: "success",
            duration: 3000,
          });
          const channel = new BroadcastChannel("quiz-notifications");
          channel.postMessage({
            type: "quiz-complete",
            title: "Tạo câu hỏi thành công!",
            description: `Đã tạo "${quiz.title}" với ${quiz.questions.length} câu hỏi`,
            variant: "success",
          });
          channel.close();
        },
        onFailed: (errorMessage?: string) => {
          setGenerationStatus(null);
          setGenerationProgress("");
          setLoading(false);
          localStorage.removeItem("currentQuizGeneration");
          localStorage.removeItem("currentQuizId");
          const msg = errorMessage || "Có lỗi xảy ra khi tạo quiz";
          toast({
            title: "Tạo câu hỏi thất bại",
            description: msg,
            variant: "destructive",
          });
          try {
            const reasonText = String(errorMessage || "").toLowerCase();
            if (
              reasonText.includes("authentication") ||
              reasonText.includes("unauthorized") ||
              reasonText.includes("invalid") ||
              reasonText.includes("api key") ||
              reasonText.includes("forbidden") ||
              reasonText.includes("rate limit") ||
              reasonText.includes("quota")
            ) {
              setApiKeyError(errorMessage || msg);
              setShowApiKeyErrorDialog(true);
            }
          } catch (err) {
            console.debug("classify API key error (generate flow)", err);
          }
          const channel = new BroadcastChannel("quiz-notifications");
          channel.postMessage({
            type: "quiz-failed",
            title: "Tạo câu hỏi thất bại",
            description: msg,
            variant: "destructive",
          });
          channel.close();
        },
        onExpired: () => {
          setGenerationStatus(null);
          setGenerationProgress("");
          setLoading(false);
          localStorage.removeItem("currentQuizGeneration");
          localStorage.removeItem("currentQuizId");
          toast({
            title: "Quiz đã hết hạn",
            description: "Quiz này đã hết hạn. Vui lòng tạo quiz mới",
            variant: "warning",
          });
          const channel = new BroadcastChannel("quiz-notifications");
          channel.postMessage({
            type: "quiz-failed",
            title: "Quiz đã hết hạn",
            description: "Quiz này đã hết hạn. Vui lòng tạo quiz mới",
            variant: "warning",
          });
          channel.close();
        },
        onProgress: (status, progress) => {
          setGenerationStatus(status);
          setGenerationProgress(progress || "Đang xử lý...");
          persistGenerationState({
            quizId,
            loading: true,
            generationStatus: status,
            generationProgress: progress || "Đang xử lý...",
          });
        },
      });

      // Step 4: Increment anonymous counter (for UI feedback)
      if (!user) {
        incrementAnon();
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

  const handleGenerateClick = (e: MouseEvent<HTMLButtonElement>) => {
    // Nếu đang có quiz hiển thị hoặc đang có tiến trình tạo dở, yêu cầu xác nhận
    if (quiz || loading || genStatus || generationStatus) {
      setShowConfirmDialog(true);
      return;
    }
    void generateQuiz();
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
    // Stop polling via hook
    stopPolling();

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

  // Toggle chill background music via hook
  const handleToggleChill = async () => {
    try {
      await toggleChill();
    } catch (error) {
      console.error("Chill audio error:", error);
      toast({
        title: "Không thể phát nhạc",
        description: "Vui lòng kiểm tra quyền trình duyệt hoặc nguồn nhạc",
        variant: "warning",
      });
    }
  };

  // Preload PDF worker and fonts on mount to reduce first-click latency
  useEffect(() => {
    warmupPdfWorker().catch(() => {});
  }, []);

  const downloadQuiz = async () => {
    if (!quiz) return;

    try {
      toast({
        title: "Đang tạo PDF...",
        description: "Tệp sẽ tải xuống ngay khi sẵn sàng",
        variant: "info",
        duration: 1500,
      });

      const title = quiz.title || "quiz";
      const filename = `${title.replace(/\s+/g, "-").toLowerCase()}.pdf`;

      // Ensure worker and fonts are warm before generation (no-op if already warmed)
      await warmupPdfWorker().catch(() => {});

      await generateAndDownloadPdf({
        filename,
        title,
        description: quiz.description || "",
        questions: quiz.questions || [],
        showResults,
        userAnswers,
      });

      toast({
        title: "Đã tải xuống PDF",
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
          {/* Background scroll velocity effect - desktop only to optimize mobile */}
          {!isMobile && (
            <div className="absolute inset-0 -z-10 opacity-5">
              <ScrollVelocityContainer className="text-6xl md:text-8xl font-bold">
                <ScrollVelocityRow baseVelocity={75} rowIndex={0}>
                  AI Education Smart Learning Intelligent Teaching Digital
                  Classroom
                </ScrollVelocityRow>
                <ScrollVelocityRow baseVelocity={75} rowIndex={1}>
                  Adaptive Assessment Personalized Learning Virtual Teacher
                  Cognitive Training
                </ScrollVelocityRow>
                <ScrollVelocityRow baseVelocity={75} rowIndex={2}>
                  Educational Analytics Student Engagement Knowledge Discovery
                  Learning Analytics
                </ScrollVelocityRow>
                <ScrollVelocityRow baseVelocity={75} rowIndex={3}>
                  Artificial Intelligence Machine Learning Neural Networks
                  Cognitive Computing
                </ScrollVelocityRow>
                <ScrollVelocityRow baseVelocity={75} rowIndex={4}>
                  Interactive Assessment Educational Technology Intelligent
                  Tutoring Automated Grading
                </ScrollVelocityRow>
                <ScrollVelocityRow baseVelocity={75} rowIndex={5}>
                  AI Education Smart Learning Intelligent Teaching Digital
                  Classroom
                </ScrollVelocityRow>
                <ScrollVelocityRow baseVelocity={75} rowIndex={6}>
                  Adaptive Assessment Personalized Learning Virtual Teacher
                  Cognitive Training
                </ScrollVelocityRow>
                <ScrollVelocityRow baseVelocity={75} rowIndex={7}>
                  Educational Analytics Student Engagement Knowledge Discovery
                  Learning Analytics
                </ScrollVelocityRow>
                <ScrollVelocityRow baseVelocity={75} rowIndex={8}>
                  Artificial Intelligence Machine Learning Neural Networks
                  Cognitive Computing
                </ScrollVelocityRow>
                <ScrollVelocityRow baseVelocity={75} rowIndex={9}>
                  Interactive Assessment Educational Technology Intelligent
                  Tutoring Automated Grading
                </ScrollVelocityRow>
              </ScrollVelocityContainer>
            </div>
          )}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <Sparkles className="w-16 h-16 text-[#B5CC89]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Tạo bài kiểm tra của bạn
            </h2>
            <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
              <p className="text-lg text-muted-foreground m-0">
                Mô tả chủ đề bài kiểm tra và để AI tạo ra các câu hỏi hấp dẫn
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 mt-5">
              <Button
                type="button"
                variant="outline"
                size="lg"
                sound="toggle"
                className="text-base w-full sm:w-auto hover:bg-primary hover:text-primary-foreground hover:border-foreground transition-colors"
                onClick={handleToggleChill}
                aria-pressed={isChillPlaying}
                aria-label={
                  isChillPlaying ? "Tạm dừng nhạc" : "Phát nhạc chill"
                }>
                {isChillPlaying ? (
                  <PauseCircle className="w-5 h-5" />
                ) : (
                  <Music4 className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">
                  {isChillPlaying ? "Tạm dừng nhạc" : "Phát nhạc chill"}
                </span>
                {isChillPlaying && (
                  <span className="flex items-end gap-0.5" aria-hidden="true">
                    <span className="w-1 h-3 bg-[#B5CC89] rounded-sm animate-pulse group-hover:bg-primary-foreground" />
                    <span className="w-1 h-2 bg-[#B5CC89] rounded-sm animate-pulse delay-150 group-hover:bg-primary-foreground/80" />
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Quota Limit Dialog */}
          <QuotaLimitDialog
            open={showQuotaDialog}
            onOpenChange={setShowQuotaDialog}
            getTimeUntilReset={getTimeUntilReset}
          />

          {/* API Key Error Dialog */}
          <ApiKeyErrorDialog
            open={showApiKeyErrorDialog}
            errorMessage={apiKeyError}
            onOpenChange={setShowApiKeyErrorDialog}
          />

          {/* Confirm Reset Dialog */}
          <AlertDialog
            open={showConfirmDialog}
            onOpenChange={setShowConfirmDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận tạo quiz mới</AlertDialogTitle>
                <AlertDialogDescription>
                  Bài quiz hiện tại sẽ bị xóa khỏi màn hình và tiến trình đang
                  chạy (nếu có) sẽ được hủy. Bạn có muốn tiếp tục tạo quiz mới?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  <Button variant="secondary" sound="alert">
                    Hủy
                  </Button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button
                    data-fast-hover
                    variant="hero"
                    size="lg"
                    className="group text-base flex items-center gap-2 bg-black text-white transition-colors hover:bg-black hover:text-white"
                    onClick={() => {
                      setShowConfirmDialog(false);
                      const el = document.getElementById("generator");
                      if (el) {
                        killActiveScroll();
                        scrollToTarget(el, { align: "top" });
                      }
                      void generateQuiz();
                    }}>
                    Xác nhận
                    <div className="bg-[#B5CC89] p-1 rounded-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 text-black group-hover:text-white"
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
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Card className="mb-8 border-2 hover:border-primary transition-colors duration-300 hover:shadow-lg">
            <CardContent className="p-6 md:p-10 space-y-8">
              {/* Show Form OR Loading Progress */}
              {loading ? (
                <GenerationProgress
                  generationStatus={genStatus ?? generationStatus}
                  generationProgress={genProgress || generationProgress}
                  onCancel={cancelQuizGeneration}
                />
              ) : (
                /* Form Input State */
                <>
                  {/* Quota indicator for anonymous users */}
                  {!user && (
                    <div className="flex items-center justify-between p-3 bg-[#B5CC89]/10 border border-[#B5CC89]/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-[#B5CC89]" />
                        <span className="text-sm font-medium">
                          Lượt tạo miễn phí:{" "}
                          {Math.max(0, DAILY_LIMIT - anonCount)}/{DAILY_LIMIT}
                        </span>
                      </div>
                      {anonCount > 0 && (
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
                  <div className="space-y-4">
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
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-card px-2 text-muted-foreground">
                        Tùy chọn
                      </span>
                    </div>
                  </div>

                  {/* Question Count Selection */}
                  <div className="space-y-4">
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
                  <div className="pt-6">
                    <Button
                      data-fast-hover
                      onClick={handleGenerateClick}
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
        <QuizContent
          quiz={quiz}
          userAnswers={userAnswers}
          showResults={showResults}
          tokenUsage={tokenUsage}
          onAnswerSelect={handleAnswerSelect}
          onGrade={gradeQuiz}
          onReset={resetQuiz}
          calculateScore={calculateScore}
          onDownload={downloadQuiz}
        />
      )}
    </>
  );
};

export default QuizGenerator;
