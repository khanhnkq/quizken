import type { Question } from "./quiz";

export interface QuizAttemptDetail {
  attempt_id: string;
  quiz_id: string;
  quiz_title: string;
  quiz_description?: string;
  quiz_prompt: string;
  quiz_questions: Question[];
  user_answers: number[];
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken_seconds?: number;
  completed_at: string;
  created_at: string;
}

export interface QuizAttemptAnswer {
  questionIndex: number;
  question: string;
  options: string[];
  userAnswer: number;
  correctAnswer: number;
  explanation?: string;
  isCorrect: boolean;
}

export interface QuizAttemptSummary {
  attempt: QuizAttemptDetail;
  answers: QuizAttemptAnswer[];
  statistics: {
    percentageCorrect: number;
    timePerQuestion: number;
    category: string;
    difficulty: string;
  };
}
