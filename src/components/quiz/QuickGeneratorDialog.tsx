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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2, Target, XCircle, Clock, Zap } from "lucide-react";
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
import { cn } from "@/lib/utils";
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

    // Refs
    const userRef = useRef(user);
    const currentQuizIdRef = useRef<string | null>(null);
    useEffect(() => { userRef.current = user; }, [user]);

    // Quiz generation hook
    const { status: genStatus, progress: genProgress, startPolling, stopPolling, reset } = useQuizGeneration<Quiz>();

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

        if (!validatePrompt(activePrompt)) return;
        if (!activeCount) {
            toast({
                title: t("quizGenerator.toasts.selectCount"),
                description: t("quizGenerator.toasts.selectCountDesc"),
                variant: "warning",
            });
            return;
        }

        setLoading(true);
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

            // Idempotency key
            const timestamp = Math.floor(Date.now() / (1000 * 60));
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

            // Start polling
            startPolling(quizId, {
                onCompleted: ({ quiz }) => {
                    setLoading(false);
                    setGenerationStatus(null);
                    setGenerationProgress("");

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
                },
                onExpired: () => {
                    setLoading(false);
                    setGenerationStatus(null);
                    setGenerationProgress("");
                    toast({
                        title: t("quizGenerator.toasts.expiredTitle"),
                        description: t("quizGenerator.expired.description"),
                        variant: "warning",
                    });
                },
                onProgress: (status, progress) => {
                    setGenerationStatus(status);
                    setGenerationProgress(progress || t("quizGenerator.toasts.processingStatus"));
                },
            });

        } catch (error) {
            setLoading(false);
            setGenerationStatus(null);
            setGenerationProgress("");
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
                                }).then(({ error }) => {
                                    if (error) console.error("❌ Failed to cancel quiz on backend:", error);
                                    else console.log("✅ Quiz cancelled on backend");
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

export default QuickGeneratorDialog;
