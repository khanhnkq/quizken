import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeftIcon, XCircleIcon, PlusCircle, Brain, Sparkles, Zap, Lightbulb } from "lucide-react";
import { BackgroundDecorations } from "@/components/ui/BackgroundDecorations";
import { QuizContent } from "@/components/quiz/QuizContent";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import type { Quiz, Question } from "@/types/quiz";
import { warmupPdfWorker, generateAndDownloadPdf } from "@/lib/pdfWorkerClient";
import { useQuizProgress, clearQuizProgress, getQuizProgress } from "@/hooks/useQuizProgress";


import { QuickGeneratorDialog } from "@/components/quiz/QuickGeneratorDialog";
import AuthModal from "@/components/AuthModal";
import { useToast } from "@/hooks/use-toast";
import { useQuizStore } from "@/hooks/useQuizStore"; // Import global store

export default function PlayQuizPage() {
    const { t, i18n } = useTranslation();
    const { quizId } = useParams<{ quizId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();
    const { save: saveProgress, clear: clearProgress } = useQuizProgress();
    const { setQuiz: setGlobalQuiz, setPrompt } = useQuizStore(); // Destructure global setter
    const [showGeneratorDialog, setShowGeneratorDialog] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Quiz state
    const [userAnswers, setUserAnswers] = useState<number[]>([]);
    const [showResults, setShowResults] = useState(false);
    const startTimeRef = useRef<number>(Date.now());

    const [status, setStatus] = useState<string>("pending");
    const [progress, setProgress] = useState<string>("Initializing...");
    const pollingInterval = useRef<NodeJS.Timeout | null>(null);

    // Fetch quiz data and restore progress if available
    useEffect(() => {
        const fetchQuiz = async () => {
            if (!quizId) {
                setError(t('playQuiz.quizIdNotFound'));
                setIsLoading(false);
                return;
            }

            try {
                const { data, error: fetchError } = await supabase
                    .from("quizzes")
                    .select("id, title, description, questions, created_at, status, progress")
                    .eq("id", quizId)
                    .single();

                if (fetchError) {
                    console.error("Error fetching quiz:", fetchError);
                    setError(t('playQuiz.failedToLoad'));
                    setIsLoading(false);
                    return;
                }

                if (!data) {
                    setError(t('playQuiz.notFound.title'));
                    setIsLoading(false);
                    return;
                }

                setStatus(data.status || "pending");
                setProgress(data.progress || "Loading...");

                // If processing, don't set quiz yet, just continue polling
                if (data.status === "pending" || data.status === "processing") {
                    console.log("Quiz is generating, starting poll...");
                    setIsLoading(false); // Stop main loading, show progress screen
                    return;
                }
                
                // If failed
                if (data.status === "failed") {
                    setError(data.progress || t('playQuiz.failedToLoad'));
                    setIsLoading(false);
                    return;
                }

                // Parse questions if needed
                const questions = Array.isArray(data.questions)
                    ? data.questions
                    : JSON.parse(data.questions as string);

                const quizData: Quiz = {
                    id: data.id,
                    title: data.title || t('common.untitledQuiz'),
                    description: data.description || "",
                    questions: questions as Question[],
                };

                setQuiz(quizData);
                setGlobalQuiz(quizData); // Sync to global store so Generator knows about it

                // Check for saved progress (synchronously from localStorage)
                const saved = getQuizProgress();
                if (saved && saved.quizId === quizId) {
                    // Restore saved progress
                    setUserAnswers(saved.userAnswers);
                    // Use saved startTime, or null if it wasn't set
                    startTimeRef.current = saved.startTime || 0;
                    console.log("✅ Restored quiz progress");
                } else {
                    // Start fresh
                    setUserAnswers(new Array(quizData.questions.length).fill(-1));
                    startTimeRef.current = 0; // 0 indicates not started

                    // Save initial progress with null start time
                    saveProgress({
                        quizId: quizId,
                        quizTitle: quizData.title,
                        userAnswers: new Array(quizData.questions.length).fill(-1),
                        currentQuestion: 0,
                        startTime: null,
                        totalQuestions: quizData.questions.length,
                    });
                }

                // Increment usage count
                await supabase.rpc("increment_quiz_usage", { quiz_id: quizId });
            } catch (err) {
                console.error("Error:", err);
                setError(t('playQuiz.failedToLoad'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuiz();
    }, [quizId]);

    // Polling effect
    useEffect(() => {
        if (status === "pending" || status === "processing") {
            const poll = async () => {
                const { data } = await supabase
                    .from("quizzes")
                    .select("status, progress, questions, title, description, id")
                    .eq("id", quizId)
                    .single();
                
                if (data) {
                    setStatus(data.status);
                    setProgress(data.progress || "Processing...");
                    if (data.status === "completed") {
                         // Stop polling and set quiz
                         // Fix: Trigger a re-fetch or manually set quiz data here
                         // For simplicity, let's just reload the page or re-call fetch? 
                         // Better: Set the quiz state directly.
                         
                        const questions = Array.isArray(data.questions) ? data.questions : JSON.parse(data.questions as string);
                        const quizData: Quiz = {
                            id: data.id,
                            title: data.title || t('common.untitledQuiz'),
                            description: data.description || "",
                            questions: questions as Question[],
                        };
                        setQuiz(quizData);
                        setGlobalQuiz(quizData);
                        setUserAnswers(new Array(quizData.questions.length).fill(-1));
                    } else if (data.status === "failed") {
                        setError(data.progress || "Quiz generation failed");
                    }
                }
            };
            
            pollingInterval.current = setInterval(poll, 2000);
        } else {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        }

        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, [status, quizId]); // Re-run if status changes (e.g. from pending to processing)


    // Handle answer selection - save progress
    const handleAnswerSelect = useCallback(
        (questionIndex: number, answerIndex: number) => {
            setUserAnswers((prev) => {
                const newAnswers = [...prev];
                newAnswers[questionIndex] = answerIndex;

                // Start timer if not started
                if (!startTimeRef.current || startTimeRef.current === 0) {
                    startTimeRef.current = Date.now();
                }

                // Save progress
                if (quiz && quizId) {
                    saveProgress({
                        quizId: quizId,
                        quizTitle: quiz.title,
                        userAnswers: newAnswers,
                        currentQuestion: questionIndex,
                        startTime: startTimeRef.current,
                        totalQuestions: quiz.questions.length,
                    });
                }

                return newAnswers;
            });
        },
        [quiz, quizId, saveProgress]
    );

    // Calculate score
    const calculateScore = useCallback(() => {
        if (!quiz) return 0;
        return quiz.questions.reduce((score, question, index) => {
            if (userAnswers[index] === question.correctAnswer) {
                return score + 1;
            }
            return score;
        }, 0);
    }, [quiz, userAnswers]);

    // Handle grade - clear progress when completed
    const handleGrade = useCallback(() => {
        setShowResults(true);
        // Clear progress when quiz is completed
        clearProgress();
    }, [clearProgress]);

    // Handle reset
    const handleReset = useCallback(() => {
        if (quiz && quizId) {
            const newAnswers = new Array(quiz.questions.length).fill(-1);
            setUserAnswers(newAnswers);
            setShowResults(false);
            startTimeRef.current = Date.now();

            // Save reset progress
            saveProgress({
                quizId: quizId,
                quizTitle: quiz.title,
                userAnswers: newAnswers,
                currentQuestion: 0,
                startTime: Date.now(),
                totalQuestions: quiz.questions.length,
            });
        }
    }, [quiz, quizId, saveProgress]);

    // Handle PDF download
    const handleDownload = useCallback(async () => {
        if (!quiz) return;
        try {
            await warmupPdfWorker();
            const filename = `${quiz.title.replace(/[^a-z0-9]/gi, "_")}.pdf`;
            await generateAndDownloadPdf({
                filename,
                title: quiz.title,
                description: quiz.description || "",
                questions: quiz.questions,
                showResults,
                userAnswers,
                locale: i18n.language,
            });
        } catch (err) {
            console.error("Download error:", err);
        }
    }, [quiz, showResults, userAnswers]);

    // Loading State
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 p-8">
                <div className="container mx-auto space-y-8">
                    <Skeleton className="h-12 w-64 rounded-full" />
                    <Skeleton className="h-96 w-full rounded-[2.5rem]" />
                </div>
            </div>
        );
    }

    // Generating State
    if (status === "pending" || status === "processing") {
        return (
            <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 flex flex-col items-center justify-center p-8 space-y-6">
                 <BackgroundDecorations />
                 <div className="relative w-32 h-32">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-slate-800"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-primary animate-pulse" />
                    </div>
                 </div>
                 <div className="text-center space-y-2 z-10">
                     <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                        {t('playQuiz.generating.title')}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        {progress ? (t(progress) === progress ? progress : t(progress)) : t('playQuiz.generating.description')}
                    </p>
                 </div>
            </div>
        );
    }

    // Error State
    if (error || !quiz) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4">
                <BackgroundDecorations />
                <Card className="rounded-[2rem] shadow-xl border-dashed border-4 border-gray-200 dark:border-slate-800 p-8 text-center max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircleIcon className="w-8 h-8 text-red-500 dark:text-red-400" />
                    </div>
                    <h2 className="text-xl font-heading font-bold text-gray-800 dark:text-gray-200 mb-2">
                        {t("playQuiz.notFound.title")}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        {error || t("playQuiz.notFound.description")}
                    </p>
                    <Button onClick={() => navigate("/quiz/library")} className="rounded-full">
                        {t("playQuiz.backToLibrary")}
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col overflow-hidden relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Base Pattern - FIXED */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <BackgroundDecorations density="medium" />
            </div>

            {/* Hero-style Animated Blobs for Depth - FIXED */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-yellow-200/30 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-200/30 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-pink-200/30 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-4000"></div>
                <div className="absolute bottom-[10%] right-[-5%] w-[300px] h-[300px] bg-blue-200/30 rounded-full mix-blend-multiply filter blur-[60px] opacity-60 animate-blob animation-delay-6000"></div>
            </div>

            {/* Hero-style Floating 3D Icons - FIXED */}
            <div className="hidden xl:block fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[15%] left-[5%] animate-float hover:scale-110 transition-transform duration-1000">
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-3xl shadow-xl border border-white/50 dark:border-slate-700/50 rotate-[-12deg]">
                        <Brain className="w-10 h-10 text-primary" />
                    </div>
                </div>
                <div className="absolute top-[20%] right-[5%] animate-float animation-delay-2000 hover:scale-110 transition-transform duration-1000">
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-3xl shadow-xl border border-white/50 dark:border-slate-700/50 rotate-[12deg]">
                        <Sparkles className="w-10 h-10 text-yellow-400" />
                    </div>
                </div>
                <div className="absolute bottom-[30%] left-[8%] animate-float animation-delay-4000 hover:scale-110 transition-transform duration-1000">
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-3xl shadow-xl border border-white/50 dark:border-slate-700/50 rotate-[6deg]">
                        <Zap className="w-8 h-8 text-blue-400" />
                    </div>
                </div>
                <div className="absolute bottom-[20%] right-[8%] animate-float animation-delay-5000 hover:scale-110 transition-transform duration-1000">
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-3xl shadow-xl border border-white/50 dark:border-slate-700/50 rotate-[-8deg]">
                        <Lightbulb className="w-8 h-8 text-orange-400" />
                    </div>
                </div>
            </div>

            {/* Fixed Header */}
            <div className="flex-none z-50 w-full px-4 sm:px-6 py-4 bg-gradient-to-b from-white/80 to-transparent dark:from-slate-950/80 dark:to-transparent backdrop-blur-sm">
                <div className="container mx-auto flex justify-between items-center">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/quiz/library")}
                        className="rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 shadow-sm hover:shadow-md transition-all group px-3 sm:px-4 backdrop-blur-md"
                    >
                        <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform text-gray-500 dark:text-gray-300" />
                        <span className="font-bold text-gray-600 dark:text-gray-200">
                            {t("playQuiz.backToLibrary")}
                        </span>
                    </Button>

                    <div className="flex items-center gap-2">
                        {!showResults && (
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    clearProgress();
                                    navigate("/quiz/library");
                                }}
                                className="rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 hover:text-red-600 shadow-sm hover:shadow-md transition-all group px-3 sm:px-4 backdrop-blur-md"
                            >
                                <XCircleIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                <span className="font-bold">
                                    {t("playQuiz.cancelQuiz")}
                                </span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto w-full relative z-10">
                <div className="container mx-auto px-0 sm:px-6 pb-20"> {/* pb-20 for bottom button space */}
                    <QuizContent
                        quiz={quiz}
                        userAnswers={userAnswers}
                        showResults={showResults}
                        tokenUsage={null}
                        onAnswerSelect={handleAnswerSelect}
                        onGrade={handleGrade}
                        onReset={handleReset}
                        calculateScore={calculateScore}
                        onDownload={handleDownload}
                        userId={user?.id}
                        startTime={startTimeRef.current}
                    />
                </div>
            </div>

            {/* Global/Overlay Components */}
            <QuickGeneratorDialog
                open={showGeneratorDialog}
                onOpenChange={setShowGeneratorDialog}
            />
            <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
        </div>
    );
}
