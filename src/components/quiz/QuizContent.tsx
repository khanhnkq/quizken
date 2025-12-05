import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, Sparkles, BookOpen, Brain } from "@/lib/icons";
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
}

// Move saveQuizAttempt outside component
async function saveQuizAttempt(
  quizId: string,
  userId: string,
  score: number,
  totalQuestions: number,
  correctAnswers: number,
  answers: number[],
  timeTakenSeconds: number
) {
  try {
    const { data, error } = await supabase.from("quiz_attempts").insert([
      {
        quiz_id: quizId,
        user_id: userId,
        score: Math.round((correctAnswers / totalQuestions) * 100),
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        answers: answers,
        time_taken_seconds: timeTakenSeconds,
        completed_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Error saving quiz attempt:", error);
      return false;
    }

    console.log("Quiz attempt saved:", data);
    return true;
  } catch (err) {
    console.error("Unexpected error:", err);
    return false;
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
}) => {
  const { t } = useTranslation();
  const { activateFlashcard, deactivateFlashcard } =
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

  const answeredCount = React.useMemo(
    () => userAnswers.filter((ans) => ans !== undefined).length,
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

  const handleNavigateQuestion = (index: number, highlight: boolean = true) => {
    const target = questionRefs.current[index];
    if (target) {
      killActiveScroll();
      scrollToTarget(target, { align: "center" });

      if (highlight) {
        target.classList.add("ring", "ring-[#B5CC89]", "ring-offset-2");
        window.setTimeout(() => {
          target.classList.remove("ring", "ring-[#B5CC89]", "ring-offset-2");
        }, 1200);
      }
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

    if (questionIndex < quiz.questions.length - 1) {
      if (inputEl && isIOSSafari()) {
        requestAnimationFrame(() => {
          try {
            inputEl.blur();
          } catch (err) {
            console.debug(
              "iOS Safari blur failed to prevent focus-induced scrolling",
              err
            );
          }
        });
      }
      killActiveScroll();
      setTimeout(() => {
        handleNavigateQuestion(questionIndex + 1, false);
      }, 250);
    }
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

  return (
    <section
      ref={sectionRef}
      id="quiz"
      className="quiz-content relative overflow-hidden bg-gradient-to-b from-background to-secondary/20 py-20 px-0 sm:px-4">

      <BackgroundDecorations />

      <div className="mx-auto max-w-4xl px-2 sm:px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Sparkles className="w-12 h-12 text-[#B5CC89]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">{quiz.title}</h2>
          <p className="text-lg text-muted-foreground">
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
              className="border-4 border-primary/20 rounded-3xl shadow-2xl bg-white/90 backdrop-blur-md overflow-hidden">
              <CardHeader className="pb-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="secondary" className="font-heading rounded-xl px-3 py-1">{t('quizContent.badge')}</Badge>
                      <Badge className="text-xs font-heading rounded-xl px-3 py-1">
                        {quiz.questions.length} {t('quizContent.questions')}
                        {tokenUsage && (
                          <span className="ml-1 opacity-75 font-sans">
                            ({tokenUsage.total} token)
                          </span>
                        )}
                      </Badge>
                    </div>
                    <CardTitle className="text-3xl md:text-4xl font-heading text-primary">
                      {quiz.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {quiz.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 w-full lg:w-auto">
                    {showResults && (
                      <Button
                        onClick={() => {
                          onReset();
                          scrollToTop();
                        }}
                        variant="outline"
                        size="default"
                        sound="alert"
                        className="flex-1 lg:flex-initial rounded-3xl border-4 border-border hover:bg-destructive hover:text-white hover:border-destructive transition-all duration-200 active:scale-95">
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
                      className={`flex-1 lg:flex-initial rounded-3xl border-4 transition-all duration-200 active:scale-95 ${showFlashcard
                        ? "bg-[#B5CC89] text-white border-[#B5CC89] hover:bg-[#B5CC89]/90 shadow-lg scale-105"
                        : "border-border hover:border-[#B5CC89] text-muted-foreground hover:text-[#B5CC89] hover:bg-[#B5CC89]/10"
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
                      className="flex-1 lg:flex-initial rounded-3xl border-4 border-border hover:border-primary hover:text-primary hover:bg-primary/10 transition-all duration-200 active:scale-95">
                      <Download className="mr-2 h-4 w-4" />
                      <span className="hidden xs:inline">{t('quizContent.downloadPDF')}</span>
                      <span className="xs:hidden">{t('quizContent.pdf')}</span>
                    </Button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
                    <span>{t('quizContent.progress')}</span>
                    <span>
                      {answeredCount}/{quiz.questions.length}
                    </span>
                  </div>
                  <Progress value={completionPercent} />
                  {showResults && (
                    <div
                      ref={scoreRef}
                      data-score-display
                      className="mt-4 p-4 bg-[#B5CC89]/10 rounded-lg">
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
                  <div className="flex flex-wrap justify-center gap-2">
                    {quiz.questions.map((_, idx) => {
                      const isAnswered = userAnswers[idx] !== undefined;
                      const isCorrect =
                        showResults &&
                        isAnswered &&
                        typeof quiz.questions[idx].correctAnswer === "number" &&
                        userAnswers[idx] === quiz.questions[idx].correctAnswer;
                      const isIncorrect =
                        showResults && isAnswered && !isCorrect;
                      const stateClasses = isCorrect
                        ? "border-green-500 text-green-600 hover:bg-green-50"
                        : isIncorrect
                          ? "border-red-500 text-red-600 hover:bg-red-50"
                          : isAnswered
                            ? "border-[#B5CC89] text-[#B5CC89] hover:bg-[#B5CC89]/10"
                            : "border-border text-muted-foreground hover:bg-accent";

                      return (
                        <Button
                          key={`nav-${idx}`}
                          type="button"
                          variant="outline"
                          size="icon"
                          className={`relative w-10 h-10 rounded-xl border-2 transition-transform hover:scale-110 duration-200 ${stateClasses}`}
                          onClick={() => handleNavigateQuestion(idx)}
                          title={`${t('quizContent.question')} ${idx + 1}: ${isCorrect
                            ? t('quizContent.correct')
                            : isIncorrect
                              ? t('quizContent.incorrect')
                              : isAnswered
                                ? t('quizContent.answered')
                                : t('quizContent.unanswered')
                            }`}>
                          <span className="relative z-10">{idx + 1}</span>
                          {showResults && isCorrect && (
                            <span className="pointer-events-none absolute -right-1 -top-1 inline-flex items-center justify-center w-4 h-4 rounded-xl bg-white text-green-600 border-2 border-green-600 text-[10px] font-bold shadow-sm">
                              ✓
                            </span>
                          )}
                          {showResults && isIncorrect && (
                            <span className="pointer-events-none absolute -right-1 -top-1 inline-flex items-center justify-center w-4 h-4 rounded-xl bg-white text-red-600 border-2 border-red-600 text-[10px] font-bold shadow-sm">
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

              <CardContent className="space-y-4">
                {quiz.questions.map((q, idx) => {
                  try {
                    if (!q || typeof q.question !== "string") {
                      return (
                        <div key={idx} className="text-red-500">
                          {t('quizContent.invalidQuestion')} {idx}
                        </div>
                      );
                    }

                    return (
                      <Card
                        key={idx}
                        ref={(element) => {
                          questionRefs.current[idx] = element;
                        }}
                        className="border-2 rounded-2xl hover:border-[#B5CC89] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg scroll-mt-[var(--navbar-height,64px)]">
                        <CardContent className="p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4">
                          <div className="space-y-4">
                            {q.question && (
                              <h3 className="text-2xl font-heading font-medium text-foreground leading-relaxed flex gap-3 items-start">
                                <span className="flex-shrink-0 mt-1 p-1.5 bg-primary/10 rounded-lg">
                                  <Brain className="w-5 h-5 text-primary" />
                                </span>
                                {q.question}
                              </h3>
                            )}
                            <div className="flex flex-col gap-2">
                              {q.options && Array.isArray(q.options) ? (
                                q.options.map((option, optIdx) => {
                                  const isSelected =
                                    userAnswers[idx] === optIdx;
                                  const isCorrect = optIdx === q.correctAnswer;
                                  const userSelectedWrong =
                                    showResults && isSelected && !isCorrect;
                                  const userSelectedCorrect =
                                    showResults && isSelected && isCorrect;

                                  return (
                                    <label
                                      key={optIdx}
                                      className={`group w-full text-left p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 active:scale-95 flex items-center gap-4 ${showResults && isCorrect
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
                                        name={`question-${idx}`}
                                        value={optIdx}
                                        checked={isSelected}
                                        onChange={(e) => {
                                          play("pop");
                                          handleAnswerSelect(
                                            idx,
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
                                  {t('quizContent.noOptions')} {idx}
                                </div>
                              )}
                            </div>
                            {showResults && q.explanation && (
                              <div className="pt-2 border-t">
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-semibold">
                                    {t('quizContent.explanation')}:
                                  </span>{" "}
                                  {q.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  } catch (error) {
                    return (
                      <div
                        key={idx}
                        className="text-red-500 border border-red-300 p-4 rounded">
                        {t('quizContent.displayError')} {idx}:{" "}
                        {error instanceof Error
                          ? error.message
                          : t('quizContent.unknownError')}
                      </div>
                    );
                  }
                })}
              </CardContent>

              <CardFooter className="flex justify-center gap-4 pt-2">
                {!showResults ? (
                  <Button
                    onClick={async () => {
                      if (userId && answeredCount === quiz.questions.length) {
                        const score = calculateScore();
                        const correctAnswers = userAnswers.reduce(
                          (count, answer, idx) => {
                            const question = quiz.questions[idx];
                            return (
                              count +
                              (answer === question.correctAnswer ? 1 : 0)
                            );
                          },
                          0
                        );

                        const timeTaken = Math.floor(Math.random() * 300) + 60;

                        if (!quiz.id) {
                          console.error(
                            "Error: quiz.id is missing! Cannot save quiz attempt."
                          );
                        } else {
                          const saved = await saveQuizAttempt(
                            quiz.id,
                            userId,
                            score,
                            quiz.questions.length,
                            correctAnswers,
                            userAnswers,
                            timeTaken
                          );

                          if (saved) {
                            console.log("✅ Quiz attempt saved successfully");
                          } else {
                            console.log("❌ Failed to save quiz attempt");
                          }
                        }
                      }

                      onGrade();
                      scrollToTop();
                    }}
                    disabled={answeredCount !== quiz.questions.length}
                    variant={answeredCount === quiz.questions.length ? "hero" : "outline"}
                    size="xl"
                    sound="success"
                    className={`w-full sm:w-auto text-base sm:text-lg min-h-[3.5rem] py-4 rounded-3xl border-4 shadow-xl transition-all duration-200 active:scale-95 ${answeredCount === quiz.questions.length
                      ? "border-primary hover:shadow-2xl hover:border-primary-foreground/20"
                      : "border-border opacity-50 cursor-not-allowed"
                      }`}>
                    {answeredCount !== quiz.questions.length
                      ? t('quizContent.answerAll', { total: quiz.questions.length, answered: answeredCount })
                      : t('quizContent.grade')}
                  </Button>
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
    </section>
  );
};

export default QuizContent;
