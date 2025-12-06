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
import { Sparkles, Loader2, Target, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { containsVietnameseBadwords } from "@/lib/vnBadwordsFilter";
import { useAnonQuota } from "@/hooks/useAnonQuota";
import { QuotaLimitDialog } from "./QuotaLimitDialog";
import { GenerationProgress } from "./GenerationProgress";
import useQuizGeneration from "@/hooks/useQuizGeneration";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { calculateXP, calculateLevel, calculateCreateReward } from "@/utils/levelSystem";
import type { Quiz } from "@/types/quiz";
import { cn } from "@/lib/utils";

interface QuickGeneratorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const QUESTION_OPTIONS = [5, 10, 15, 20];

export function QuickGeneratorDialog({ open, onOpenChange }: QuickGeneratorDialogProps) {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const { statistics, refetch: refetchStats } = useDashboardStats(user?.id);
    const { hasReachedLimit, getTimeUntilReset } = useAnonQuota();

    // State
    const [prompt, setPrompt] = useState("");
    const [questionCount, setQuestionCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [generationStatus, setGenerationStatus] = useState<string | null>(null);
    const [generationProgress, setGenerationProgress] = useState("");
    const [promptError, setPromptError] = useState("");
    const [showQuotaDialog, setShowQuotaDialog] = useState(false);

    // Refs
    const userRef = useRef(user);
    useEffect(() => { userRef.current = user; }, [user]);

    // Quiz generation hook
    const { startPolling, stopPolling, reset } = useQuizGeneration<Quiz>();

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
        if (!user && hasReachedLimit) {
            setShowQuotaDialog(true);
            return;
        }
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
                    questionCount,
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
                    toast({
                        title: t("quizGenerator.toasts.failedTitle"),
                        description: errorMessage || t("quizGenerator.toasts.genericError"),
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
            setQuestionCount(null);
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
                                    {t("quickGenerator.title", "Tạo Quiz Nhanh")}
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-base text-muted-foreground">
                                {t("quickGenerator.description", "Nhập chủ đề và số câu hỏi để tạo quiz ngay lập tức")}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="p-6 md:p-8 pt-0 space-y-6">
                            {/* Prompt Input */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-bold text-foreground">
                                        {t("quizGenerator.ui.topicLabel", "Chủ đề")}
                                    </label>
                                    <Badge variant="secondary" className="rounded-lg px-1.5 py-0.5 text-[10px] font-bold border border-border">
                                        {t("quizGenerator.ui.required", "Bắt buộc")}
                                    </Badge>
                                </div>
                                <div className="relative group">
                                    <Textarea
                                        placeholder={t("quizGenerator.placeholder", "Nhập chủ đề quiz...")}
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

                            {/* Question Count Pills */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-bold text-foreground">
                                            {t("quizGenerator.questionCount", "Số câu hỏi")}
                                        </label>
                                        <Badge variant="secondary" className="rounded-lg px-1.5 py-0.5 text-[10px] font-bold border border-border">
                                            {t("quizGenerator.ui.required", "Bắt buộc")}
                                        </Badge>
                                    </div>
                                    {questionCount && (
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-secondary/30 px-2 py-1 rounded-lg">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>
                                                ~{Math.ceil(questionCount / 5)} {t("quizGenerator.ui.minutes", "phút")}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {QUESTION_OPTIONS.map((count) => (
                                        <Button
                                            key={count}
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setQuestionCount(count)}
                                            disabled={loading}
                                            className={cn(
                                                "rounded-xl h-11 px-5 font-bold transition-all border-2",
                                                questionCount === count
                                                    ? "bg-primary text-white border-primary shadow-md scale-105"
                                                    : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
                                            )}
                                        >
                                            {count}
                                        </Button>
                                    ))}
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
                                        {t("quizGenerator.generating", "Đang tạo...")}
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        {t("quizGenerator.createQuiz", "Tạo Quiz")}
                                        <div className="bg-white/20 p-1 rounded-md ml-2 group-hover:rotate-12 transition-transform hidden sm:block">
                                            <Target className="w-4 h-4 text-white" />
                                        </div>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <QuotaLimitDialog
                open={showQuotaDialog}
                onOpenChange={setShowQuotaDialog}
                getTimeUntilReset={getTimeUntilReset}
            />
        </>
    );
}

export default QuickGeneratorDialog;
