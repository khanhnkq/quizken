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

    // Refs
    const userRef = useRef(user);
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

    // Actual generation logic
    const proceedWithGeneration = async () => {
        if (!validatePrompt(prompt)) return;
        if (!questionCount) {
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
                    prompt,
                    device: deviceInfo,
                    questionCount: parseInt(questionCount),
                    idempotencyKey,
                    language: i18n.language,
                },
            });

            if (startError || !startResponse?.id) {
                throw new Error(startError?.message || "Failed to start quiz generation");
            }

            const quizId = startResponse.id;

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
                <DialogContent className="max-w-xl p-0 overflow-hidden bg-transparent border-none shadow-none sm:max-w-xl">
                    <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl border-4 border-primary/20 shadow-[0_8px_30px_rgba(0,0,0,0.08)] rounded-[2rem]">
                        <DialogHeader className="p-6 md:p-8 space-y-4 pb-2">
                            <div className="flex items-center justify-between">
                                <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
                                    <div className="p-2.5 bg-primary/10 rounded-xl">
                                        <Sparkles className="w-6 h-6 text-primary" />
                                    </div>
                                    {t("quickGenerator.title")}
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-base text-muted-foreground">
                                {t("quickGenerator.description")}
                            </DialogDescription>

                            {/* Compact Quota UI */}
                            {user && (
                                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50/80 to-indigo-50/80 border border-purple-100">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-purple-500" />
                                        <span className="text-xs font-bold text-purple-600 uppercase tracking-wide">
                                            {t("quizGenerator.quota.usage")}
                                        </span>
                                    </div>
                                    {hasApiKey ? (
                                        <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                                            <Zap className="w-4 h-4" />
                                            {t("quizGenerator.quota.unlimited")}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 bg-white/60 rounded-full overflow-hidden border border-purple-100">
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
                                            <span className="text-sm font-bold text-purple-700">
                                                {userRemaining}/{userLimit}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </DialogHeader>

                        <div className="p-6 md:p-8 pt-0 space-y-6">
                            {loading ? (
                                /* Loading State - Show Progress */
                                <div className="py-8">
                                    <GenerationProgress
                                        generationStatus={genStatus ?? generationStatus ?? "processing"}
                                        generationProgress={genProgress || generationProgress || t("quizGenerator.toasts.preparing")}
                                        onCancel={() => setShowCancelConfirm(true)}
                                    />
                                </div>
                            ) : (
                                /* Form State - Show Input */
                                <>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm font-bold text-foreground">
                                                {t("quizGenerator.ui.topicLabel")}
                                            </label>
                                            <Badge variant="secondary" className="rounded-lg px-1.5 py-0.5 text-[10px] font-bold border border-border">
                                                {t("quizGenerator.ui.required")}
                                            </Badge>
                                        </div>
                                        <div className="relative group">
                                            <Textarea
                                                placeholder={t("quizGenerator.promptPlaceholder")}
                                                value={prompt}
                                                onChange={(e) => {
                                                    setPrompt(e.target.value);
                                                    validatePrompt(e.target.value);
                                                }}
                                                className={cn(
                                                    "min-h-[120px] resize-none text-base p-5 rounded-2xl border-4 shadow-sm transition-all leading-relaxed",
                                                    promptError
                                                        ? "border-destructive/50 focus-visible:ring-destructive/20 focus-visible:border-destructive"
                                                        : "border-border hover:border-primary/50 focus-visible:ring-primary/20 focus-visible:border-primary focus:bg-primary/5"
                                                )}
                                                disabled={loading}
                                            />
                                            {/* Character count */}
                                            <div className="absolute bottom-3 right-3 text-xs font-medium text-muted-foreground bg-white/80 px-2 py-1 rounded-md backdrop-blur-sm border border-border/50">
                                                {prompt.length}/500
                                            </div>
                                        </div>
                                        {promptError && (
                                            <div className="flex items-center gap-2 text-destructive text-sm font-medium animate-in slide-in-from-left-2">
                                                <XCircle className="w-4 h-4" />
                                                <span>{promptError}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Question Count Selection */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm font-bold text-foreground">
                                                    {t("quizGenerator.ui.questionCount")}
                                                </label>
                                                <Badge variant="secondary" className="rounded-lg px-1.5 py-0.5 text-[10px] font-bold border border-border">
                                                    {t("quizGenerator.ui.required")}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                            <Select
                                                value={questionCount}
                                                onValueChange={setQuestionCount}
                                                disabled={loading}
                                            >
                                                <SelectTrigger className="w-full h-12 rounded-xl border-2 text-base px-4 font-medium transition-all hover:border-primary/50 focus:ring-primary/20 bg-background text-foreground shadow-sm">
                                                    <SelectValue placeholder={t('quizGenerator.ui.selectPlaceholder')} />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-2">
                                                    <SelectItem value="10" className="rounded-lg my-1 py-2 cursor-pointer">{t('quizGenerator.ui.10questions')}</SelectItem>
                                                    <SelectItem value="15" className="rounded-lg my-1 py-2 cursor-pointer">{t('quizGenerator.ui.15questions')}</SelectItem>
                                                    <SelectItem value="20" className="rounded-lg my-1 py-2 cursor-pointer">{t('quizGenerator.ui.20questions')}</SelectItem>
                                                    <SelectItem value="25" className="rounded-lg my-1 py-2 cursor-pointer">{t('quizGenerator.ui.25questions')}</SelectItem>
                                                    <SelectItem value="30" className="rounded-lg my-1 py-2 cursor-pointer">{t('quizGenerator.ui.30questions')}</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-secondary text-muted-foreground h-12">
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

                                    {/* Loading Progress */}
                                    {loading && generationProgress && (
                                        <div className="rounded-2xl bg-secondary/30 p-4 border border-border/50">
                                            <GenerationProgress
                                                generationStatus={generationStatus || "processing"}
                                                generationProgress={generationProgress}
                                                onCancel={() => {
                                                    setLoading(false);
                                                    setGenerationStatus(null);
                                                    setGenerationProgress("");
                                                    stopPolling();
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Generate Button */}
                                    <Button
                                        onClick={handleGenerate}
                                        disabled={loading || !prompt.trim() || !questionCount || !!promptError}
                                        className={cn(
                                            "w-full h-14 text-lg rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-primary text-white font-bold relative overflow-hidden group border-4 border-primary hover:border-primary-foreground/20 active:scale-95",
                                            loading && "opacity-80 cursor-not-allowed"
                                        )}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                {t("quizGenerator.generating")}
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5 mr-2" />
                                                {t("quizGenerator.createButton")}
                                                <div className="bg-white/20 p-1 rounded-md ml-2 group-hover:rotate-12 transition-transform hidden sm:block">
                                                    <Target className="w-4 h-4 text-white" />
                                                </div>
                                            </>
                                        )}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
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
                            setShowCancelConfirm(false);
                            setLoading(false);
                            setGenerationStatus(null);
                            setGenerationProgress("");
                            stopPolling();
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
