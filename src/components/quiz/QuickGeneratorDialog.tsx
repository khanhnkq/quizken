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

interface QuickGeneratorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function QuickGeneratorDialog({ open, onOpenChange }: QuickGeneratorDialogProps) {
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
    const proceedWithGeneration = async (overridePrompt?: string, overrideCount?: string) => {
        const activePrompt = overridePrompt ?? prompt;
        const activeCount = overrideCount ?? questionCount;

        console.log(`[QuickGenerator] Proceeding with: prompt="${activePrompt}", count=${activeCount}`);

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
                    prompt: activePrompt,
                    device: deviceInfo,
                    questionCount: parseInt(activeCount),
                    idempotencyKey,
                    language: i18n.language,
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
                        <div className="relative overflow-hidden bg-white/95 backdrop-blur-xl border-2 border-primary/10 shadow-2xl rounded-3xl p-8">
                            <GenerationProgress
                                generationStatus={genStatus ?? generationStatus ?? "processing"}
                                generationProgress={genProgress || generationProgress || t("quizGenerator.toasts.preparing")}
                                onCancel={() => setShowCancelConfirm(true)}
                            />
                        </div>
                    ) : (
                        /* Chat Interface - Full Experience */
                        <ChatInterface
                            onComplete={(topic, count) => {
                                setPrompt(topic);
                                setQuestionCount(count);
                                proceedWithGeneration(topic, count);
                            }}
                            onCancel={() => onOpenChange(false)}
                            userRemaining={userRemaining}
                            userLimit={userLimit}
                            hasApiKey={hasApiKey}
                        />
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
