import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download, Sparkles } from "lucide-react";
import { ScrollVelocityContainer, ScrollVelocityRow } from "./ScrollVelocity";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Quiz {
  title: string;
  description: string;
  questions: Question[];
}

const QuizGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const generateQuiz = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Describe what kind of quiz you want to create",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const enhancedPrompt = `Generate exactly 30 quiz questions. ${prompt}`;
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { prompt: enhancedPrompt },
      });

      if (error) throw error;

      if (data?.quiz) {
        setQuiz(data.quiz);
        setUserAnswers([]); // Reset user answers for new quiz
        setShowResults(false); // Reset results view for new quiz
        toast({
          title: "Quiz Generated!",
          description: `Created "${data.quiz.title}" with ${data.quiz.questions.length} questions`,
        });
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast({
        title: "Generation Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const gradeQuiz = () => {
    if (!quiz || userAnswers.length !== quiz.questions.length) {
      toast({
        title: "Complete the quiz first",
        description: "Please answer all questions before grading",
        variant: "destructive",
      });
      return;
    }
    setShowResults(true);
  };

  const resetQuiz = () => {
    setUserAnswers([]);
    setShowResults(false);
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    let correct = 0;
    userAnswers.forEach((answer, index) => {
      if (answer === quiz.questions[index].correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const downloadQuiz = () => {
    if (!quiz) return;

    const dataStr = JSON.stringify(quiz, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${quiz.title.replace(/\s+/g, "-").toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section
      id="generator"
      className="relative overflow-hidden bg-gradient-to-b from-secondary/30 to-background min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Background scroll velocity effect - within section container */}
        <div className="absolute inset-0 -z-10 opacity-5">
          <ScrollVelocityContainer className="text-6xl md:text-8xl font-bold">
            <ScrollVelocityRow baseVelocity={40} rowIndex={0}>
              AI Education Smart Learning Intelligent Teaching Digital Classroom
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={1}>
              Adaptive Assessment Personalized Learning Virtual Teacher
              Cognitive Training
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={2}>
              Educational Analytics Student Engagement Knowledge Discovery
              Learning Analytics
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={3}>
              Artificial Intelligence Machine Learning Neural Networks Cognitive
              Computing
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={4}>
              Interactive Assessment Educational Technology Intelligent Tutoring
              Automated Grading
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={5}>
              AI Education Smart Learning Intelligent Teaching Digital Classroom
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={6}>
              Adaptive Assessment Personalized Learning Virtual Teacher
              Cognitive Training
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={7}>
              Educational Analytics Student Engagement Knowledge Discovery
              Learning Analytics
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={8}>
              Artificial Intelligence Machine Learning Neural Networks Cognitive
              Computing
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={9}>
              Interactive Assessment Educational Technology Intelligent Tutoring
              Automated Grading
            </ScrollVelocityRow>
          </ScrollVelocityContainer>
        </div>
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Sparkles className="w-16 h-16 text-[#B5CC89]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Generate Your Quiz
          </h2>
          <p className="text-lg text-muted-foreground">
            Describe your quiz topic and let AI create engaging questions
          </p>
        </div>

        <Card className="mb-8 border-2 hover:border-primary transition-colors duration-300 hover:shadow-lg">
          <CardContent className="p-8 space-y-4">
            <div className="text-center space-y-2 mb-6">
              <h3 className="text-2xl font-bold">Quiz Prompt</h3>
              <p className="text-muted-foreground">
                Be specific about the topic, difficulty level, and any special
                requirements. The quiz will contain exactly 30 questions.
              </p>
            </div>
            <Textarea
              placeholder="Example: Create a quiz about World War 2 history for high school students. Include questions about major battles, key figures, and the war's impact on society. (Will generate exactly 30 questions)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px]"
            />
            <Button
              onClick={generateQuiz}
              disabled={loading}
              variant="hero"
              size="lg"
              className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Generating..." : "Generate Quiz"}
            </Button>
          </CardContent>
        </Card>

        {quiz && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold">{quiz.title}</h3>
                <p className="text-muted-foreground mt-2">{quiz.description}</p>
                {showResults && (
                  <div className="mt-4 p-4 bg-[#B5CC89]/10 rounded-lg">
                    <h4 className="text-lg font-semibold">
                      Your Score: {calculateScore()}/{quiz.questions.length} (
                      {Math.round(
                        (calculateScore() / quiz.questions.length) * 100
                      )}
                      %)
                    </h4>
                  </div>
                )}
              </div>
              <Button onClick={downloadQuiz} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>

            <div className="space-y-4">
              {quiz.questions.map((q, idx) => (
                <Card
                  key={idx}
                  className="border-2 hover:border-[#B5CC89] transition-colors duration-300 hover:shadow-lg">
                  <CardContent className="p-8 space-y-4">
                    <div className="text-center space-y-2 mb-6">
                      <h3 className="text-2xl font-bold">Question {idx + 1}</h3>
                      <p className="text-lg">{q.question}</p>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        {q.options.map((option, optIdx) => {
                          const isSelected = userAnswers[idx] === optIdx;
                          const isCorrect = optIdx === q.correctAnswer;
                          const userSelectedWrong =
                            showResults && isSelected && !isCorrect;
                          const userSelectedCorrect =
                            showResults && isSelected && isCorrect;

                          return (
                            <label
                              key={optIdx}
                              className={`flex items-center p-3 rounded-lg border cursor-pointer ${
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
                                onChange={() => handleAnswerSelect(idx, optIdx)}
                                disabled={showResults}
                                className="mr-3"
                              />
                              <span className="font-medium mr-2">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              <span className="flex-1">{option}</span>
                              {showResults && isCorrect && (
                                <span className="ml-2 text-green-600 font-semibold">
                                  ✓ Correct Answer
                                </span>
                              )}
                              {userSelectedWrong && (
                                <span className="ml-2 text-red-600 font-semibold">
                                  ✗ Your Answer
                                </span>
                              )}
                              {userSelectedCorrect && (
                                <span className="ml-2 text-green-600 font-semibold">
                                  ✓ Your Answer
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                      {showResults && (
                        <div className="pt-2 border-t">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-semibold">Explanation:</span>{" "}
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center gap-4 pt-6">
              {!showResults ? (
                <Button onClick={gradeQuiz} variant="default" size="lg">
                  Grade Quiz
                </Button>
              ) : (
                <Button onClick={resetQuiz} variant="outline" size="lg">
                  Retake Quiz
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default QuizGenerator;
