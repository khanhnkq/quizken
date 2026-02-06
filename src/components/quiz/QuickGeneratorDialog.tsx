import * as React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { containsVietnameseBadwords } from "@/lib/vnBadwordsFilter";
import { useAnonQuota } from "@/hooks/useAnonQuota";
import { QuotaLimitDialog } from "./QuotaLimitDialog";
import { QuotaExceededDialog } from "./QuotaExceededDialog";
import { GenerationProgress } from "./GenerationProgress";
import { ChatInterface } from "./ChatInterface";
import { ManualQuizEditor } from "./ManualQuizEditor";
import useQuizGeneration from "@/hooks/useQuizGeneration";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { calculateXP, calculateLevel, calculateCreateReward } from "@/utils/levelSystem";
import type { Quiz } from "@/types/quiz";
import { useUserQuota } from "@/hooks/useUserQuota";
import { useQuizProgress } from "@/hooks/useQuizProgress";
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
import { useGenerationPersistence } from "@/hooks/useGenerationPersistence";
import { ApiKeyErrorDialog } from "./ApiKeyErrorDialog";
import { FileUploadInterface } from "./FileUploadInterface";
import { Sparkles, PenLine, ArrowLeft, X, Upload } from "lucide-react";
import logo from "@/assets/logo/logo.png";
import { useProfile } from "@/hooks/useProfile";
import { VietnamMapIcon, VietnamStarIcon, VietnamDrumIcon, VietnamLotusIcon } from "@/components/icons/VietnamIcons";
import { NeonBoltIcon, NeonCyberSkullIcon, PastelCloudIcon, PastelHeartIcon, ComicPowIcon, ComicBoomIcon } from "@/components/icons/ThemeIcons";
import { cn } from "@/lib/utils";

interface QuickGeneratorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialTab?: "ai" | "manual" | "file" | null;
}

export function QuickGeneratorDialog({ open, onOpenChange, initialTab = null }: QuickGeneratorDialogProps) {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const { statistics, refetch: refetchStats } = useDashboardStats(user?.id);
    const { hasReachedLimit, getTimeUntilReset } = useAnonQuota();
    const {
        remaining: userRemaining,
        limit: userLimit,
        hasApiKey,
        hasReachedLimit: userReachedLimit,
        refetch: refetchQuota,
    } = useUserQuota(user?.id);
    const { hasProgress, clear: clearQuizProgress } = useQuizProgress();
    const { read: readPersist, write: writePersist, clear: clearPersist } = useGenerationPersistence();
    const { profileData } = useProfile(user?.id);

    const themeConfig = React.useMemo(() => {
        const theme = profileData?.equipped_theme;
        switch (theme) {
            case 'theme_vietnam_spirit':
                return {
                    manualIcon: VietnamLotusIcon,
                    manualGradient: "from-pink-500 to-rose-500",
                };
            case 'theme_neon_night':
                return {
                    manualIcon: NeonCyberSkullIcon,
                    manualGradient: "from-cyan-500 to-blue-600",
                };
            case 'theme_pastel_dream':
                return {
                    manualIcon: PastelHeartIcon,
                    manualGradient: "from-pink-300 to-purple-400",
                };
            case 'theme_comic_manga':
                return {
                    manualIcon: ComicPowIcon,
                    manualGradient: "from-yellow-400 to-orange-500 border-2 border-black",
                };
            default:
                return {
                    manualIcon: PenLine,
                    manualGradient: "from-emerald-500 to-teal-500",
                };
        }
    }, [profileData?.equipped_theme]);

    // State
    const [prompt, setPrompt] = useState("");
    const [questionCount, setQuestionCount] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [generationStatus, setGenerationStatus] = useState<string | null>(null);
    const [generationProgress, setGenerationProgress] = useState("");
    const [promptError, setPromptError] = useState("");
    const [showQuotaDialog, setShowQuotaDialog] = useState(false);
    const [showUserQuotaDialog, setShowUserQuotaDialog] = useState(false);
    const [quotaErrorMessage, setQuotaErrorMessage] = useState("");
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [showNewQuizConfirm, setShowNewQuizConfirm] = useState(false);
    const [currentQuizId, setCurrentQuizId] = useState<string | null>(null);
    const [showApiKeyErrorDialog, setShowApiKeyErrorDialog] = useState(false);
    const [apiKeyError, setApiKeyError] = useState("");
    const [activeTab, setActiveTab] = useState<"ai" | "manual" | "file" | null>(initialTab);

    // Update activeTab when dialog opens with specific tab
    useEffect(() => {
        if (open && initialTab) {
            setActiveTab(initialTab);
        } else if (open && !initialTab) {
            // Reset to null (selection mode) if no initial tab provided when opening
            // But only if we want to reset selection on every open?
            // Let's keep existing state unless initialTab is constrained.
            // Actually, if initialTab is null, we might want to respect current state or reset?
            // Safer to just set it if initialTab is provided.
        }
    }, [open, initialTab]);

    // Refs
    const userRef = useRef(user);
    const currentQuizIdRef = useRef<string | null>(null);
    const isCompletingRef = useRef<boolean>(false);
    useEffect(() => { userRef.current = user; }, [user]);

    // Quiz generation hook
    const { status: genStatus, progress: genProgress, startPolling, stopPolling, reset } = useQuizGeneration<Quiz>();

    // Sync state with persistence (Restore on open + Listen for external changes)
    useEffect(() => {
        const syncState = () => {
            const state = readPersist();

            // Case 1: External Start (or Restore)
            if (state && (state.generationStatus === 'processing' || state.generationStatus === 'pending')) {
                // Always start polling to receive error callbacks, even if dialog is closed
                if (!loading) {
                    console.log("▶️ [QuickGen] Restoring active generation state (dialog open:", open, ")");
                    setLoading(true);
                    setGenerationStatus(state.generationStatus);
                    setGenerationProgress(state.generationProgress);
                    setCurrentQuizId(state.quizId);
                    currentQuizIdRef.current = state.quizId;

                    startPolling(state.quizId, {
                        onCompleted: ({ quiz }) => {
                            console.log(`✅ [QuickGen] onCompleted called. quizId=${state.quizId}, quiz.title=${quiz?.title}`);
                            isCompletingRef.current = true;
                            setLoading(false);
                            setGenerationStatus(null);
                            setGenerationProgress("");
                            clearPersist();

                            if (userRef.current) {
                                const xp = calculateXP(statistics);
                                const level = calculateLevel(xp);
                                const reward = calculateCreateReward(level);
                                refetchStats();
                                refetchQuota();
                            }

                            toast({
                                title: t("quizGenerator.success.title"),
                                description: t("quizGenerator.success.description", { title: quiz.title, count: quiz.questions.length }),
                                variant: "success",
                                duration: 3000,
                            });

                            console.log(`🚀 [QuickGen] Navigating to /quiz/play/${state.quizId}`);
                            onOpenChange(false);
                            navigate(`/quiz/play/${state.quizId}`);
                        },
                        onFailed: (errorMessage) => {
                            setLoading(false);
                            setGenerationStatus(null);
                            setGenerationProgress("");
                            clearPersist();

                            // Cleanup: Delete the failed quiz from DB
                            if (state.quizId) {
                                supabase.from("quizzes").delete().eq("id", state.quizId)
                                    .then(({ error }) => {
                                        if (error) {
                                            console.warn(`[QuickGen] Failed to cleanup quiz ${state.quizId}:`, error.message);
                                        } else {
                                            console.log(`[QuickGen] Cleaned up failed quiz ${state.quizId}`);
                                        }
                                    });
                            }

                            const msg = errorMessage || t("quizGenerator.toasts.genericError");
                            if (msg.toLowerCase().includes("daily quota limit reached")) {
                                setQuotaErrorMessage(msg);
                                setShowUserQuotaDialog(true);
                                return;
                            }

                            toast({
                                title: t("quizGenerator.toasts.failedTitle"),
                                description: msg,
                                variant: "destructive",
                            });
                            // API Key checks + Service errors
                            const reasonText = String(errorMessage || "").toLowerCase();
                            if (
                                reasonText.includes("authentication") ||
                                reasonText.includes("unauthorized") ||
                                reasonText.includes("invalid") ||
                                reasonText.includes("api key") ||
                                reasonText.includes("forbidden") ||
                                reasonText.includes("rate limit") ||
                                reasonText.includes("503") ||
                                reasonText.includes("quá tải") ||
                                reasonText.includes("service unavailable")
                            ) {
                                setApiKeyError(errorMessage || msg);
                                setShowApiKeyErrorDialog(true);
                            }
                        },
                        onExpired: () => {
                            setLoading(false);
                            setGenerationStatus(null);
                            setGenerationProgress("");
                            clearPersist();
                            toast({
                                title: t("quizGenerator.toasts.expiredTitle"),
                                description: t("quizGenerator.toasts.expiredDescription"),
                                variant: "warning",
                            });
                        },
                        onProgress: (status, progress) => {
                            setGenerationStatus(status);
                            setGenerationProgress(progress || t("quizGenerator.toasts.processingStatus"));

                            // Only persist active states
                            if (status === 'processing' || status === 'pending') {
                                writePersist({
                                    quizId: state.quizId,
                                    loading: true,
                                    generationStatus: status,
                                    generationProgress: progress || t("quizGenerator.toasts.processingStatus"),
                                });
                            }
                        },
                    });
                }
            }
            // Case 2: External Cancel
            else if (!state && loading && !isCompletingRef.current) {
                console.log("🛑 [QuickGen] External cancellation detected");
                stopPolling();
                setLoading(false);
                setGenerationStatus(null);
                setGenerationProgress("");

                // Only show toast if dialog is OPEN. If closed, just silent reset.
                if (open) {
                    toast({
                        title: t('quizGenerator.toasts.cancelledTitle'),
                        description: t('quizGenerator.toasts.cancelledDesc'),
                        variant: "info",
                    });
                }
            }
        };

        // Initial Sync
        syncState();

        // Listen for updates
        window.addEventListener("generation-storage-update", syncState);
        window.addEventListener("storage", syncState);

        return () => {
            window.removeEventListener("generation-storage-update", syncState);
            window.removeEventListener("storage", syncState);
        };
    }, [open, loading, readPersist, startPolling, stopPolling, clearPersist, navigate, t, toast, refetchStats, refetchQuota, statistics, writePersist, onOpenChange]);

    // Validate prompt
    const validatePrompt = useCallback((input: string) => {
        const trimmed = input.trim();
        if (trimmed.length === 0) {
            setPromptError("");
            return false;
        }
        if (containsVietnameseBadwords(trimmed)) {
            setPromptError(t("quizGenerator.toasts.profanity"));
            return false;
        }
        if (trimmed.length < 5) {
            setPromptError(t("quizGenerator.errors.minLength"));
            return false;
        }
        if (trimmed.length > 500) {
            setPromptError(t("quizGenerator.toasts.maxLength"));
            return false;
        }
        setPromptError("");
        return true;
    }, [t]);

    // Handle generate
    const handleGenerate = async () => {
        // Strict Auth Check - No more anonymous generation
        if (!user) {
            toast({
                title: t('auth.required'),
                description: t('auth.loginToCreate'),
                variant: "warning",
                duration: 3000,
            });
            return;
        }

        // Check quota before starting
        if (userReachedLimit) {
            setShowUserQuotaDialog(true);
            setQuotaErrorMessage(t('quizGenerator.quota.exceeded'));
            return;
        }

        // Check for existing quiz progress and show confirmation
        if (hasProgress) {
            setShowNewQuizConfirm(true);
            return;
        }

        // Continue with actual generation
        await proceedWithGeneration();
    };

    // Actual generation logic - accepts optional overrides from ChatInterface
    const proceedWithGeneration = async (
        overridePrompt?: string, 
        overrideCount?: string,
        overrideFastMode?: boolean,
        overrideDifficulty?: string
    ) => {
        const activePrompt = overridePrompt ?? prompt;
        const activeCount = overrideCount ?? questionCount;

        // Apply Fast Mode prompt optimization if enabled
        const promptToSend = activePrompt;
        console.log(`[QuickGenerator] Proceeding with: prompt="${promptToSend}", count=${activeCount}, difficulty=${overrideDifficulty}`);

        const isValid = validatePrompt(activePrompt);
        if (!isValid) {
            console.warn(`[QuickGenerator] Validation failed for prompt: "${activePrompt}"`);
            toast({
                title: t("quizGenerator.errors.invalidPrompt"), // Ensure this key exists or use a fallback
                description: promptError || t("quizGenerator.errors.checkInput"),
                variant: "destructive",
            });
            return;
        }

        if (!activeCount) {
            console.warn("[QuickGenerator] Missing question count");
            toast({
                title: t("quizGenerator.toasts.selectCount"),
                description: t("quizGenerator.toasts.selectCountDesc"),
                variant: "warning",
            });
            return;
        }

        console.log("[QuickGenerator] Setting loading state to TRUE");
        setLoading(true);
        isCompletingRef.current = false; // Reset completion guard
        setGenerationStatus("pending");
        setGenerationProgress(t("quizGenerator.toasts.preparing"));

        try {
            // Device info
            const deviceInfo = {
                language: navigator.language,
                platform: (navigator as any).platform ?? "",
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                userAgent: navigator.userAgent,
                screen: {
                    width: window.screen?.width,
                    height: window.screen?.height,
                    colorDepth: window.screen?.colorDepth,
                },
            };

            // Idempotency key (use ms to allow quick retries)
            const timestamp = Date.now();
            const idempotencyKey = `quick_${user?.id || "anon"}_${timestamp}`;

            // Start quiz generation
            const { data: startResponse, error: startError } = await supabase.functions.invoke<{
                id: string;
                duplicate?: boolean;
            }>("generate-quiz/start-quiz", {
                body: {
                    prompt: promptToSend,
                    device: deviceInfo,
                    questionCount: parseInt(activeCount),
                    idempotencyKey,
                    language: i18n.language,
                    difficulty: overrideDifficulty || "mixed",
                    fastMode: overrideFastMode ?? false,
                },
            });

            if (startError || !startResponse?.id) {
                throw new Error(startError?.message || "Failed to start quiz generation");
            }

            const quizId = startResponse.id;
            setCurrentQuizId(quizId);
            currentQuizIdRef.current = quizId;

            // Persist initial state
            writePersist({
                quizId,
                loading: true,
                generationStatus: "pending",
                generationProgress: t("quizGenerator.toasts.preparing"),
            });

            // Start polling
            startPolling(quizId, {
                onCompleted: ({ quiz }) => {
                    isCompletingRef.current = true; // Mark as completing
                    setLoading(false);
                    setGenerationStatus(null);
                    setGenerationProgress("");

                    // Clear persistence
                    clearPersist();

                    // Calculate reward
                    let title = t("quizGenerator.success.title");
                    if (userRef.current) {
                        const xp = calculateXP(statistics);
                        const level = calculateLevel(xp);
                        const reward = calculateCreateReward(level);
                        title = t("notifications.zcoinReward.create", { amount: reward, xp: 100 });
                    }

                    refetchStats();
                    refetchQuota(); // Refresh quota display after quiz generation
                    toast({
                        title,
                        description: t("quizGenerator.success.description", { title: quiz.title, count: quiz.questions.length }),
                        variant: "success",
                        duration: 3000,
                    });

                    // Close dialog and navigate
                    onOpenChange(false);
                    navigate(`/quiz/play/${quizId}`);
                },
                onFailed: (errorMessage) => {
                    setLoading(false);
                    setGenerationStatus(null);
                    setGenerationProgress("");

                    // Clear persistence
                    clearPersist();

                    const msg = errorMessage || t("quizGenerator.toasts.genericError");

                    // Check for User Quota Exceeded
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
                        title: t("quizGenerator.toasts.failedTitle"),
                        description: msg,
                        variant: "destructive",
                    });

                    // Check for API Key + Service errors
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
                },
                onExpired: () => {
                    setLoading(false);
                    setGenerationStatus(null);
                    setGenerationProgress("");
                    clearPersist();

                    toast({
                        title: t("quizGenerator.toasts.expiredTitle"),
                        description: t("quizGenerator.expired.description"),
                        variant: "warning",
                    });
                },
                onProgress: (status, progress) => {
                    setGenerationStatus(status);
                    setGenerationProgress(progress || t("quizGenerator.toasts.processingStatus"));

                    // Update persistence
                    writePersist({
                        quizId,
                        loading: true,
                        generationStatus: status,
                        generationProgress: progress || t("quizGenerator.toasts.processingStatus"),
                    });
                },
            });

        } catch (error) {
            setLoading(false);
            setGenerationStatus(null);
            setGenerationProgress("");
            // Clear persistence on immediate error
            clearPersist();

            toast({
                title: t("quizGenerator.toasts.failedTitle"),
                description: (error as Error).message,
                variant: "destructive",
            });
        }
    };

    // Reset state when dialog closes
    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen && !loading) {
            setPrompt("");
            setQuestionCount("");
            setPromptError("");
            setGenerationStatus(null);
            setGenerationProgress("");
            stopPolling();
            reset();
        }
        onOpenChange(newOpen);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="max-w-2xl p-0 overflow-hidden bg-transparent border-none shadow-none sm:max-w-2xl [&>button]:hidden">
                    {/* Visually hidden title for accessibility */}
                    <DialogTitle className="sr-only">{t("quickGenerator.title")}</DialogTitle>
                    <DialogDescription className="sr-only">{t("quickGenerator.description")}</DialogDescription>

                    {loading ? (
                        /* Loading State - Show Cute Progress */
                        <div className={cn(
                            "relative overflow-hidden border-2 shadow-2xl rounded-3xl p-8",
                            profileData?.equipped_theme === 'theme_comic_manga'
                                ? "bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                                : "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-primary/10 dark:border-primary/20"
                        )}>
                            <GenerationProgress
                                generationStatus={genStatus ?? generationStatus ?? "processing"}
                                generationProgress={genProgress || generationProgress || t("quizGenerator.toasts.preparing")}
                                onCancel={() => setShowCancelConfirm(true)}
                            />
                        </div>
                    ) : activeTab === null ? (
                        /* Mode Selection - Messenger/Telegram Style */
                        <div className={cn(
                            "shadow-2xl rounded-3xl overflow-hidden border-2",
                            profileData?.equipped_theme === 'theme_comic_manga'
                                ? "bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                                : "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-primary/10 dark:border-primary/20"
                        )}>
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t("quickGenerator.title")}</h2>
                                <button 
                                    onClick={() => onOpenChange(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>
                            
                            {/* Chat Room List */}
                            <div className="divide-y divide-gray-100 dark:divide-slate-800">
                                {/* AI Mode Row */}
                                <button
                                    onClick={() => setActiveTab("ai")}
                                    className={cn(
                                        "w-full flex items-center gap-4 px-4 py-4 transition-colors text-left group border-b",
                                        profileData?.equipped_theme === 'theme_comic_manga'
                                            ? "hover:bg-yellow-400/10 border-black"
                                            : "hover:bg-gray-50 dark:hover:bg-slate-800/60 border-gray-100 dark:border-slate-800"
                                    )}
                                >
                                    <div className="relative shrink-0">
                                        <div className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border transition-colors",
                                            profileData?.equipped_theme === 'theme_comic_manga'
                                                ? "bg-yellow-400 border-2 border-black"
                                                : "bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900 dark:to-indigo-900 border-transparent dark:border-white/10 group-hover:dark:border-white/20"
                                        )}>
                                            <img src={logo} alt="AI Bot" className="w-10 h-10 object-contain" />
                                        </div>
                                        {/* Online indicator */}
                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">{t("modeSelection.aiTitle")}</h3>
                                            <span className="text-xs text-violet-600 dark:text-violet-300 font-medium bg-violet-100 dark:bg-violet-900/50 px-2 py-0.5 rounded-full border border-violet-200 dark:border-violet-700/50">HOT</span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">{t("modeSelection.aiDescription")}</p>
                                    </div>
                                    <div className="shrink-0 text-gray-400 dark:text-slate-600 group-hover:text-primary dark:group-hover:text-primary transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                                
                                {/* Manual Mode Row */}
                                <button
                                    onClick={() => setActiveTab("manual")}
                                    className={cn(
                                        "w-full flex items-center gap-4 px-4 py-4 transition-colors text-left group",
                                        profileData?.equipped_theme === 'theme_comic_manga'
                                            ? "hover:bg-orange-400/10"
                                            : "hover:bg-gray-50 dark:hover:bg-slate-800"
                                    )}
                                >
                                    <div className="relative shrink-0">
                                        <div className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center border transition-colors",
                                            profileData?.equipped_theme === 'theme_comic_manga'
                                                ? "bg-orange-400 border-2 border-black"
                                                : cn("bg-gradient-to-br border-transparent dark:border-white/10 group-hover:dark:border-white/20", themeConfig.manualGradient)
                                        )}>
                                            <themeConfig.manualIcon className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">{t("manualQuiz.title")}</h3>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">{t("modeSelection.manualDescription")}</p>
                                    </div>
                                    <div className="shrink-0 text-gray-400 dark:text-slate-600 group-hover:text-primary dark:group-hover:text-primary transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                                
                                {/* File Upload Mode Row */}
                                <button
                                    onClick={() => setActiveTab("file")}
                                    className={cn(
                                        "w-full flex items-center gap-4 px-4 py-4 transition-colors text-left group border-t border-gray-100 dark:border-slate-800",
                                        profileData?.equipped_theme === 'theme_comic_manga'
                                            ? "hover:bg-blue-400/10 border-black"
                                            : "hover:bg-gray-50 dark:hover:bg-slate-800"
                                    )}
                                >
                                    <div className="relative shrink-0">
                                        <div className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center border transition-colors",
                                            profileData?.equipped_theme === 'theme_comic_manga'
                                                ? "bg-blue-400 border-2 border-black"
                                                : "bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 border-transparent dark:border-white/10 group-hover:dark:border-white/20"
                                        )}>
                                            <Upload className={cn("w-6 h-6", profileData?.equipped_theme === 'theme_comic_manga' ? "text-white" : "text-blue-600 dark:text-blue-300")} />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">Upload File (PDF/Image)</h3>
                                            <span className="text-xs text-blue-600 dark:text-blue-300 font-medium bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-700/50">BETA</span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">Generate quiz from study materials</p>
                                    </div>
                                    <div className="shrink-0 text-gray-400 dark:text-slate-600 group-hover:text-primary dark:group-hover:text-primary transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                            </div>
                        </div>
                    ) : activeTab === "ai" ? (
                        /* AI Chat Interface */

                        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-primary/10 dark:border-primary/20 shadow-2xl rounded-3xl overflow-hidden h-[600px] flex flex-col">
                            <ChatInterface
                                onComplete={(topic, count, fastMode, difficulty) => {
                                    setPrompt(topic);
                                    setQuestionCount(count);
                                    proceedWithGeneration(topic, count, fastMode, difficulty);
                                }}
                                onCancel={() => setActiveTab(null)}
                                userRemaining={userRemaining}
                                userLimit={userLimit}
                                hasApiKey={hasApiKey}
                                isComic={profileData?.equipped_theme === 'theme_comic_manga'}
                            />
                        </div>
                    ) : activeTab === "file" ? (
                        /* File Upload Interface */
                        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-primary/10 dark:border-primary/20 shadow-2xl rounded-3xl overflow-hidden h-[600px] flex flex-col">
                            <FileUploadInterface
                                onComplete={(quizId) => {
                                    onOpenChange(false);
                                    navigate(`/quiz/play/${quizId}`);
                                }}
                                onCancel={() => setActiveTab(null)}
                                isComic={profileData?.equipped_theme === 'theme_comic_manga'}
                            />
                        </div>
                    ) : (
                        /* Manual Quiz Editor */
                        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-primary/10 dark:border-primary/20 shadow-2xl rounded-3xl overflow-hidden">
                            <ManualQuizEditor
                                onComplete={(quizId) => {
                                    onOpenChange(false);
                                    navigate(`/quiz/play/${quizId}`);
                                }}
                                onCancel={() => setActiveTab(null)}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <QuotaLimitDialog
                open={showQuotaDialog}
                onOpenChange={setShowQuotaDialog}
                getTimeUntilReset={getTimeUntilReset}
            />

            <QuotaExceededDialog
                open={showUserQuotaDialog}
                onOpenChange={setShowUserQuotaDialog}
                message={quotaErrorMessage}
            />

            <ApiKeyErrorDialog
                open={showApiKeyErrorDialog}
                onOpenChange={setShowApiKeyErrorDialog}
                errorMessage={apiKeyError}
            />

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('quizGenerator.confirmDialog.titleCancel')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('quizGenerator.confirmDialog.descriptionCancel')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('quizGenerator.confirmDialog.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            // 1. Backend Cancel - call API to stop generation on server
                            const idToCancel = currentQuizIdRef.current || currentQuizId;
                            console.log("🛑 Cancelling quiz with ID:", idToCancel);

                            if (idToCancel) {
                                supabase.functions.invoke('generate-quiz/cancel-quiz', {
                                    body: { quiz_id: idToCancel }
                                }).then(async ({ error }) => {
                                    if (error) console.error("❌ Failed to cancel quiz on backend:", error);
                                    else {
                                        console.log("✅ Quiz cancelled on backend");
                                        // Delete the record entirely to keep DB clean
                                        const { error: deleteError } = await supabase
                                            .from('quizzes')
                                            .delete()
                                            .eq('id', idToCancel);

                                        if (deleteError) {
                                            console.warn("⚠️ Failed to delete cancelled quiz record:", deleteError);
                                        } else {
                                            console.log("🗑️ Cancelled quiz record deleted");
                                        }
                                    }
                                }).catch(err => console.error("❌ Network error cancelling quiz:", err));
                            } else {
                                console.warn("⚠️ No quiz ID to cancel");
                            }

                            // 2. Stop polling first
                            stopPolling();
                            reset();

                            // 3. Reset local state
                            setShowCancelConfirm(false);
                            setLoading(false);
                            setGenerationStatus(null);
                            setGenerationProgress("");
                            setCurrentQuizId(null);
                            currentQuizIdRef.current = null;

                            // Important: Clear global persistence too
                            clearPersist();

                            // 4. Show toast
                            toast({
                                title: t('quizGenerator.toasts.cancelledTitle'),
                                description: t('quizGenerator.toasts.cancelledDesc'),
                                variant: "info",
                            });

                            // 5. Close dialog
                            onOpenChange(false);
                        }}>
                            {t('quizGenerator.confirmDialog.confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* New Quiz Confirmation Dialog */}
            <AlertDialog open={showNewQuizConfirm} onOpenChange={setShowNewQuizConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('quizGenerator.confirmDialog.titleNewQuiz')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('quizGenerator.confirmDialog.descriptionNewQuiz')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('quizGenerator.confirmDialog.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={async () => {
                            setShowNewQuizConfirm(false);
                            await clearQuizProgress();
                            await proceedWithGeneration();
                        }}>
                            {t('quizGenerator.confirmDialog.confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

// Adding default export to satisfy Fast Refresh and lazy loading
export default QuickGeneratorDialog;
