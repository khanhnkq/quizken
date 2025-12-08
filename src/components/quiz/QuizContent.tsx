import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, Sparkles, BookOpen, Brain, Clock, CircleHelp } from "@/lib/icons";
import { BackgroundDecorations } from "@/components/ui/BackgroundDecorations";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Quiz, Question } from "@/types/quiz";
import { useAudio } from "@/contexts/SoundContext";
import { killActiveScroll, scrollToTarget } from "@/lib/scroll";
import { isIOSSafari } from "@/utils/deviceDetection";
import { supabase } from "@/integrations/supabase/client";
import { useFlashcardPersistence } from "@/hooks/useFlashcardPersistence";
import FlashcardView from "@/components/flashcard/FlashcardView";
import { useTranslation } from "react-i18next";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { calculateXP, calculateLevel, calculateAttemptReward } from "@/utils/levelSystem";
import { useToast } from "@/hooks/use-toast";

interface TokenUsage {
  prompt: number;
  candidates: number;
  total: number;
}

interface QuizContentProps {
  quiz: Quiz;
  userAnswers: number[];
  showResults: boolean;
  tokenUsage: TokenUsage | null;
  onAnswerSelect: (questionIndex: number, answerIndex: number) => void;
  onGrade: () => void;
  onReset: () => void;
  calculateScore: () => number;
  onDownload: () => Promise<void> | void;
  userId?: string;
  startTime?: number;
}

// Submit quiz attempt via Edge Function for SERVER-SIDE score validation
// This prevents client-side score manipulation (cheating)
async function saveQuizAttempt(
  quizId: string,
  userId: string,
  _score: number, // Unused - calculated server-side
  _totalQuestions: number, // Unused - calculated server-side
  _correctAnswers: number, // Unused - calculated server-side
  answers: number[],
  timeTakenSeconds: number
): Promise<{ success: boolean; score?: number; correct_answers?: number; total_questions?: number }> {
  try {
    // Get current session for auth token
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;

    if (!accessToken) {
      console.error("No access token available");
      return { success: false };
    }

    // Call Edge Function for server-side validation
    const { data, error } = await supabase.functions.invoke("submit-quiz-attempt", {
      body: {
        quiz_id: quizId,
        answers: answers,
        time_taken_seconds: timeTakenSeconds,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (error) {
      console.error("Error submitting quiz attempt:", error);
      return { success: false };
    }

    console.log("✅ Quiz attempt saved (server-validated):", data);
    return {
      success: true,
      score: data.score,
      correct_answers: data.correct_answers,
      total_questions: data.total_questions,
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false };
  }
}


export const QuizContent: React.FC<QuizContentProps> = ({
  quiz,
  userAnswers,
  showResults,
  tokenUsage,
  onAnswerSelect,
  onGrade,
  onReset,
  calculateScore,
  onDownload,
  userId,
  startTime,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { statistics, refetch: refetchStats } = useDashboardStats(userId);
  const {
    activateFlashcard,
    deactivateFlashcard,
  } =
    useFlashcardPersistence(null);
  const [showFlashcard, setShowFlashcard] = React.useState(false);
  const questionRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const scoreRef = React.useRef<HTMLDivElement | null>(null);

  // Auto-activate flashcard mode from URL param
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "flashcard" && !showFlashcard) {
      activateFlashcard();
      setShowFlashcard(true);
    }
  }, []);

  const [timerSeconds, setTimerSeconds] = React.useState(0);

  // Timer logic: Sync with real startTime and run interval
  React.useEffect(() => {
    const hasStarted = userAnswers.some(a => a !== -1);

    // If we have a startTime and the quiz has started (or we have previous answers), sync the timer
    if (startTime && hasStarted) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setTimerSeconds(elapsed > 0 ? elapsed : 0);
    } else {
      setTimerSeconds(0);
    }

    let interval: NodeJS.Timeout;

    if (hasStarted && !showResults) {
      interval = setInterval(() => {
        // We calculate from startTime if available to be robust against drift
        if (startTime) {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setTimerSeconds(elapsed > 0 ? elapsed : 0);
        } else {
          setTimerSeconds(prev => prev + 1);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [userAnswers, showResults, startTime]);

  // Reset timer on reset
  React.useEffect(() => {
    if (!userAnswers.some(a => a !== -1)) {
      setTimerSeconds(0);
      setCurrentQuestionIndex(0);
    }
  }, [userAnswers]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = React.useMemo(
    () => userAnswers.filter((ans) => ans !== undefined && ans !== -1).length,
    [userAnswers]
  );

  // Handle flashcard view toggle
  const handleToggleFlashcard = () => {
    if (!showFlashcard) {
      activateFlashcard();
      setShowFlashcard(true);
    } else {
      deactivateFlashcard();
      setShowFlashcard(false);
    }
  };

  const completionPercent = React.useMemo(() => {
    if (!quiz.questions.length) return 0;
    return Math.round((answeredCount / quiz.questions.length) * 100);
  }, [answeredCount, quiz.questions.length]);

  const { play } = useAudio();

  const handleNavigateQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    // Scroll to top of card to ensure visibility
    if (cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToGenerator = () => {
    killActiveScroll();
    scrollToTarget("generator", { align: "top" });
  };

  const handleAnswerSelect = (
    questionIndex: number,
    answerIndex: number,
    inputEl?: HTMLInputElement
  ) => {
    onAnswerSelect(questionIndex, answerIndex);

    EMPTY_STRING
  };

  const scrollToTop = () => {
    setTimeout(() => {
      killActiveScroll();
      const scoreElement = document.querySelector(
        "[data-score-display]"
      ) as HTMLElement | null;
      if (scoreElement) {
        scrollToTarget(scoreElement, { align: "center" });
        return;
      }
      scrollToTarget("quiz", { align: "top" });
    }, 150);
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <section
      ref={sectionRef}
      id="quiz"
      className="quiz-content relative py-8 sm:py-20 px-2 sm:px-4">

      <div className="mx-auto max-w-4xl px-0 sm:px-4 relative z-10">
        <div className="text-center mb-12 relative py-4">
          {/* Animated Background Blobs - Playful Colors */}
          <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-yellow-200/40 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-48 h-48 bg-purple-200/40 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/3 w-48 h-48 bg-pink-200/40 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-4000"></div>

          {/* Floating Cute Icons */}
          <div className="absolute top-0 left-[15%] hidden md:block animate-float">
            <div className="bg-white p-3 rounded-2xl shadow-lg border-2 border-primary/20 rotate-[-12deg]">
              <Brain className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="absolute bottom-10 right-[15%] hidden md:block animate-float animation-delay-2000">
            <div className="bg-white p-3 rounded-2xl shadow-lg border-2 border-yellow-400/20 rotate-[12deg]">
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </div>
          </div>

          {/* TOP ENTRY: Badge / Topic Name - High Visibilty */}
          <div className="relative z-20 flex flex-col items-center justify-center -mt-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-5 sm:py-2 rounded-full bg-white/90 backdrop-blur-sm border-2 border-primary/20 text-primary font-bold shadow-sm hover:scale-105 transition-transform duration-300 cursor-default">
              <span className="text-[10px] sm:text-sm uppercase tracking-wider text-muted-foreground mr-1">{t('quizContent.topicPrefix')}</span>
              <span className="text-xs sm:text-base">{quiz.title}</span>
              <div className="w-px h-4 bg-border mx-1"></div>
              <Badge variant="secondary" className="text-[10px] sm:text-xs font-bold rounded-lg px-2">
                {quiz.questions.length} {t('quizContent.questions')}
              </Badge>
            </div>
          </div>

          {/* Main Playful Title */}
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground drop-shadow-sm mb-4 relative inline-block z-10">
            <span className="relative z-10 bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
              {showFlashcard ? t('quizContent.modeTitleFlashcard') : t('quizContent.modeTitleQuiz')}
            </span>
            {/* Cute wavy underline */}
            <svg className="absolute -bottom-3 left-0 w-full h-4 text-yellow-300 -z-10 opacity-80" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 25 10 50 5 T 100 5" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round" />
            </svg>
            {/* Cute Sparkle Decor */}
            <Sparkles className="absolute -top-6 -right-8 w-10 h-10 text-yellow-400 animate-bounce-slow" />
          </h1>

          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed relative z-10">
            {quiz.description || t('quizContent.defaultDescription')}
          </p>
        </div>

        {/* Flashcard View - Conditionally Rendered */}
        <div className="relative w-full">
          <div
            className={`transition-all duration-500 ease-in-out transform-gpu ${showFlashcard
              ? "opacity-0 scale-95 rotate-y-90 pointer-events-none absolute"
              : "opacity-100 scale-100 rotate-y-0"
              }`}>
            <Card
              ref={cardRef}
              className="border-4 border-primary/20 rounded-3xl shadow-2xl bg-white/90 backdrop-blur-md overflow-hidden min-h-[500px] flex flex-col">
              <CardHeader className="pb-6">
                <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 mb-6">
                  {/* Left: Stopwatch Timer */}
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border-2 border-border/50 transition-opacity duration-500 ${userAnswers.some(a => a !== -1) ? 'opacity-100' : 'opacity-40'}`}>
                    <Clock className="w-5 h-5 text-primary animate-pulse" />
                    <span className="font-mono font-bold text-lg text-primary">{formatTime(timerSeconds)}</span>
                  </div>

                  <div className="flex flex-wrap justify-center sm:justify-end gap-2 w-full sm:w-auto">
                    {showResults && (
                      <Button
                        onClick={() => {
                          onReset();
                          scrollToTop();
                        }}
                        variant="outline"
                        size="default"
                        sound="alert"
                        className="flex-1 sm:flex-none rounded-3xl border-4 border-border hover:bg-destructive hover:text-white hover:border-destructive transition-all duration-200 active:scale-95">
                        {t('quizContent.retake')}
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        handleToggleFlashcard();
                      }}
                      variant={showFlashcard ? "default" : "outline"}
                      size="default"
                      sound="success"
                      className={`flex-1 sm:flex-none rounded-3xl border-4 transition-all duration-200 active:scale-95 ${showFlashcard
                        ? "bg-primary text-white border-primary hover:bg-primary/90 shadow-lg scale-105"
                        : "border-border hover:border-primary text-muted-foreground hover:text-primary hover:bg-primary/10"
                        }`}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span className="hidden xs:inline">
                        {showFlashcard ? t('quizContent.studying') : t('quizContent.flashcard')}
                      </span>
                      <span className="xs:hidden">
                        {showFlashcard ? t('quizContent.study') : t('quizContent.card')}
                      </span>
                    </Button>
                    <Button
                      onClick={onDownload}
                      variant="outline"
                      size="default"
                      sound="success"
                      className="flex-1 sm:flex-none rounded-3xl border-4 border-border hover:border-primary hover:text-primary hover:bg-primary/10 transition-all duration-200 active:scale-95">
                      <Download className="mr-2 h-4 w-4" />
                      <span className="hidden xs:inline">{t('quizContent.downloadPDF')}</span>
                      <span className="xs:hidden">{t('quizContent.pdf')}</span>
                    </Button>
                  </div>
                </div>

                <div className="mt-0">
                  <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
                    <span>{t('quizContent.progress')}</span>
                    <span>
                      {answeredCount}/{quiz.questions.length}
                    </span>
                  </div>
                  <div className="w-full bg-secondary/50 rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all duration-300 relative overflow-hidden"
                      style={{ width: `${completionPercent}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-progress-indeterminate w-full h-full" />
                    </div>
                  </div>
                  {showResults && (
                    <div
                      ref={scoreRef}
                      data-score-display
                      className="mt-4 p-4 bg-primary/10 rounded-lg">
                      <h4 className="text-lg font-semibold">
                        {t('quizContent.yourScore')}: {calculateScore()}/{quiz.questions.length}{" "}
                        (
                        {Math.round(
                          (calculateScore() / quiz.questions.length) * 100
                        )}
                        %)
                      </h4>
                    </div>
                  )}
                </div>
                <div className="mt-6">
                  {/* Question Navigation Grid */}
                  <div className="flex flex-wrap justify-center gap-2 max-h-[150px] overflow-y-auto p-2 scrollbar-thin">
                    {quiz.questions.map((_, idx) => {
                      const isAnswered = userAnswers[idx] !== undefined && userAnswers[idx] !== -1;
                      const isCurrent = currentQuestionIndex === idx;
                      const isCorrect =
                        showResults &&
                        isAnswered &&
                        typeof quiz.questions[idx].correctAnswer === "number" &&
                        userAnswers[idx] === quiz.questions[idx].correctAnswer;
                      const isIncorrect =
                        showResults && isAnswered && !isCorrect;

                      // Flashcard-inspired styling
                      const stateClasses = isCorrect
                        ? "bg-green-100 text-green-700 border-green-500 shadow-sm"
                        : isIncorrect
                          ? "bg-red-100 text-red-700 border-red-500 shadow-sm"
                          : isCurrent
                            ? "bg-primary text-white border-primary shadow-md ring-2 ring-primary ring-offset-2 scale-110 font-bold z-10"
                            : isAnswered
                              ? "bg-primary/20 text-primary border-primary/50"
                              : "bg-background text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground";

                      return (
                        <Button
                          key={`nav-${idx}`}
                          type="button"
                          variant="ghost" // Use custom classes instead of variant presets
                          size="icon"
                          className={`relative w-10 h-10 rounded-xl border-2 transition-all duration-200 ${stateClasses}`}
                          onClick={() => handleNavigateQuestion(idx)}
                          title={`${t('quizContent.question')} ${idx + 1}`}
                        >
                          <span className="relative z-10">{idx + 1}</span>
                          {showResults && isCorrect && (
                            <span className="pointer-events-none absolute -right-1 -top-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-500 text-white border-2 border-white text-[10px] font-bold shadow-sm">
                              ✓
                            </span>
                          )}
                          {showResults && isIncorrect && (
                            <span className="pointer-events-none absolute -right-1 -top-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white border-2 border-white text-[10px] font-bold shadow-sm">
                              ✗
                            </span>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    {t('quizContent.navigationHelp')}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 flex-1">
                {/* Single Question Render */}
                <div className="animate-in fade-in slide-in-from-right-4 duration-300" key={currentQuestionIndex}>
                  {currentQuestion && (
                    <>
                      <div className="p-3 sm:p-6 md:p-8 space-y-3 sm:space-y-4 border-2 rounded-2xl hover:border-primary/50 transition-colors">
                        <h3 className="text-xl md:text-2xl font-heading font-medium text-foreground leading-relaxed flex gap-3 items-start">
                          <span className="flex-shrink-0 mt-1 p-1.5 bg-primary/10 rounded-lg">
                            <CircleHelp className="w-5 h-5 text-primary" />
                          </span>
                          {currentQuestion.question}
                        </h3>

                        <div className="flex flex-col gap-2 mt-6">
                          {currentQuestion.options && Array.isArray(currentQuestion.options) ? (
                            currentQuestion.options.map((option, optIdx) => {
                              const isSelected =
                                userAnswers[currentQuestionIndex] === optIdx;
                              const isCorrect = optIdx === currentQuestion.correctAnswer;
                              const userSelectedWrong =
                                showResults && isSelected && !isCorrect;
                              const userSelectedCorrect =
                                showResults && isSelected && isCorrect;

                              return (
                                <label
                                  key={optIdx}
                                  className={`group w-full text-left p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 active:scale-[0.98] flex items-center gap-4 ${showResults && isCorrect
                                    ? "bg-green-50 border-green-500 shadow-[0_4px_0_0_#22c55e] translate-y-[-2px]"
                                    : userSelectedWrong
                                      ? "bg-red-50 border-red-500 shadow-[0_4px_0_0_#ef4444] translate-y-[-2px]"
                                      : userSelectedCorrect
                                        ? "bg-green-50 border-green-500 shadow-[0_4px_0_0_#22c55e] translate-y-[-2px]"
                                        : isSelected
                                          ? "bg-primary/5 border-primary shadow-[0_4px_0_0_#FF6B6B] translate-y-[-2px]"
                                          : "bg-white border-border/60 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1"
                                    }`}>
                                  <input
                                    type="radio"
                                    name={`question-${currentQuestionIndex}`}
                                    value={optIdx}
                                    checked={isSelected}
                                    onChange={(e) => {
                                      play("pop");
                                      handleAnswerSelect(
                                        currentQuestionIndex,
                                        optIdx,
                                        e.currentTarget
                                      );
                                    }}
                                    disabled={showResults}
                                    className="sr-only"
                                  />
                                  <div className={`
                                            w-10 h-10 rounded-xl flex items-center justify-center 
                                            font-heading font-bold text-lg transition-colors shrink-0
                                            ${isSelected || (showResults && isCorrect) ? 'bg-primary text-white' : 'bg-secondary/30 text-secondary-foreground group-hover:bg-primary group-hover:text-white'}
                                          `}>
                                    {String.fromCharCode(65 + optIdx)}
                                  </div>
                                  <div className="flex-1">
                                    <span className="text-base sm:text-lg font-medium leading-snug">
                                      {option}
                                    </span>
                                  </div>
                                  {showResults && isCorrect && (
                                    <span className="text-green-600 font-bold text-sm bg-white px-2 py-1 rounded-lg border border-green-200 shadow-sm shrink-0">
                                      {t('quizContent.correctAnswer')}
                                    </span>
                                  )}
                                  {userSelectedWrong && (
                                    <span className="text-red-600 font-bold text-sm bg-white px-2 py-1 rounded-lg border border-red-200 shadow-sm shrink-0">
                                      {t('quizContent.yourAnswer')}
                                    </span>
                                  )}
                                </label>
                              );
                            })
                          ) : (
                            <div className="text-red-500">
                              {t('quizContent.noOptions')}
                            </div>
                          )}
                        </div>
                        {showResults && currentQuestion.explanation && (
                          <div className="pt-4 mt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-2">
                            <p className="text-sm text-muted-foreground bg-secondary/30 p-4 rounded-xl">
                              <span className="font-bold flex items-center gap-2 mb-1 text-foreground">
                                <Brain className="w-4 h-4 text-primary" />
                                {t('quizContent.explanation')}:
                              </span>
                              {currentQuestion.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col sm:flex-row justify-end gap-4 pt-6 pb-8 border-t bg-muted/20 min-h-[5rem]">
                {!showResults ? (
                  // Show Grade button if on last question OR all questions answered
                  (currentQuestionIndex === quiz.questions.length - 1 || answeredCount === quiz.questions.length) && (
                    <Button
                      onClick={async () => {
                        // OPTIMISTIC UI: Grade immediately, save to server in background
                        // This provides instant feedback to the user

                        // 1. Show results IMMEDIATELY (don't wait for server)
                        onGrade();
                        scrollToTop();

                        // 2. Save to server in background (non-blocking)
                        if (userId && answeredCount === quiz.questions.length && quiz.id) {
                          // Calculate actual time taken based on startTime (or fallback to timerSeconds)
                          const timeTaken = startTime
                            ? Math.floor((Date.now() - startTime) / 1000)
                            : timerSeconds;

                          // Calculate score locally for reward notification
                          const localCorrectCount = userAnswers.reduce(
                            (count, answer, idx) => {
                              const question = quiz.questions[idx];
                              return count + (answer === question.correctAnswer ? 1 : 0);
                            },
                            0
                          );
                          const localScore = Math.round((localCorrectCount / quiz.questions.length) * 100);

                          // Fire and forget - don't await
                          saveQuizAttempt(
                            quiz.id,
                            userId,
                            localScore,
                            quiz.questions.length,
                            localCorrectCount,
                            userAnswers,
                            timeTaken
                          ).then((result) => {
                            if (result.success) {
                              console.log("✅ Quiz attempt saved (server-validated)");

                              // Use local score for reward (server validates but we trust local for display)
                              const currentXP = calculateXP(statistics);
                              const currentLevel = calculateLevel(currentXP);
                              const zcoinReward = calculateAttemptReward(currentLevel, result.score ?? localScore);

                              // Refresh stats to trigger global level up check
                              refetchStats();

                              toast({
                                title: t('notifications.zcoinReward.attempt', { amount: zcoinReward, xp: result.score ?? localScore }),
                                description: t('quizDetail.quizResult'),
                                variant: "success",
                                duration: 3000,
                              });
                            } else {
                              console.log("❌ Failed to save quiz attempt");
                            }
                          });
                        }
                      }}
                      disabled={answeredCount !== quiz.questions.length}
                      variant={answeredCount === quiz.questions.length ? "hero" : "outline"}
                      size="xl"
                      sound="success"
                      className={`w-full sm:w-auto text-sm sm:text-base md:text-lg min-h-[3rem] sm:min-h-[3.5rem] py-3 sm:py-4 px-4 sm:px-6 rounded-2xl sm:rounded-3xl border-2 sm:border-4 shadow-xl transition-all duration-200 active:scale-95 ${answeredCount === quiz.questions.length
                        ? "border-primary hover:shadow-2xl hover:border-primary-foreground/20"
                        : "border-border opacity-50 cursor-not-allowed"
                        }`}>
                      {t('quizContent.grade')}
                    </Button>
                  )
                ) : (
                  <Button
                    onClick={() => {
                      onReset();
                      scrollToTop();
                    }}
                    variant="hero"
                    size="xl"
                    sound="alert"
                    className="min-w-[200px] rounded-3xl border-4 border-primary hover:border-primary-foreground/20 shadow-xl active:scale-95 transition-all duration-200">
                    {t('quizContent.retake')}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>

          <div
            className={`transition-all duration-500 ease-in-out transform-gpu ${showFlashcard
              ? "opacity-100 scale-100 rotate-y-0"
              : "opacity-0 scale-95 -rotate-y-90 pointer-events-none absolute"
              }`}>
            <FlashcardView
              quiz={quiz}
              onBack={() => {
                handleToggleFlashcard();
              }}
            />
          </div>
        </div>
      </div>
    </section >
  );
};

export default QuizContent;
