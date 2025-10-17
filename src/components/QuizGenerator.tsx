import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download } from "lucide-react";

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
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { prompt },
      });

      if (error) throw error;

      if (data?.quiz) {
        setQuiz(data.quiz);
        toast({
          title: "Quiz Generated!",
          description: `Created "${data.quiz.title}" with ${data.quiz.questions.length} questions`,
        });
      }
    } catch (error: any) {
      console.error("Error generating quiz:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
    <section id="generator" className="py-20 px-4 bg-secondary/10">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Generate Your Quiz
          </h2>
          <p className="text-lg text-muted-foreground">
            Describe your quiz topic and let AI create engaging questions
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quiz Prompt</CardTitle>
            <CardDescription>
              Be specific about the topic, difficulty level, and any special requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Example: Create a quiz about World War 2 history for high school students. Include questions about major battles, key figures, and the war's impact on society."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px]"
            />
            <Button
              onClick={generateQuiz}
              disabled={loading}
              variant="hero"
              size="lg"
              className="w-full"
            >
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
              </div>
              <Button onClick={downloadQuiz} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>

            <div className="space-y-4">
              {quiz.questions.map((q, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Question {idx + 1}: {q.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      {q.options.map((option, optIdx) => (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-lg border ${
                            optIdx === q.correctAnswer
                              ? "bg-primary/10 border-primary"
                              : "bg-muted/50"
                          }`}
                        >
                          <span className="font-medium mr-2">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          {option}
                          {optIdx === q.correctAnswer && (
                            <span className="ml-2 text-primary font-semibold">✓ Correct</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold">Explanation:</span> {q.explanation}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default QuizGenerator;
