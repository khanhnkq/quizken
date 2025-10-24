import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, Sparkles } from "@/lib/icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Quiz, Question } from "@/types/quiz";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useAudio } from "@/contexts/SoundContext";

gsap.registerPlugin(ScrollToPlugin);

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
}) => {
  const questionRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const scoreRef = React.useRef<HTMLDivElement | null>(null);
  const answeredCount = React.useMemo(
    () => userAnswers.filter((ans) => ans !== undefined).length,
    [userAnswers]
  );
  const completionPercent = React.useMemo(() => {
    if (!quiz.questions.length) return 0;
    return Math.round((answeredCount / quiz.questions.length) * 100);
  }, [answeredCount, quiz.questions.length]);

  const { play } = useAudio();

  const handleNavigateQuestion = (index: number, highlight: boolean = true) => {
    const target = questionRefs.current[index];
    if (target) {
      const elementTop =
        target.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition =
        elementTop - window.innerHeight / 2 + target.offsetHeight / 2;

      gsap.to(window, {
        duration: 0.6,
        scrollTo: { y: offsetPosition, autoKill: true },
        ease: "power2.out",
      });

      if (highlight) {
        target.classList.add("ring", "ring-[#B5CC89]", "ring-offset-2");
        window.setTimeout(() => {
          target.classList.remove("ring", "ring-[#B5CC89]", "ring-offset-2");
        }, 1200);
      }
    }
  };

  const scrollToGenerator = () => {
    const el = document.getElementById("generator");
    if (!el) return;
    const yOffset = -5; // account for sticky navbar
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    onAnswerSelect(questionIndex, answerIndex);

    // Auto-scroll to next question if not the last one
    if (questionIndex < quiz.questions.length - 1) {
      setTimeout(() => {
        handleNavigateQuestion(questionIndex + 1, false);
      }, 300);
    }
  };

  const scrollToTop = () => {
    setTimeout(() => {
      // Try to find score display first
      const scoreElement = document.querySelector(
        "[data-score-display]"
      ) as HTMLElement;
      if (scoreElement) {
        const elementTop =
          scoreElement.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition =
          elementTop - window.innerHeight / 2 + scoreElement.offsetHeight / 2;

        gsap.to(window, {
          duration: 0.8,
          scrollTo: { y: offsetPosition, autoKill: true },
          ease: "power2.inOut",
        });
        return;
      }

      // Fallback to section
      const quizSection = document.getElementById("quiz");
      if (quizSection) {
        gsap.to(window, {
          duration: 0.8,
          scrollTo: { y: quizSection, autoKill: true },
          ease: "power2.inOut",
        });
      }
    }, 150);
  };

  return (
    <section
      ref={sectionRef}
      id="quiz"
      className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/20 py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Quiz Section Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Sparkles className="w-12 h-12 text-[#B5CC89]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">{quiz.title}</h2>
          <p className="text-lg text-muted-foreground">
            {quiz.description ||
              "Trả lời các câu hỏi bên dưới và xem giải thích sau khi chấm điểm"}
          </p>
        </div>
        <Card ref={cardRef} className="border-2 rounded-xl shadow-lg bg-card">
          <CardHeader className="pb-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="secondary">Bài kiểm tra</Badge>
                  <Badge className="text-xs">
                    {quiz.questions.length} câu hỏi
                    {tokenUsage && (
                      <span className="ml-1 opacity-75">
                        ({tokenUsage.total} token)
                      </span>
                    )}
                  </Badge>
                </div>
                <CardTitle className="text-2xl md:text-3xl">
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
                    size="sm"
                    sound="alert"
                    className="flex-1 lg:flex-initial">
                    Làm lại
                  </Button>
                )}
                <Button
                  onClick={onDownload}
                  variant="outline"
                  size="sm"
                  sound="success"
                  className="flex-1 lg:flex-initial">
                  <Download className="mr-2 h-4 w-4" />
                  <span className="hidden xs:inline">Tải PDF</span>
                  <span className="xs:hidden">PDF</span>
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
                <span>Tiến độ</span>
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
                    Điểm của bạn: {calculateScore()}/{quiz.questions.length} (
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
                  const isIncorrect = showResults && isAnswered && !isCorrect;
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
                      className={`relative w-10 h-10 rounded-full ${stateClasses}`}
                      onClick={() => handleNavigateQuestion(idx)}
                      title={`Câu ${idx + 1}: ${
                        isCorrect
                          ? "Đúng"
                          : isIncorrect
                          ? "Sai"
                          : isAnswered
                          ? "Đã trả lời"
                          : "Chưa trả lời"
                      }`}>
                      <span className="relative z-10">{idx + 1}</span>
                      {showResults && isCorrect && (
                        <span className="pointer-events-none absolute -right-1 -top-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-white text-green-600 border border-green-600 text-[10px] font-bold">
                          ✓
                        </span>
                      )}
                      {showResults && isIncorrect && (
                        <span className="pointer-events-none absolute -right-1 -top-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-white text-red-600 border border-red-600 text-[10px] font-bold">
                          ✗
                        </span>
                      )}
                    </Button>
                  );
                })}
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Nhấp để đi tới câu hỏi tương ứng. Vòng tròn sáng màu thể hiện
                câu đã trả lời, đỏ là sai, xanh là đúng.
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {quiz.questions.map((q, idx) => {
              try {
                if (!q || typeof q.question !== "string") {
                  return (
                    <div key={idx} className="text-red-500">
                      Câu hỏi {idx} không hợp lệ
                    </div>
                  );
                }

                return (
                  <Card
                    key={idx}
                    ref={(element) => {
                      questionRefs.current[idx] = element;
                    }}
                    className="border-2 hover:border-[#B5CC89] transition-colors duration-300 hover:shadow-lg">
                    <CardContent className="p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4">
                      <div className="space-y-3">
                        {q.question && (
                          <h3 className="text-lg font-semibold text-foreground">
                            {idx + 1}. {q.question}
                          </h3>
                        )}
                        <div className="flex flex-col gap-2">
                          {q.options && Array.isArray(q.options) ? (
                            q.options.map((option, optIdx) => {
                              const isSelected = userAnswers[idx] === optIdx;
                              const isCorrect = optIdx === q.correctAnswer;
                              const userSelectedWrong =
                                showResults && isSelected && !isCorrect;
                              const userSelectedCorrect =
                                showResults && isSelected && isCorrect;

                              return (
                                <label
                                  key={optIdx}
                                  className={`flex items-start gap-2 p-2 sm:p-3 rounded-lg border cursor-pointer ${
                                    showResults && isCorrect
                                      ? "bg-green-50 border-green-500"
                                      : userSelectedWrong
                                      ? "bg-red-50 border-red-500"
                                      : userSelectedCorrect
                                      ? "bg-green-50 border-green-500"
                                      : "bg-muted/50 border-gray-200 hover:bg-muted/80"
                                  }`}>
                                  <input
                                    type="radio"
                                    name={`question-${idx}`}
                                    value={optIdx}
                                    checked={isSelected}
                                    onChange={() => {
                                      play("pop");
                                      handleAnswerSelect(idx, optIdx);
                                    }}
                                    disabled={showResults}
                                    className="h-4 w-4 shrink-0 mr-2 sm:mr-3 mt-0.5"
                                  />
                                  <span className="font-medium mr-2 select-none mt-0.5">
                                    {String.fromCharCode(65 + optIdx)}.
                                  </span>
                                  <span className="flex-1 whitespace-normal break-words leading-snug text-sm sm:text-base">
                                    {option}
                                  </span>
                                  {showResults && isCorrect && (
                                    <span className="ml-2 text-green-600 font-semibold">
                                      ✓ Đáp án đúng
                                    </span>
                                  )}
                                  {userSelectedWrong && (
                                    <span className="ml-2 text-red-600 font-semibold">
                                      ✗ Câu trả lời của bạn
                                    </span>
                                  )}
                                  {userSelectedCorrect && (
                                    <span className="ml-2 text-green-600 font-semibold">
                                      ✓ Câu trả lời của bạn
                                    </span>
                                  )}
                                </label>
                              );
                            })
                          ) : (
                            <div className="text-red-500">
                              Không có đáp án cho câu hỏi {idx}
                            </div>
                          )}
                        </div>
                        {showResults && q.explanation && (
                          <div className="pt-2 border-t">
                            <p className="text-sm text-muted-foreground">
                              <span className="font-semibold">Giải thích:</span>{" "}
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
                    Lỗi hiển thị câu hỏi {idx}:{" "}
                    {error instanceof Error
                      ? error.message
                      : "Lỗi không xác định"}
                  </div>
                );
              }
            })}
          </CardContent>

          <CardFooter className="flex justify-center gap-4 pt-2">
            {!showResults ? (
              <Button
                onClick={() => {
                  onGrade();
                  scrollToTop();
                }}
                disabled={answeredCount !== quiz.questions.length}
                variant="outline"
                size="lg"
                sound="success"
                className="w-full sm:w-auto text-sm sm:text-base !h-auto min-h-[2.75rem] py-3 !whitespace-normal break-words leading-snug hover:bg-primary hover:text-primary-foreground hover:border-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {answeredCount !== quiz.questions.length
                  ? `Vui lòng trả lời hết tất cả ${quiz.questions.length} câu hỏi (${answeredCount}/${quiz.questions.length} đã trả lời)`
                  : "Chấm điểm"}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  onReset();
                  scrollToTop();
                }}
                variant="outline"
                size="lg"
                sound="alert">
                Làm lại
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </section>
  );
};

export default QuizContent;
