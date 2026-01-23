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
import { QuickGeneratorDialog } from "@/components/quiz/QuickGeneratorDialog";

import { useQuizStore } from "@/hooks/useQuizStore";
import AuthModal from "@/components/AuthModal";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, ArrowUp, Mic, Play, Layers, PenLine } from "lucide-react";
import logo from "@/assets/logo/logo.png";
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
import {
  calculateXP,
  calculateLevel,
  calculateCreateReward,
} from "@/utils/levelSystem";
import Mascot from "@/components/ui/Mascot";
import { useProfile } from "@/hooks/useProfile";
import { VietnamMapIcon, VietnamStarIcon, VietnamDrumIcon, VietnamLotusIcon } from "@/components/icons/VietnamIcons";
import { NeonBoltIcon, NeonCyberSkullIcon, PastelCloudIcon, PastelHeartIcon, ComicPowIcon, ComicBoomIcon } from "@/components/icons/ThemeIcons";

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
  const [showUserQuotaDialog, setShowUserQuotaDialog] =
    useState<boolean>(false);
  const [quotaErrorMessage, setQuotaErrorMessage] = useState<string>("");
  const [showApiKeyErrorDialog, setShowApiKeyErrorDialog] =
    useState<boolean>(false);
  const [apiKeyError, setApiKeyError] = useState<string>("");
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [showNewQuizConfirm, setShowNewQuizConfirm] = useState<boolean>(false); // For new quiz overwrite confirmation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pendingGenerate, setPendingGenerate] = useState<any>(null); // To store valid generation request while waiting for confirm

  // Dialog state for manual/AI toggle
  const [showQuickDialog, setShowQuickDialog] = useState(false);
  const [quickDialogTab, setQuickDialogTab] = useState<"ai" | "manual" | null>(
    null,
  );

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
  const { profileData } = useProfile(user?.id);

  const themeConfig = React.useMemo(() => {
    const theme = profileData?.equipped_theme;
    switch (theme) {
      case 'theme_vietnam_spirit':
        return {
          aiIcon: VietnamStarIcon,
          manualIcon: VietnamLotusIcon,
          generateIcon: VietnamDrumIcon,
          aiColor: "text-red-500",
          generateBtnGradient: "from-red-600 to-yellow-500 shadow-red-500/30 hover:shadow-red-500/50",
          generateIconClass: "",
          inputBorderActive: "border-red-200 dark:border-red-900 ring-red-50/50 dark:ring-red-900/30 shadow-red-100 dark:shadow-red-900/20 hover:shadow-red-200 dark:hover:shadow-red-900/40",
        };
      case 'theme_neon_night':
        return {
          aiIcon: NeonBoltIcon,
          manualIcon: NeonCyberSkullIcon,
          generateIcon: NeonBoltIcon,
          aiColor: "text-cyan-400",
          generateBtnGradient: "from-cyan-500 to-blue-600 shadow-cyan-500/30 hover:shadow-cyan-500/50",
          generateIconClass: "",
          inputBorderActive: "border-cyan-200 dark:border-cyan-900 ring-cyan-50/50 dark:ring-cyan-900/30 shadow-cyan-100 dark:shadow-cyan-900/20 hover:shadow-cyan-200 dark:hover:shadow-cyan-900/40",
        };
      case 'theme_pastel_dream':
        return {
          aiIcon: PastelCloudIcon,
          manualIcon: PastelHeartIcon,
          generateIcon: PastelCloudIcon,
          aiColor: "text-pink-400",
          generateBtnGradient: "from-pink-300 to-purple-400 shadow-pink-500/30 hover:shadow-pink-500/50",
          generateIconClass: "",
          inputBorderActive: "border-pink-200 dark:border-pink-900 ring-pink-50/50 dark:ring-pink-900/30 shadow-pink-100 dark:shadow-pink-900/20 hover:shadow-pink-200 dark:hover:shadow-pink-900/40",
        };
      case 'theme_comic_manga':
        return {
          aiIcon: ComicBoomIcon,
          manualIcon: ComicPowIcon,
          generateIcon: ComicBoomIcon,
          aiColor: "text-yellow-500",
          generateBtnGradient: "from-yellow-400 to-orange-500 border-2 border-black shadow-yellow-500/30 hover:shadow-yellow-500/50",
          generateIconClass: "",
          inputBorderActive: "border-yellow-200 dark:border-yellow-900 ring-yellow-50/50 dark:ring-yellow-900/30 shadow-yellow-100 dark:shadow-yellow-900/20 hover:shadow-yellow-200 dark:hover:shadow-yellow-900/40",
        };
      default:
        return {
          aiIcon: Sparkles,
          manualIcon: PenLine,
          generateIcon: ArrowUp,
          aiColor: "text-green-400",
          generateBtnGradient: "bg-gradient-to-tr from-green-400 to-green-600 shadow-green-500/30 hover:shadow-green-500/50",
          generateIconClass: "rotate-90",
          inputBorderActive: "border-green-200 dark:border-green-900 ring-4 ring-green-50/50 dark:ring-green-900/30 shadow-green-100 dark:shadow-green-900/20 hover:shadow-green-200 dark:hover:shadow-green-900/40",
        };
    }
  }, [profileData?.equipped_theme]);

  const { t, i18n } = useTranslation(); // Add i18n support
  const { statistics, refetch: refetchStats } = useDashboardStats(user?.id);
  const [questionCount, setQuestionCount] = useState<string>("");

  const [isQuestionCountSelected, setIsQuestionCountSelected] =
    useState<boolean>(false);
  const [shuffledData, setShuffledData] = useState<ShuffledQuizData | null>(
    null,
  );
  const location = useLocation();
  const navigate = useNavigate();
  const cameFromLibraryRef = React.useRef<boolean>(
    !!(location.state as { scrollToQuiz?: boolean } | null)?.scrollToQuiz,
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
  const isCompletingRef = React.useRef<boolean>(false); // Guard against false cancellation

  const {
    status: genStatus,
    progress: genProgress,
    startPolling: startPollingHook,
    stopPolling,
    reset,
  } = useQuizGeneration<Quiz>();

  // ...
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

  console.log("DEBUG QUOTA:", {
    user: !!user,
    hasApiKey,
    userCount,
    userRemaining,
    userLimit,
  });

  // Initialize AbortController - No automatic cleanup to allow quiz generation
  // during in-app navigation. Only cancel on explicit page unload signals.
  useEffect(() => {
    abortControllerRef.current = new AbortController();
    // IT: No cleanup function in this useEffect!
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
          "🛑 [ABORT] Quiz generation cancelled due to page unload (tab close/reload)",
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
        tabHiddenTimer = setTimeout(
          () => {
            if (document.hidden && abortControllerRef.current && loading) {
              abortControllerRef.current.abort();
              console.log(
                "🛑 [ABORT] Quiz generation cancelled due to extended tab inactivity (5+ minutes)",
              );
            }
          },
          5 * 60 * 1000,
        ); // 5 minutes
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
      // We DO NOT abort on unmount anymore, to allow background generation while navigating.
      // The AbortController will only be triggered by explicit user cancellation or page unload (handled above).
      console.log(
        "🔄 [QuizGenerator] Unmounting, but keeping generation alive for background processing.",
      );
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
      setPromptError(t("quizGenerator.toasts.profanity"));
      setIsPromptValid(false);
      return false;
    }

    if (trimmed.length < 5) {
      setPromptError(t("quizGenerator.errors.minLength"));
      setIsPromptValid(false);
      return false;
    }

    if (trimmed.length > 500) {
      setPromptError(t("quizGenerator.toasts.maxLength"));
      setIsPromptValid(false);
      return false;
    }

    // Check for valid characters (only allow Vietnamese, English, numbers, basic punctuation)
    const validRegex = /^[\p{L}\p{N}\s.,!?"()-]+$/u;
    if (!validRegex.test(trimmed)) {
      setPromptError(t("quizGenerator.toasts.invalidChars"));
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

  // Function to restore generation state
  const checkAndRestoreState = useCallback(() => {
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
          "▶️ [FRONTEND] Restoring generation state from localStorage",
        );

        // Restore the generation state
        setLoading(storedLoading);
        setGenerationStatus(storedStatus);
        setGenerationProgress(
          storedProgress || t("quizGenerator.ui.generating"),
        );
        setQuizId(quizId);

        // Resume polling via hook
        startPollingHook(quizId, {
          onCompleted: ({ quiz, tokenUsage }) => {
            isCompletingRef.current = true; // Mark as completing
            if (tokenUsage) setTokenUsage(tokenUsage as TokenUsage);
            setGenerationStatus(null);
            setGenerationProgress("");
            setLoading(false);
            localStorage.removeItem("currentQuizGeneration");
            localStorage.removeItem("currentQuizId");
            setQuiz(quiz); // Persist generation result to global state

            // Calculate Reward
            let title = t("quizGenerator.success.title");
            if (userRef.current) {
              const xp = calculateXP(statistics);
              const level = calculateLevel(xp);
              const reward = calculateCreateReward(level);
              title = t("notifications.zcoinReward.create", {
                amount: reward,
                xp: 100,
              });
            }

            // Refresh global stats to trigger level up notification if applicable
            refetchStats();

            toast({
              title: title,
              description: t("quizGenerator.success.description", {
                title: quiz.title,
                count: quiz.questions.length,
              }),
              variant: "success",
              duration: 3000,
            });
            const channel = new BroadcastChannel("quiz-notifications");
            channel.postMessage({
              type: "quiz-complete",
              title: title,
              description: t("quizGenerator.success.description", {
                title: quiz.title,
                count: quiz.questions.length,
              }),
              variant: "success",
            });
            channel.close();

            // Redirect to play page instead of inline display
            navigate(`/quiz/play/${quizId}`);
          },
          onFailed: (errorMessage?: string) => {
            isSubmittingRef.current = false;
            lastSubmitTimeRef.current = 0; // Allow immediate retry
            setGenerationStatus(null);
            setGenerationProgress("");
            setLoading(false);
            clearPersist();
            reset();

            // Cleanup: Delete the failed quiz from DB
            if (quizId) {
              supabase
                .from("quizzes")
                .delete()
                .eq("id", quizId)
                .then(({ error }) => {
                  if (error) {
                    console.warn(
                      `[QuizGenerator] Failed to cleanup quiz ${quizId}:`,
                      error.message,
                    );
                  } else {
                    console.log(
                      `[QuizGenerator] Cleaned up failed quiz ${quizId}`,
                    );
                  }
                });
            }
            setQuizId(null);
            const msg = errorMessage || t("quizGenerator.toasts.genericError");

            // Check for User Quota Exceeded
            if (msg.toLowerCase().includes("daily quota limit reached")) {
              setQuotaErrorMessage(msg);
              setShowUserQuotaDialog(true);
              // Don't show toast for strict limit to force dialog attention,
              // or show warning toast as backup
              toast({
                title: t("quizGenerator.toasts.quotaTitle"),
                description: msg,
                variant: "warning",
              });
              return;
            }

            toast({
              title: t("quizGenerator.toasts.failedTitle"),
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
                reasonText.includes("quota") ||
                reasonText.includes("503") ||
                reasonText.includes("quá tải") ||
                reasonText.includes("service unavailable")
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
              title: t("quizGenerator.toasts.failedTitle"),
              description: msg,
              variant: "destructive",
            });
            channel.close();
          },
          onExpired: () => {
            isSubmittingRef.current = false;
            lastSubmitTimeRef.current = 0; // Allow immediate retry
            setGenerationStatus(null);
            setGenerationProgress("");
            setLoading(false);
            clearPersist();
            reset();
            setQuizId(null);
            toast({
              title: t("quizGenerator.toasts.expiredTitle"),
              description: t("quizGenerator.expired.description"),
              variant: "warning",
            });
            const channel = new BroadcastChannel("quiz-notifications");
            channel.postMessage({
              type: "quiz-failed",
              title: t("quizGenerator.toasts.expiredTitle"),
              description: t("quizGenerator.expired.description"),
              variant: "warning",
            });
            channel.close();
          },
          onProgress: (status, progress) => {
            setGenerationStatus(status);
            setGenerationProgress(
              progress || t("quizGenerator.toasts.processingStatus"),
            );
            persistGenerationState({
              quizId,
              loading: true,
              generationStatus: status,
              generationProgress:
                progress || t("quizGenerator.toasts.processingStatus"),
            });
          },
        });

        console.log("✅ Generation state restored, polling resumed");
        return true;
      } catch (error) {
        console.error("❌ Error parsing generation state:", error);
        clearPersist();
        return false;
      }
    }
    return false;
  }, [
    loading,
    quiz,
    readPersist,
    startPollingHook,
    t,
    navigate,
    refetchStats,
    statistics,
    toast,
    clearPersist,
  ]);

  // Load quiz generation state from persistence on mount (for navigation persistence)
  // And listen for global events
  useEffect(() => {
    // Initial check
    checkAndRestoreState();

    // Listener for external starts/stops
    const handleStorageUpdate = () => {
      console.log("🔄 [QuizGenerator] Detected storage/generation update");
      const state = readPersist();

      // If state is cleared but we are loading, it means external cancellation
      // UNLESS we are currently completing (race condition guard)
      if (!state && loading && !isCompletingRef.current) {
        console.log("🛑 [QuizGenerator] External cancellation detected");
        stopPolling();
        setLoading(false);
        setGenerationStatus(null);
        setGenerationProgress("");
        isSubmittingRef.current = false; // Reset submission flag
        lastSubmitTimeRef.current = 0; // Allow immediate retry
        reset(); // Reset hook state
        setQuizId(null);
        toast({
          title: t("quizGenerator.toasts.cancelledTitle"),
          description: t("quizGenerator.toasts.cancelledDesc"),
          variant: "info",
        });
      } else {
        // Otherwise try to restore
        checkAndRestoreState();
      }
    };

    window.addEventListener("generation-storage-update", handleStorageUpdate);
    window.addEventListener("storage", handleStorageUpdate); // Cross-tab

    return () => {
      window.removeEventListener(
        "generation-storage-update",
        handleStorageUpdate,
      );
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, [checkAndRestoreState, loading, readPersist, stopPolling, t, toast]);

  // Fallback: Check for saved quiz (legacy persistence check)
  useEffect(() => {
    const savedQuizId = getLegacyId();
    if (savedQuizId && !quiz && !loading) {
      // ... (existing fallback logic, keeping it separate or could merge, but riskier)
      // Keeping strict scope for now to avoid breaking legacy check logic
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
    }>,
  ) => {
    // timestamp sẽ được thêm trong hook useGenerationPersistence.write()
    writePersist({ ...partial });
  };

  // Progress UI moved to GenerationProgress component

  // Generate idempotency key to prevent duplicate requests
  const generateIdempotencyKey = (
    prompt: string,
    questionCount: string,
    userId?: string,
  ) => {
    // Use high-resolution timestamp (milliseconds) to ensure uniqueness for every distinct attempt
    // "Cancel-and-retry" flow requires a new key, and frontend already has 5s debounce for accidental double-clicks.
    const timestamp = Date.now();
    const data = `${userId || "anonymous"}-${prompt}-${questionCount}-${timestamp}`;

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
        title: t("auth.required"),
        description: t("auth.loginToCreate"),
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
        title: t("quizGenerator.toasts.enterTopic"),
        description: t("quizGenerator.toasts.enterTopicDesc"),
        variant: "warning",
      });
      return;
    }

    if (!isQuestionCountSelected) {
      toast({
        title: t("quizGenerator.toasts.selectCount"),
        description: t("quizGenerator.toasts.selectCountDesc"),
        variant: "warning",
      });
      return;
    }

    // 2. Content Validation
    if (containsVietnameseBadwords(prompt)) {
      setPromptError(t("quizGenerator.errors.profaneContent"));
      setIsPromptValid(false);
      toast({
        title: t("quizGenerator.errors.invalidTopic"),
        description: t("quizGenerator.toasts.sensitiveContent"),
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // 3. Reset State & Prepare UI
    stopPolling();
    reset();
    isCompletingRef.current = false; // Reset completion guard
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
      user?.id,
    );

    console.log("🚀 [FRONTEND] Starting async quiz generation...");

    const deviceInfo = {
      language: navigator.language,
      platform:
        "platform" in navigator
          ? ((navigator as Navigator & { platform?: string }).platform ?? "")
          : "",
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
        const errMsg =
          typeof (startError as { message?: unknown }).message === "string"
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
          title: t("quizGenerator.toasts.requestProcessed"),
          description: t("quizGenerator.toasts.requestProcessedDesc"),
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
          console.log(
            `✅ [QuizGenerator] onCompleted called. quizId=${quizId}, quiz.title=${quiz?.title}`,
          );
          isSubmittingRef.current = false;
          isCompletingRef.current = true; // Mark as completing
          if (tokenUsage) setTokenUsage(tokenUsage as TokenUsage);
          setGenerationStatus(null);
          setGenerationProgress("");
          setLoading(false);
          clearPersist();

          setQuiz(quiz); // Persist the active quiz so returning to generator shows "New Quiz" confirm

          // XP & Reward
          let title = t("quizGenerator.success.title");
          if (userRef.current) {
            const xp = calculateXP(statistics);
            const level = calculateLevel(xp);
            const reward = calculateCreateReward(level);
            title = t("notifications.zcoinReward.create", {
              amount: reward,
              xp: 100,
            });
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
            description: t("quizGenerator.success.description", {
              title: quiz.title,
              count: quiz.questions.length,
            }),
            variant: "success",
            duration: 3000,
          });

          const channel = new BroadcastChannel("quiz-notifications");
          channel.postMessage({
            type: "quiz-complete",
            title: title,
            description: t("quizGenerator.success.description", {
              title: quiz.title,
              count: quiz.questions.length,
            }),
            variant: "success",
          });
          channel.close();

          console.log(`🚀 [QuizGenerator] Navigating to /quiz/play/${quizId}`);
          navigate(`/quiz/play/${quizId}`);
        },
        onFailed: (errorMessage?: string) => {
          isSubmittingRef.current = false;
          lastSubmitTimeRef.current = 0; // Allow immediate retry or correction
          setGenerationStatus(null);
          setGenerationProgress("");
          setLoading(false);
          clearPersist();
          reset(); // Reset internal hook state

          // Cleanup: Delete the failed quiz from DB to prevent duplicate check issues
          const failedQuizId = quizId;
          if (failedQuizId) {
            supabase
              .from("quizzes")
              .delete()
              .eq("id", failedQuizId)
              .then(({ error }) => {
                if (error) {
                  console.warn(
                    `[QuizGenerator] Failed to cleanup quiz ${failedQuizId}:`,
                    error.message,
                  );
                } else {
                  console.log(
                    `[QuizGenerator] Cleaned up failed quiz ${failedQuizId}`,
                  );
                }
              });
          }
          setQuizId(null); // Clear local quizId

          const msg = errorMessage || t("quizGenerator.toasts.genericError");

          if (msg.toLowerCase().includes("daily quota limit reached")) {
            setQuotaErrorMessage(msg);
            setShowUserQuotaDialog(true);
            toast({
              title: t("quizGenerator.toasts.quotaTitle"),
              description: msg,
              variant: "warning",
            });
            return;
          }

          toast({
            title: t("quizGenerator.toasts.failedTitle"),
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
              reasonText.includes("quota") ||
              reasonText.includes("503") ||
              reasonText.includes("quá tải") ||
              reasonText.includes("service unavailable")
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
          lastSubmitTimeRef.current = 0; // Allow immediate retry
          setGenerationStatus(null);
          setGenerationProgress("");
          setLoading(false);
          clearPersist();
          reset(); // Reset internal hook state
          setQuizId(null); // Clear local quizId

          toast({
            title: t("quizGenerator.toasts.expiredTitle"),
            description: t("quizGenerator.expired.description"),
            variant: "warning",
          });
        },
        onProgress: (status, progress) => {
          if (
            status === "completed" ||
            status === "failed" ||
            status === "expired"
          )
            return;
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
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
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
      if (
        errorMessage.includes("authentication_required") ||
        errorMessage.includes("invalid") ||
        errorMessage.includes("unauthorized")
      ) {
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
    console.log(
      `[handleGenerateClick] isSubmittingRef=${isSubmittingRef.current}, lastSubmitTimeRef=${lastSubmitTimeRef.current}, now=${now}, diff=${now - lastSubmitTimeRef.current}`,
    );

    // Safety: If isSubmittingRef is still true but no actual loading is active,
    // it means onFailed wasn't called properly. Reset it.
    if (
      isSubmittingRef.current &&
      !loading &&
      !genStatus &&
      !generationStatus
    ) {
      console.warn(
        "[handleGenerateClick] Safety reset: isSubmittingRef was true but no loading state. Resetting.",
      );
      isSubmittingRef.current = false;
      lastSubmitTimeRef.current = 0;
    }

    if (isSubmittingRef.current || now - lastSubmitTimeRef.current < 5000) {
      toast({
        title: t("quizGenerator.toasts.pleaseWait"),
        description: t("quizGenerator.toasts.processing"),
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
    // 1. Backend Cancel & Cleanup
    const idToCancel = quizId || localStorage.getItem("currentQuizId");
    if (idToCancel) {
      // Notify backend to stop processing
      supabase.functions
        .invoke("generate-quiz/cancel-quiz", {
          body: { quiz_id: idToCancel },
        })
        .then(async ({ error }) => {
          if (error)
            console.error("❌ Failed to cancel quiz on backend:", error);
          else {
            console.log("✅ Quiz cancelled on backend");
            // 2. Delete the record entirely to keep DB clean
            const { error: deleteError } = await supabase
              .from("quizzes")
              .delete()
              .eq("id", idToCancel);

            if (deleteError) {
              console.warn(
                "⚠️ Failed to delete cancelled quiz record:",
                deleteError,
              );
            } else {
              console.log("🗑️ Cancelled quiz record deleted");
            }
          }
        })
        .catch((err) =>
          console.error("❌ Network error cancelling quiz:", err),
        );
    }

    // 3. Client Cleanup
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    stopPolling();
    setLoading(false);
    isSubmittingRef.current = false; // Reset submission flag
    lastSubmitTimeRef.current = 0; // Reset timestamp to allow immediate retry
    setGenerationStatus(null);
    setGenerationProgress("");
    setQuizId(null);
    reset(); // Reset internal hook state (genStatus, etc.)
    localStorage.removeItem("currentQuizGeneration");
    localStorage.removeItem("currentQuizId");

    toast({
      title: t("quizGenerator.toasts.cancelledTitle"),
      description: t("quizGenerator.toasts.cancelledDesc"),
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
        title: t("quizGenerator.toasts.musicError"),
        description: t("quizGenerator.toasts.musicErrorDesc"),
        variant: "warning",
      });
    }
  };

  // Preload PDF worker and fonts on mount to reduce first-click latency
  useEffect(() => {
    warmupPdfWorker().catch(() => {});
  }, []);

  return (
    <>
      <section
        id="generator"
        className="relative overflow-hidden bg-white dark:bg-slate-950 h-screen">
        <div className="w-full h-full relative z-10">
          {/* Quota Limit Dialog */}
          <QuotaLimitDialog
            open={showQuotaDialog}
            onOpenChange={setShowQuotaDialog}
            getTimeUntilReset={getTimeUntilReset}
          />

          {/* Auth Modal for checking login status */}
          <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
          {/* Confirm Cancel Dialog */}
          <AlertDialog
            open={showConfirmDialog}
            onOpenChange={setShowConfirmDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t("quizGenerator.confirmDialog.titleCancel")}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t("quizGenerator.confirmDialog.descriptionCancel")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {t("quizGenerator.confirmDialog.cancel")}
                </AlertDialogCancel>
                <AlertDialogAction onClick={confirmCancel}>
                  {t("quizGenerator.confirmDialog.confirm")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Confirm New Quiz Dialog */}
          <AlertDialog
            open={showNewQuizConfirm}
            onOpenChange={setShowNewQuizConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t("quizGenerator.confirmDialog.title")}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t("quizGenerator.confirmDialog.descriptionNewQuiz")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => {
                    setShowNewQuizConfirm(false);
                    setPendingGenerate(null);
                  }}>
                  {t("common.cancel")}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    setShowNewQuizConfirm(false);
                    if (pendingGenerate) {
                      setPrompt(pendingGenerate.prompt);
                      setQuestionCount(pendingGenerate.questionCount);
                      generateQuiz(); // Proceed with pending generation, forcing new
                      setPendingGenerate(null);
                    }
                  }}>
                  {t("common.confirm")}
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

          <QuickGeneratorDialog
            open={showQuickDialog}
            onOpenChange={setShowQuickDialog}
            initialTab={quickDialogTab}
          />

          <Card className="border-none bg-white dark:bg-slate-950 shadow-none rounded-none overflow-hidden ring-0 relative w-full h-full">
            <CardContent className="p-0 flex flex-col justify-center relative z-10 h-full">
              {/* Show Form OR Loading Progress */}
              {loading ? (
                <div className="flex-1 flex flex-col justify-center items-center">
                  <GenerationProgress
                    generationStatus={genStatus ?? generationStatus}
                    generationProgress={genProgress || generationProgress}
                    onCancel={handleCancelGeneration}
                  />
                </div>
              ) : (
                /* Form Input State */
                <>
                  <div className="flex flex-col items-center justify-center h-full py-12 md:py-20 space-y-12 relative w-full">
                    {/* Mascot / Visual */}
                    <div
                      className="relative group cursor-pointer scale-125"
                      onClick={handleToggleChill}>
                      <div className="absolute inset-0 bg-green-400/20 blur-[60px] rounded-full animate-pulse" />
                      {isChillPlaying ? (
                        <Mascot
                          emotion="cool"
                          className="w-40 h-40 md:w-52 md:h-52 object-contain relative z-10 drop-shadow-2xl transition-transform duration-500 animate-bounce-slow"
                          size={200}
                        />
                      ) : (
                        <img
                          src={logo}
                          alt="Mascot"
                          className={cn(
                            "w-40 h-40 md:w-52 md:h-52 object-contain relative z-10 drop-shadow-2xl transition-transform duration-500",
                            "hover:scale-110",
                          )}
                        />
                      )}
                      {/* Music Indicator Mini Badge */}
                      <div className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-slate-100">
                        {isChillPlaying ? (
                          <Music4 className="w-4 h-4 text-green-500 animate-spin-slow" />
                        ) : (
                          <Play className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                    {/* Music hint text */}
                    <p
                      className="text-sm text-slate-400 font-medium -mt-6 opacity-70 hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-2"
                      onClick={handleToggleChill}>
                      {isChillPlaying ? (
                        <>
                          <Music4 className="w-4 h-4 text-green-500" />{" "}
                          {t(
                            "quizGenerator.ui.musicPlaying",
                            "Đang phát nhạc...",
                          )}
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />{" "}
                          {t(
                            "quizGenerator.ui.musicHint",
                            "Nhấn vào mèo để phát nhạc",
                          )}
                        </>
                      )}
                    </p>
                    {/* Greeting Text */}
                    <div className="text-center space-y-4 max-w-2xl mx-auto z-10 px-4">
                      <p className="text-slate-500 font-medium text-lg md:text-xl">
                        {t(
                          "quizGenerator.ui.greetingSub",
                          "Nhập chủ đề bất kỳ để tạo bài kiểm tra trong tích tắc.",
                        )}
                      </p>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex justify-center -mb-4 z-20 relative">
                      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1 cursor-pointer hover:shadow-md transition-all">
                        <div className="px-4 py-1.5 rounded-full bg-slate-900 dark:bg-slate-700 text-white text-sm font-bold shadow-sm flex items-center gap-2">
                          <themeConfig.aiIcon className={cn("w-4 h-4", themeConfig.aiColor)} />
                          <span>AI Generator</span>
                        </div>
                        <button
                          onClick={() => navigate("/quiz/create")}
                          className="px-4 py-1.5 rounded-full text-slate-500 dark:text-slate-400 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-all flex items-center gap-2">
                          <themeConfig.manualIcon className="w-4 h-4" />
                          <span>{t("manualQuiz.title", "Manual")}</span>
                        </button>
                      </div>
                    </div>

                    {/* Main Input Pill */}
                    <div className="w-full max-w-5xl mx-auto z-20 px-4 mt-8">
                      <div
                        className={cn(
                          "flex items-center gap-2 p-2 pl-2 rounded-[2rem] md:rounded-[3rem] bg-white dark:bg-slate-900 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border-2 transition-all duration-300 transform w-full",
                          isPromptValid
                            ? themeConfig.inputBorderActive
                            : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-lg focus-within:border-orange-200 dark:focus-within:border-orange-900 focus-within:ring-4 focus-within:ring-orange-50/50 dark:focus-within:ring-orange-900/30",
                        )}>
                        {/* Settings (Question Count) */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              className={cn(
                                  "h-11 md:h-12 px-2 md:pl-2 md:pr-5 rounded-full shrink-0 font-extrabold transition-all duration-300 gap-1.5 md:gap-2 border-2",
                                isQuestionCountSelected
                                  ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:border-amber-300"
                                  : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300",
                              )}>
                              {isQuestionCountSelected ? (
                                <>
                                  <div
                                    className={cn(
                                      "flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full shadow-sm border",
                                      "bg-white dark:bg-slate-900 border-amber-100 dark:border-amber-900 text-amber-600 dark:text-amber-400",
                                    )}>
                                    <span className="text-sm md:text-base font-black">
                                      {questionCount}
                                    </span>
                                  </div>
                                  <span className="hidden md:inline text-xs uppercase tracking-wide font-bold">
                                    {t("quizGenerator.ui.questions", "Câu")}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700">
                                    <Layers className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
                                  </div>
                                  <span className="hidden md:inline text-xs font-bold">
                                    {t(
                                      "quizGenerator.ui.selectQuestionCountShort",
                                      "Số câu",
                                    )}
                                  </span>
                                </>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-80 p-5 rounded-2xl shadow-xl border-slate-100"
                            align="start"
                            side="top"
                            sideOffset={10}>
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <Target className="w-4 h-4 text-green-600" />
                                </div>
                                <h4 className="font-bold text-slate-900">
                                  {t("quizGenerator.ui.questionCount")}
                                </h4>
                              </div>
                              <p className="text-xs text-slate-500">
                                {t(
                                  "quizGenerator.ui.selectQuestionCountDesc",
                                  "Chọn số lượng câu hỏi cho bài kiểm tra của bạn.",
                                )}
                              </p>
                              <div className="grid grid-cols-5 gap-2">
                                {["10", "15", "20", "25", "30"].map((count) => (
                                  <button
                                    key={count}
                                    onClick={() => {
                                      setQuestionCount(count);
                                      setIsQuestionCountSelected(true);
                                    }}
                                    className={cn(
                                      "h-10 rounded-xl text-sm font-bold transition-all border-2",
                                      questionCount === count
                                        ? "bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/30 scale-105"
                                        : "bg-white text-slate-600 border-slate-100 hover:border-green-200 hover:bg-green-50 hover:text-green-700",
                                    )}>
                                    {count}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>

                        {/* Input Field */}
                        <div className="flex-1 px-4 flex items-center">
                          <Textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={t(
                              "quizGenerator.ui.inputPlaceholder",
                              "Nhập chủ đề...",
                            )}
                            className="min-h-[32px] max-h-[200px] w-full bg-transparent !border-0 !border-transparent !shadow-none !ring-0 !ring-offset-0 focus-visible:!ring-0 focus-visible:!ring-offset-0 focus:!ring-0 focus:!border-0 focus:!outline-none !outline-none resize-none text-2xl text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-500 font-medium leading-relaxed p-0"
                            rows={1}
                            onInput={(e) => {
                              // Auto-grow hack
                              const target = e.target as HTMLTextAreaElement;
                              target.style.height = "auto";
                              target.style.height = `${target.scrollHeight}px`;
                            }}
                          />
                        </div>

                        {/* Generate Button */}
                        <Button
                          onClick={handleGenerateClick}
                          disabled={
                            loading ||
                            !isPromptValid ||
                            !isQuestionCountSelected
                          }
                          size="icon"
                          className={cn(
                            "h-11 w-11 md:h-12 md:w-12 rounded-full shrink-0 transition-all duration-300 shadow-md flex items-center justify-center",
                            isPromptValid && isQuestionCountSelected
                              ? cn(themeConfig.generateBtnGradient, (profileData?.equipped_theme === "theme_comic_manga" ? "bg-amber-400" : "bg-gradient-to-tr" ), "text-white hover:scale-105 active:scale-95")
                              : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed",
                          )}>
                          {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <themeConfig.generateIcon className={cn("w-5 h-5 md:w-6 md:h-6", themeConfig.generateIconClass)} />
                          )}
                        </Button>
                      </div>

                      {/* Validation Hint Message if valid but no count selected */}
                      <div className="absolute top-full left-0 w-full flex justify-center mt-6">
                        {!isQuestionCountSelected &&
                          prompt.length > 3 &&
                          !promptError && (
                            <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-6 py-3 rounded-full text-base font-bold animate-bounce-slow shadow-xl border-2 border-orange-200 relative z-30">
                              <ArrowUp className="w-5 h-5 -rotate-90" />
                              <span>
                                {t(
                                  "quizGenerator.ui.selectQuestionCountHint",
                                  'Chọn số lượng câu hỏi ở nút "Số câu"',
                                )}
                              </span>
                            </div>
                          )}
                      </div>

                      {/* Quota Bar (Subtle) */}
                      {user && (
                        <div className="mt-12 flex justify-center opacity-80 hover:opacity-100 transition-opacity">
                          {hasApiKey ? (
                            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full px-5 py-2.5 flex items-center gap-3 border-2 border-orange-100 dark:border-orange-900/50 shadow-[0_4px_20px_rgba(251,146,60,0.2)] hover:scale-105 transition-transform cursor-default scale-110">
                              <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-full p-1.5 shadow-inner">
                                <Zap className="w-4 h-4 text-white fill-white" />
                              </div>
                              <span className="text-sm font-black bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent uppercase tracking-wider pr-2">
                                UNLIMITED PLAN
                              </span>
                            </div>
                          ) : (
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-full px-4 py-1.5 flex items-center gap-3 border border-slate-100 dark:border-slate-800">
                              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                                Daily Limit
                              </span>
                              <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-green-500 rounded-full"
                                  style={{
                                    width: `${Math.min(100, (userRemaining / userLimit) * 100)}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                {userRemaining}/{userLimit}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
};

export default QuizGenerator;
