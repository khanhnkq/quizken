import type { QuizCategory, QuizDifficulty } from "@/lib/constants/quizCategories";

export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  title: string;
  description: string;
  questions: Question[];
  category?: QuizCategory;
  difficulty?: QuizDifficulty;
  tags?: string[];
  tokenUsage?: {
    prompt: number;
    candidates: number;
    total: number;
  };
}
