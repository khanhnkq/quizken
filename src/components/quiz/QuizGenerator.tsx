import * as React from "react";
import { useState, useEffect, useCallback, type MouseEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BackgroundDecorations } from "@/components/ui/BackgroundDecorations";
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
import { cn } from "@/lib/utils";
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
  Zap,
} from "@/lib/icons";
import { Link } from "react-router-dom";
import {
  ScrollVelocityContainer,
  ScrollVelocityRow,
} from "@/components/ScrollVelocity";
import { warmupPdfWorker, generateAndDownloadPdf } from "@/lib/pdfWorkerClient";
import { containsVietnameseBadwords } from "@/lib/vnBadwordsFilter";
import type { Quiz, Question } from "@/types/quiz";
import { GenerationProgress } from "@/components/quiz/GenerationProgress";
import { QuotaLimitDialog } from "@/components/quiz/QuotaLimitDialog";
import { QuotaExceededDialog } from "@/components/quiz/QuotaExceededDialog";
import { ApiKeyErrorDialog } from "@/components/quiz/ApiKeyErrorDialog";

import { useQuizStore } from "@/hooks/useQuizStore";
import AuthModal from "@/components/AuthModal";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import useQuizGeneration from "@/hooks/useQuizGeneration";
import { useGenerationPersistence } from "@/hooks/useGenerationPersistence";
import {
  useAnonQuota,
  ResetEta, // Added ResetEta
} from "@/hooks/useAnonQuota";
import { useUserQuota } from "@/hooks/useUserQuota"; // Added useUserQuota
import useChillMusic from "@/hooks/useChillMusic";
import { useIsMobile } from "@/hooks/use-mobile";
import { killActiveScroll, scrollToTarget } from "@/lib/scroll";
import {
  createShuffledQuiz,
  computeScoreFromShuffled,
  type ShuffledQuizData,
} from "@/lib/quizShuffle";
import { useTranslation } from "react-i18next";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { calculateXP, calculateLevel, calculateCreateReward } from "@/utils/levelSystem";

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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [debugData, setDebugData] = useState<unknown>(null);
  const {
    quiz,
    userAnswers,
    showResults,
    tokenUsage,
    setQuiz,
    setUserAnswers,
    setShowResults,
    setTokenUsage,
  } = useQuizStore();
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [promptError, setPromptError] = useState<string>("");
  const [isPromptValid, setIsPromptValid] = useState<boolean>(false);
  const [showQuotaDialog, setShowQuotaDialog] = useState<boolean>(false);
  const [showUserQuotaDialog, setShowUserQuotaDialog] = useState<boolean>(false);
  const [quotaErrorMessage, setQuotaErrorMessage] = useState<string>("");
  const [showApiKeyErrorDialog, setShowApiKeyErrorDialog] =
    useState<boolean>(false);
  const [apiKeyError, setApiKeyError] = useState<string>("");
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [showNewQuizConfirm, setShowNewQuizConfirm] = useState<boolean>(false); // For new quiz overwrite confirmation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pendingGenerate, setPendingGenerate] = useState<any>(null); // To store valid generation request while waiting for confirm

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
  const { t, i18n } = useTranslation(); // Add i18n support
  const { statistics, refetch: refetchStats } = useDashboardStats(user?.id);
  const [questionCount, setQuestionCount] = useState<string>("");
  const [isQuestionCountSelected, setIsQuestionCountSelected] =
    useState<boolean>(false);
  const [shuffledData, setShuffledData] = useState<ShuffledQuizData | null>(
    null
  );
  const location = useLocation();
  const navigate = useNavigate();
  const cameFromLibraryRef = React.useRef<boolean>(
    !!(location.state as { scrollToQuiz?: boolean } | null)?.scrollToQuiz
  );
  const isMobile = useIsMobile();
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const isMountedRef = React.useRef<boolean>(true);
  const userRef = React.useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Double-submit protection refs
  const isSubmittingRef = React.useRef<boolean>(false);
  const lastSubmitTimeRef = React.useRef<number>(0);
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

  const {
    dailyCount: userCount,
    limit: userLimit,
    remaining: userRemaining,
    hasReachedLimit: userReachedLimit,
    hasApiKey,
    refetch: refetchQuota,
  } = useUserQuota(user?.id);




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
      setPromptError(t('quizGenerator.toasts.profanity'));
      setIsPromptValid(false);
      return false;
    }

    if (trimmed.length < 5) {
      setPromptError(t('quizGenerator.errors.minLength'));
      setIsPromptValid(false);
      return false;
    }

    if (trimmed.length > 500) {
      setPromptError(t('quizGenerator.toasts.maxLength'));
      setIsPromptValid(false);
      return false;
    }

    // Check for valid characters (only allow Vietnamese, English, numbers, basic punctuation)
    const validRegex = /^[\p{L}\p{N}\s.,!?"()-]+$/u;
    if (!validRegex.test(trimmed)) {
      setPromptError(t('quizGenerator.toasts.invalidChars'));
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
        setGenerationProgress(storedProgress || t('quizGenerator.ui.generating'));
        setQuizId(quizId);

        // Resume polling via hook
        startPollingHook(quizId, {
          onCompleted: ({ quiz, tokenUsage }) => {
            if (tokenUsage) setTokenUsage(tokenUsage as TokenUsage);
            setGenerationStatus(null);
            setGenerationProgress("");
            setLoading(false);
            localStorage.removeItem("currentQuizGeneration");
            localStorage.removeItem("currentQuizId");

            // Calculate Reward
            let title = t('quizGenerator.success.title');
            if (userRef.current) {
              const xp = calculateXP(statistics);
              const level = calculateLevel(xp);
              const reward = calculateCreateReward(level);
              title = t('notifications.zcoinReward.create', { amount: reward, xp: 100 });
            }

            // Refresh global stats to trigger level up notification if applicable
            refetchStats();

            toast({
              title: title,
              description: t('quizGenerator.success.description', { title: quiz.title, count: quiz.questions.length }),
              variant: "success",
              duration: 3000,
            });
            const channel = new BroadcastChannel("quiz-notifications");
            channel.postMessage({
              type: "quiz-complete",
              title: title,
              description: t('quizGenerator.success.description', { title: quiz.title, count: quiz.questions.length }),
              variant: "success",
            });
            channel.close();

            // Redirect to play page instead of inline display
            navigate(`/quiz/play/${quizId}`);
          },
          onFailed: (errorMessage?: string) => {
            setGenerationStatus(null);
            setGenerationProgress("");
            setLoading(false);
            localStorage.removeItem("currentQuizGeneration");
            localStorage.removeItem("currentQuizId");
            const msg = errorMessage || t('quizGenerator.toasts.genericError');

            // Check for User Quota Exceeded
            if (msg.toLowerCase().includes("daily quota limit reached")) {
              setQuotaErrorMessage(msg);
              setShowUserQuotaDialog(true);
              // Don't show toast for strict limit to force dialog attention, 
              // or show warning toast as backup
              toast({
                title: t('quizGenerator.toasts.quotaTitle'),
                description: msg,
                variant: "warning",
              });
              return;
            }

            toast({
              title: t('quizGenerator.toasts.failedTitle'),
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
              title: t('quizGenerator.toasts.failedTitle'),
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
              title: t('quizGenerator.toasts.expiredTitle'),
              description: t('quizGenerator.expired.description'),
              variant: "warning",
            });
            const channel = new BroadcastChannel("quiz-notifications");
            channel.postMessage({
              type: "quiz-failed",
              title: t('quizGenerator.toasts.expiredTitle'),
              description: t('quizGenerator.expired.description'),
              variant: "warning",
            });
            channel.close();
          },
          onProgress: (status, progress) => {
            setGenerationStatus(status);
            setGenerationProgress(progress || t('quizGenerator.toasts.processingStatus'));
            persistGenerationState({
              quizId,
              loading: true,
              generationStatus: status,
              generationProgress: progress || t('quizGenerator.toasts.processingStatus'),
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
            // 🔧 FIX: Ensure quiz has ID
            const quizWithId = { ...data.quiz, id: savedQuizId };
            setQuiz(quizWithId);
            clearPersist();
            toast({
              title: t('quizGenerator.toasts.restoreSuccessTitle'),
              description: t('quizGenerator.toasts.restoreSuccessDesc'),
              variant: "info",
            });
          } else if (status === "failed") {
            // Quiz failed, clean up
            clearPersist();
            toast({
              title: t('quizGenerator.toasts.restoreFailedTitle'),
              description: t('quizGenerator.toasts.restoreFailedDesc'),
              variant: "warning",
            });
          } else if (status === "processing" || status === "pending") {
            // Still processing, resume generation state
            console.log("▶️ Resuming quiz generation from saved state...");
            setLoading(true);
            setGenerationStatus("processing");
            setGenerationProgress(t('quizGenerator.toasts.resuming'));
            setQuizId(savedQuizId);
            startPollingHook(savedQuizId, {
              onCompleted: ({ quiz, tokenUsage }) => {
                if (tokenUsage) setTokenUsage(tokenUsage as TokenUsage);
                setGenerationStatus(null);
                setGenerationProgress("");
                setLoading(false);
                clearPersist();
                toast({
                  title: t('quizGenerator.success.title'),
                  description: t('quizGenerator.success.description', { title: quiz.title, count: quiz.questions.length }),
                  variant: "success",
                  duration: 3000,
                });
                const channel = new BroadcastChannel("quiz-notifications");
                channel.postMessage({
                  type: "quiz-complete",
                  title: t('quizGenerator.success.title'),
                  description: t('quizGenerator.success.description', { title: quiz.title, count: quiz.questions.length }),
                  variant: "success",
                });
                channel.close();

                // Redirect to play page instead of inline display
                navigate(`/quiz/play/${savedQuizId}`);
              },
              onFailed: (errorMessage?: string) => {
                setGenerationStatus(null);
                setGenerationProgress("");
                setLoading(false);
                localStorage.removeItem("currentQuizGeneration");
                localStorage.removeItem("currentQuizId");

                const msg = errorMessage || t('quizGenerator.toasts.genericError');
                toast({
                  title: t('quizGenerator.toasts.failedTitle'),
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
                  title: t('quizGenerator.toasts.failedTitle'),
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
                  title: t('quizGenerator.toasts.expiredTitle'),
                  description: t('quizGenerator.expired.description'),
                  variant: "warning",
                });
                const channel = new BroadcastChannel("quiz-notifications");
                channel.postMessage({
                  type: "quiz-failed",
                  title: t('quizGenerator.toasts.expiredTitle'),
                  description: t('quizGenerator.expired.description'),
                  variant: "warning",
                });
                channel.close();
              },
              onProgress: (status, progress) => {
                if (status === "completed" || status === "failed" || status === "expired") return;
                setGenerationStatus(status);
                setGenerationProgress(progress || t('quizGenerator.toasts.processingStatus'));
                persistGenerationState({
                  quizId: savedQuizId,
                  loading: true,
                  generationStatus: status,
                  generationProgress: progress || t('quizGenerator.toasts.processingStatus'),
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
  const generateIdempotencyKey = (
    prompt: string,
    questionCount: string,
    userId?: string
  ) => {
    const timestamp = Math.floor(Date.now() / (1000 * 60)); // Round to minute for 5-minute window
    const data = `${userId || "anonymous"
      }-${prompt}-${questionCount}-${timestamp}`;

    // Simple hash function for idempotency key
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
    }
    return `quiz_${Math.abs(hash).toString(36)}_${timestamp}`;
  };

  // Main Quiz Generation Logic
  const generateQuiz = async () => {
    // 1. Strict Auth Check
    if (!user) {
      setShowAuthModal(true);
      toast({
        title: t('auth.required'),
        description: t('auth.loginToCreate'),
        variant: "warning",
        duration: 3000,
      });
      return;
    }

    if (userReachedLimit) {
      setShowUserQuotaDialog(true);
      return;
    }

    if (!prompt.trim()) {
      toast({
        title: t('quizGenerator.toasts.enterTopic'),
        description: t('quizGenerator.toasts.enterTopicDesc'),
        variant: "warning",
      });
      return;
    }

    if (!isQuestionCountSelected) {
      toast({
        title: t('quizGenerator.toasts.selectCount'),
        description: t('quizGenerator.toasts.selectCountDesc'),
        variant: "warning",
      });
      return;
    }

    // 2. Content Validation
    if (containsVietnameseBadwords(prompt)) {
      setPromptError(t('quizGenerator.errors.profaneContent'));
      setIsPromptValid(false);
      toast({
        title: t('quizGenerator.errors.invalidTopic'),
        description: t('quizGenerator.toasts.sensitiveContent'),
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // 3. Reset State & Prepare UI
    stopPolling();
    reset();
    setQuiz(null);
    setUserAnswers([]);
    setShowResults(false);
    setTokenUsage(null);
    setLoading(true);

    // 4. Determine Params (handling pending confirmation state)
    const promptToUse = pendingGenerate?.prompt || prompt;
    const countToUse = pendingGenerate?.questionCount || questionCount;
    setPendingGenerate(null);

    const idempotencyKey = generateIdempotencyKey(
      promptToUse,
      countToUse,
      user?.id
    );

    console.log("🚀 [FRONTEND] Starting async quiz generation...");

    const deviceInfo = {
      language: navigator.language,
      platform: "platform" in navigator ? (navigator as Navigator & { platform?: string }).platform ?? "" : "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      userAgent: navigator.userAgent,
      screen: {
        width: window.screen?.width,
        height: window.screen?.height,
        colorDepth: window.screen?.colorDepth,
      },
    };

    // 5. Call BE to Start Quiz
    try {
      setLoading(true);

      const startQuizPayload = {
        prompt: promptToUse,
        device: deviceInfo,
        questionCount: parseInt(countToUse),
        idempotencyKey,
        language: i18n.language,
      };

      console.log("▶️ Starting quiz generation request...");
      const { data: startResponse, error: startError } =
        await supabase.functions.invoke<{
          id: string;
          duplicate?: boolean;
          message?: string;
        }>("generate-quiz/start-quiz", {
          body: startQuizPayload,
        });

      if (startError) {
        console.error("❌ Start quiz error:", startError);
        const errMsg = typeof (startError as { message?: unknown }).message === "string"
          ? (startError as { message: string }).message
          : "Failed to start quiz generation";
        throw new Error(errMsg);
      }

      if (!startResponse?.id) {
        throw new Error("Invalid response from start-quiz endpoint");
      }

      const quizId = startResponse.id;
      console.log(`✅ Quiz started with ID: ${quizId}`);

      if (startResponse.duplicate) {
        toast({
          title: t('quizGenerator.toasts.requestProcessed'),
          description: t('quizGenerator.toasts.requestProcessedDesc'),
          variant: "info",
        });
      }

      // 6. Persistence & Polling
      const generationState = {
        quizId,
        loading: true,
        generationStatus: "pending" as string | null,
        generationProgress: "Đang chuẩn bị..." as string,
        timestamp: Date.now(),
      };
      writePersist(generationState as GenerationState);
      setLegacyId(quizId);

      startPollingHook(quizId, {
        onCompleted: ({ quiz, tokenUsage }) => {
          isSubmittingRef.current = false;
          if (tokenUsage) setTokenUsage(tokenUsage as TokenUsage);
          setGenerationStatus(null);
          setGenerationProgress("");
          setLoading(false);
          clearPersist();

          // XP & Reward
          let title = t('quizGenerator.success.title');
          if (userRef.current) {
            const xp = calculateXP(statistics);
            const level = calculateLevel(xp);
            const reward = calculateCreateReward(level);
            title = t('notifications.zcoinReward.create', { amount: reward, xp: 100 });
          }

          // Refetch quota immediately
          refetchStats(); // Refetch dashboard stats (XP, etc)
          refetchQuota(); // Refetch user quota (daily limits)

          // And again after a short delay to ensure DB propagation
          setTimeout(() => {
            refetchStats();
            refetchQuota();
          }, 1000);

          toast({
            title: title,
            description: t('quizGenerator.success.description', { title: quiz.title, count: quiz.questions.length }),
            variant: "success",
            duration: 3000,
          });

          const channel = new BroadcastChannel("quiz-notifications");
          channel.postMessage({
            type: "quiz-complete",
            title: title,
            description: t('quizGenerator.success.description', { title: quiz.title, count: quiz.questions.length }),
            variant: "success",
          });
          channel.close();

          navigate(`/quiz/play/${quizId}`);
        },
        onFailed: (errorMessage?: string) => {
          isSubmittingRef.current = false;
          setGenerationStatus(null);
          setGenerationProgress("");
          setLoading(false);
          localStorage.removeItem("currentQuizGeneration");
          localStorage.removeItem("currentQuizId");

          const msg = errorMessage || t('quizGenerator.toasts.genericError');

          if (msg.toLowerCase().includes("daily quota limit reached")) {
            setQuotaErrorMessage(msg);
            setShowUserQuotaDialog(true);
            toast({
              title: t('quizGenerator.toasts.quotaTitle'),
              description: msg,
              variant: "warning",
            });
            return;
          }

          toast({
            title: t('quizGenerator.toasts.failedTitle'),
            description: msg,
            variant: "destructive",
          });

          // Check explicit error types
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
            console.debug("classify error", err);
          }
        },
        onExpired: () => {
          isSubmittingRef.current = false;
          setGenerationStatus(null);
          setGenerationProgress("");
          setLoading(false);
          localStorage.removeItem("currentQuizGeneration");
          localStorage.removeItem("currentQuizId");
          toast({
            title: t('quizGenerator.toasts.expiredTitle'),
            description: t('quizGenerator.expired.description'),
            variant: "warning",
          });
        },
        onProgress: (status, progress) => {
          if (status === "completed" || status === "failed" || status === "expired") return;
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

      if (!user) incrementAnon();

    } catch (error) {
      console.error("❌ Error starting quiz:", error);
      isSubmittingRef.current = false;
      setLoading(false);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      // Check for quota exceeded
      if (
        errorMessage.includes("anonymous_quota_exceeded") ||
        errorMessage.includes("quota")
      ) {
        if (user) {
          setQuotaErrorMessage(errorMessage);
          setShowUserQuotaDialog(true);
        } else {
          setShowQuotaDialog(true);
        }
        return;
      }
      if (errorMessage.includes("authentication_required") || errorMessage.includes("invalid") || errorMessage.includes("unauthorized")) {
        setApiKeyError(errorMessage);
        setShowApiKeyErrorDialog(true);
        return;
      }
      toast({
        title: "Tạo câu hỏi thất bại",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleGenerateClick = (e?: MouseEvent<HTMLButtonElement>) => {
    if (!user) {
      toast({
        title: t("library.toasts.loginRequired"),
        description: t("library.toasts.loginDesc"),
        variant: "warning",
      });
      setShowAuthModal(true);
      return;
    }

    const now = Date.now();
    if (isSubmittingRef.current || now - lastSubmitTimeRef.current < 5000) {
      toast({
        title: t('quizGenerator.toasts.pleaseWait'),
        description: t('quizGenerator.toasts.processing'),
        variant: "warning",
      });
      return;
    }

    if (quiz || loading || genStatus || generationStatus) {
      setPendingGenerate({ prompt, questionCount: questionCount });
      setShowNewQuizConfirm(true);
      return;
    }

    isSubmittingRef.current = true;
    lastSubmitTimeRef.current = now;
    void generateQuiz();
  };

  const cancelQuizGeneration = () => {
    // 1. Backend Cancel
    const idToCancel = quizId || localStorage.getItem("currentQuizId");
    if (idToCancel) {
      supabase.functions.invoke('generate-quiz/cancel-quiz', {
        body: { quiz_id: idToCancel }
      }).then(({ data, error }) => {
        if (error) console.error("❌ Failed to cancel quiz on backend:", error);
        else console.log("✅ Quiz cancelled on backend");
      }).catch(err => console.error("❌ Network error cancelling quiz:", err));
    }

    // 2. Client Cleanup
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    stopPolling();
    setLoading(false);
    isSubmittingRef.current = false; // Reset submission flag
    lastSubmitTimeRef.current = 0;   // Reset timestamp to allow immediate retry
    setGenerationStatus(null);
    setGenerationProgress("");
    setQuizId(null);
    localStorage.removeItem("currentQuizGeneration");
    localStorage.removeItem("currentQuizId");

    toast({
      title: t('quizGenerator.toasts.cancelledTitle'),
      description: t('quizGenerator.toasts.cancelledDesc'),
      variant: "info",
    });

    abortControllerRef.current = new AbortController();
  };

  const handleCancelGeneration = useCallback(() => {
    setShowConfirmDialog(true);
  }, []);

  const confirmCancel = useCallback(() => {
    cancelQuizGeneration();
    setShowConfirmDialog(false);
  }, []);



  // Toggle chill background music via hook
  const handleToggleChill = async () => {
    try {
      await toggleChill();
    } catch (error) {
      console.error("Chill audio error:", error);
      toast({
        title: t('quizGenerator.toasts.musicError'),
        description: t('quizGenerator.toasts.musicErrorDesc'),
        variant: "warning",
      });
    }
  };

  // Preload PDF worker and fonts on mount to reduce first-click latency
  useEffect(() => {
    warmupPdfWorker().catch(() => { });
  }, []);



  return (
    <>
      <section
        id="generator"
        className="relative overflow-hidden bg-gradient-to-b from-secondary/30 to-background min-h-screen py-20 px-4">

        {/* Background scroll velocity effect - desktop only to optimize mobile */}
        {!isMobile && (
          <div className="absolute inset-0 z-0 opacity-5">
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

        <BackgroundDecorations />

        {/* Floating Icons - Replaced with BackgroundDecorations component */}

        <div className="container mx-auto max-w-4xl px-0 sm:px-4 relative z-10">



          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <Sparkles className="w-16 h-16 text-primary" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t('quizGenerator.header')}
            </h2>
            <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
              <p className="text-lg text-muted-foreground m-0">
                {t('quizGenerator.headerDescription')}
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
                  isChillPlaying ? t('quizGenerator.ui.pauseMusic') : t('quizGenerator.ui.playMusic')
                }>
                {isChillPlaying ? (
                  <PauseCircle className="w-5 h-5" />
                ) : (
                  <Music4 className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">
                  {isChillPlaying ? t('quizGenerator.ui.pauseMusic') : t('quizGenerator.ui.playMusic')}
                </span>
                {isChillPlaying && (
                  <span className="flex items-end gap-0.5" aria-hidden="true">
                    <span className="w-1 h-3 bg-primary rounded-sm animate-pulse group-hover:bg-primary-foreground" />
                    <span className="w-1 h-2 bg-primary rounded-sm animate-pulse delay-150 group-hover:bg-primary-foreground/80" />
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

          {/* Auth Modal for checking login status */}
          <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
          {/* Confirm Cancel Dialog */}
          <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('quizGenerator.confirmDialog.titleCancel')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('quizGenerator.confirmDialog.descriptionCancel')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('quizGenerator.confirmDialog.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={confirmCancel}>{t('quizGenerator.confirmDialog.confirm')}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Confirm New Quiz Dialog */}
          <AlertDialog open={showNewQuizConfirm} onOpenChange={setShowNewQuizConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('quizGenerator.confirmDialog.title')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('quizGenerator.confirmDialog.description')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => {
                  setShowNewQuizConfirm(false);
                  setPendingGenerate(null);
                }}>
                  {t('common.cancel')}
                </AlertDialogCancel>
                <AlertDialogAction onClick={() => {
                  setShowNewQuizConfirm(false);
                  if (pendingGenerate) {
                    setPrompt(pendingGenerate.prompt);
                    setQuestionCount(pendingGenerate.questionCount);
                    generateQuiz(); // Proceed with pending generation, forcing new
                    setPendingGenerate(null);
                  }
                }}>
                  {t('common.confirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Quota Exceeded Dialog */}
          <QuotaExceededDialog
            open={showUserQuotaDialog}
            onOpenChange={setShowUserQuotaDialog}
            message={quotaErrorMessage}
          />
          {/* API Key Error Dialog */}
          <ApiKeyErrorDialog
            open={showApiKeyErrorDialog}
            onOpenChange={setShowApiKeyErrorDialog}
            errorMessage={apiKeyError}
          />



          <Card className="mb-8 border-4 border-primary/30 bg-white/80 backdrop-blur-sm shadow-[0_8px_30px_rgba(0,0,0,0.08),inset_0_2px_0_rgba(255,255,255,0.9)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)] transition-all duration-300 rounded-3xl overflow-hidden">
            <CardContent className="p-4 sm:p-6 md:p-10 space-y-8">
              {/* Show Form OR Loading Progress */}
              {loading ? (
                <GenerationProgress
                  generationStatus={genStatus ?? generationStatus}
                  generationProgress={genProgress || generationProgress}
                  onCancel={handleCancelGeneration}
                />
              ) : (
                /* Form Input State */
                <>
                  {/* Compact Quota UI */}
                  {user && (
                    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50/80 to-indigo-50/80 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-100 dark:border-purple-800 mb-6">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                          {t("quizGenerator.quota.usage")}
                        </span>
                      </div>
                      {hasApiKey ? (
                        <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          <Zap className="w-4 h-4" />
                          {t("quizGenerator.quota.unlimited")}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-white/60 dark:bg-black/30 rounded-full overflow-hidden border border-purple-100 dark:border-purple-800">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                userRemaining === 0
                                  ? "bg-red-400"
                                  : userRemaining === 1
                                    ? "bg-orange-400"
                                    : "bg-gradient-to-r from-purple-400 to-indigo-500"
                              )}
                              style={{ width: `${Math.min(100, (userRemaining / userLimit) * 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                            {userRemaining}/{userLimit}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Topic Input Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <label
                        htmlFor="quiz-topic"
                        className="text-lg font-heading font-bold text-foreground">
                        {t('quizGenerator.ui.topicLabel')}
                      </label>
                      <Badge variant="secondary" className="rounded-lg px-2 py-0.5 text-xs font-bold border-2 border-border">
                        {t('quizGenerator.ui.required')}
                      </Badge>
                    </div>
                    <div className="relative group">
                      <Textarea
                        id="quiz-topic"
                        placeholder={t('quizGenerator.ui.examplePlaceholder')}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className={`min-h-[140px] md:min-h-[160px] resize-none text-lg p-6 rounded-2xl border-4 shadow-sm transition-all text-base leading-relaxed ${promptError
                          ? "border-destructive/50 focus-visible:ring-destructive/20 focus-visible:border-destructive"
                          : isPromptValid
                            ? "border-primary/50 focus-visible:ring-primary/20 focus-visible:border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 focus-visible:ring-primary/20 focus-visible:border-primary"
                          }`}
                      />
                      {/* Character count floating inside */}
                      <div className="absolute bottom-4 right-4 text-xs font-medium text-muted-foreground bg-white/80 px-2 py-1 rounded-md backdrop-blur-sm border border-border/50">
                        {prompt.trim().length}/500
                      </div>
                    </div>

                    <div className="min-h-[20px]">
                      <div className="flex items-center gap-2">
                        {promptError && (
                          <span className="text-destructive font-medium flex items-center gap-1.5 text-sm animate-in slide-in-from-left-2 fade-in duration-300">
                            <XCircle className="w-4 h-4" />
                            <span>{promptError}</span>
                          </span>
                        )}
                        {isPromptValid && !promptError && (
                          <span className="text-primary font-medium flex items-center gap-1.5 text-sm animate-in slide-in-from-left-2 fade-in duration-300">
                            <Sparkles className="w-4 h-4" />
                            {t('quizGenerator.ui.validPrompt')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-dashed border-border/60"></div>
                    </div>
                    <div className="relative flex justify-center text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                      <span className="bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border-2 border-border/50 flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-primary" />
                        {t('quizGenerator.ui.optional')}
                      </span>
                    </div>
                  </div>

                  {/* Question Count Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <label
                        htmlFor="question-count"
                        className="text-lg font-heading font-bold text-foreground">
                        {t('quizGenerator.ui.questionCount')}
                      </label>
                      <Badge variant="secondary" className="rounded-lg px-2 py-0.5 text-xs font-bold border-2 border-border">
                        {t('quizGenerator.ui.required')}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      <Select
                        value={questionCount}
                        onValueChange={(value) => {
                          setQuestionCount(value);
                          setIsQuestionCountSelected(true);
                        }}>
                        <SelectTrigger
                          id="question-count"
                          className="w-full h-14 rounded-2xl border-4 text-base px-4 font-medium transition-all hover:border-primary/50 focus:ring-primary/20 bg-background text-foreground shadow-sm">
                          <SelectValue placeholder={t('quizGenerator.ui.selectPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-2">
                          <SelectItem value="10" className="rounded-lg my-1 py-3 cursor-pointer">{t('quizGenerator.ui.10questions')}</SelectItem>
                          <SelectItem value="15" className="rounded-lg my-1 py-3 cursor-pointer">{t('quizGenerator.ui.15questions')}</SelectItem>
                          <SelectItem value="20" className="rounded-lg my-1 py-3 cursor-pointer">{t('quizGenerator.ui.20questions')}</SelectItem>
                          <SelectItem value="25" className="rounded-lg my-1 py-3 cursor-pointer">{t('quizGenerator.ui.25questions')}</SelectItem>
                          <SelectItem value="30" className="rounded-lg my-1 py-3 cursor-pointer">{t('quizGenerator.ui.30questions')}</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/30 border border-secondary text-muted-foreground">
                        <Clock className="w-5 h-5 text-primary" />
                        <p className="text-sm font-medium">
                          {t('quizGenerator.ui.estimatedTime')}{" "}
                          <span className="text-foreground font-bold">
                            {questionCount
                              ? Math.ceil(parseInt(questionCount) / 10)
                              : 2}
                            -
                            {questionCount
                              ? Math.ceil(parseInt(questionCount) / 5)
                              : 4}{" "}
                          </span>
                          {t('quizGenerator.ui.minutes')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Main Action Button */}
                  <div className="pt-4">
                    <Button
                      data-fast-hover
                      onClick={handleGenerateClick}
                      disabled={loading || !isPromptValid || !isQuestionCountSelected}
                      className="w-full h-14 sm:h-16 text-lg sm:text-xl rounded-3xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-primary text-white font-heading relative overflow-hidden group border-4 border-primary hover:border-primary-foreground/20 active:scale-95"
                      variant="hero"
                      size="xl"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                          {loadingMessage}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-6 h-6 mr-2" />
                          {isPromptValid && isQuestionCountSelected
                            ? t('quizGenerator.createButton')
                            : t('quizGenerator.ui.fillAllFields')}
                          {isPromptValid && isQuestionCountSelected && (
                            <div className="bg-white/20 p-1.5 rounded-lg ml-3 group-hover:rotate-12 transition-transform">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="3"
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
      </section >


    </>
  );
};

export default QuizGenerator;
