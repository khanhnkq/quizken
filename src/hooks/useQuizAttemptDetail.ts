import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type {
  QuizAttemptDetail,
  QuizAttemptAnswer,
  QuizAttemptSummary,
} from "@/types/quizAttempt";
import type { Question } from "@/types/quiz";

export function useQuizAttemptDetail(attemptId?: string) {
  const [attemptDetail, setAttemptDetail] = useState<QuizAttemptDetail | null>(
    null
  );
  const [attemptSummary, setAttemptSummary] =
    useState<QuizAttemptSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttemptDetail = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // First, get the attempt details
      const { data: attemptData, error: attemptError } = await supabase
        .from("quiz_attempts")
        .select(
          `
          id,
          quiz_id,
          score,
          total_questions,
          correct_answers,
          answers,
          time_taken_seconds,
          completed_at,
          created_at,
          user_id
        `
        )
        .eq("id", id)
        .single();

      if (attemptError) {
        console.error("Error fetching attempt:", attemptError);
        setError(attemptError.message);
        return;
      }

      if (!attemptData) {
        setError("Quiz attempt not found");
        return;
      }

      // Then get the quiz details
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select(
          `
          title,
          description,
          prompt,
          questions,
          category,
          difficulty
        `
        )
        .eq("id", attemptData.quiz_id)
        .single();

      if (quizError) {
        console.error("Error fetching quiz:", quizError);
        setError(quizError.message);
        return;
      }

      if (!quizData) {
        setError("Quiz not found");
        return;
      }

      // Normalize questions to ensure they match the Question interface
      const normalizeQuestions = (raw: unknown): Question[] => {
        const arr = Array.isArray(raw) ? raw : [];
        return arr.map((q) => {
          const obj: Record<string, unknown> =
            typeof q === "object" && q !== null
              ? (q as Record<string, unknown>)
              : {};
          const question =
            typeof obj.question === "string"
              ? obj.question
              : String(obj.question ?? "");
          const options = Array.isArray(obj.options)
            ? (obj.options as unknown[]).map((o) => String(o ?? ""))
            : [];
          const correctAnswer =
            typeof obj.correctAnswer === "number" ? obj.correctAnswer : 0;
          const explanation =
            typeof obj.explanation === "string" ? obj.explanation : undefined;
          return { question, options, correctAnswer, explanation };
        });
      };

      const questions = normalizeQuestions(attemptData.quiz_questions);
      const userAnswers = Array.isArray(attemptData.user_answers)
        ? attemptData.user_answers.map((a: unknown) =>
            typeof a === "number" ? a : 0
          )
        : [];

      // Create the attempt detail object
      const detail: QuizAttemptDetail = {
        attempt_id: attemptData.attempt_id,
        quiz_id: attemptData.quiz_id,
        quiz_title: attemptData.quiz_title,
        quiz_description: attemptData.quiz_description,
        quiz_prompt: attemptData.quiz_prompt,
        quiz_questions: questions,
        user_answers: userAnswers,
        score: parseFloat(attemptData.score.toString()) || 0,
        total_questions: attemptData.total_questions,
        correct_answers: attemptData.correct_answers,
        time_taken_seconds: attemptData.time_taken_seconds,
        completed_at: attemptData.completed_at,
        created_at: attemptData.created_at,
      };

      // Create detailed answers with comparison
      const answers: QuizAttemptAnswer[] = questions.map((question, index) => ({
        questionIndex: index,
        question: question.question,
        options: question.options,
        userAnswer: userAnswers[index] || 0,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        isCorrect: (userAnswers[index] || 0) === question.correctAnswer,
      }));

      // Create summary statistics
      const summary: QuizAttemptSummary = {
        attempt: detail,
        answers,
        statistics: {
          percentageCorrect:
            detail.correct_answers > 0
              ? (detail.correct_answers / detail.total_questions) * 100
              : 0,
          timePerQuestion: detail.time_taken_seconds
            ? detail.time_taken_seconds / detail.total_questions
            : 0,
          category: attemptData.quiz_category || "Chưa phân loại",
          difficulty: attemptData.quiz_difficulty || "Trung bình",
        },
      };

      setAttemptDetail(detail);
      setAttemptSummary(summary);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Failed to fetch attempt details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (attemptId) {
      fetchAttemptDetail(attemptId);
    }
  }, [attemptId]);

  return {
    attemptDetail,
    attemptSummary,
    isLoading,
    error,
    refetch: () => attemptId && fetchAttemptDetail(attemptId),
  };
}
