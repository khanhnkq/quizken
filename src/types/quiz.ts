import type {
  QuizCategory,
  QuizDifficulty,
} from "@/lib/constants/quizCategories";

export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  image?: string | null;
}

export interface Quiz {
  id?: string;
  title: string;
  description?: string | null;
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

// Structures hỗ trợ shuffle với mapping về thứ tự gốc
export interface OptionMapping {
  // Chỉ mục câu hỏi trong thứ tự mới
  questionIndex: number;
  // Ánh xạ chỉ mục đáp án: chỉ mục mới -> chỉ mục gốc
  optionOrder: number[];
}

export interface ShuffledQuizData {
  // Bản quiz sau khi shuffle để hiển thị
  shuffledQuiz: Quiz;
  // Ánh xạ câu hỏi: chỉ mục mới -> chỉ mục gốc
  originalQuestionOrder: number[];
  // Ánh xạ đáp án cho từng câu hỏi: chỉ mục mới -> chỉ mục gốc
  optionMappings: OptionMapping[];
}
