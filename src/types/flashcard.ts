import type { Quiz, Question } from "./quiz";

export interface Flashcard {
  id: string;
  questionIndex: number;
  question: string;
  answer: string; // Đáp án đúng
  options: string[]; // Tất cả lựa chọn
  explanation: string; // Giải thích chi tiết
  correctOptionIndex: number; // Chỉ mục của đáp án đúng
}

export interface FlashcardSession {
  quizId: string;
  quizTitle: string;
  flashcards: Flashcard[];
  currentIndex: number;
  isFlipped: boolean; // Trạng thái lật thẻ
  totalCards: number;
}

export interface FlashcardState {
  session: FlashcardSession | null;
  isLoading: boolean;
  error: string | null;
}

export interface FlashcardControlsProps {
  currentIndex: number;
  totalCards: number;
  onPrevious: () => void;
  onNext: () => void;
  onFlip: () => void;
  isFlipped: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export interface FlashcardCardProps {
  flashcard: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  currentIndex: number;
  totalCards: number;
}

export interface FlashcardViewProps {
  quiz: Quiz;
  onBack: () => void;
}

// Helper function to convert Quiz to Flashcard array
export const convertQuizToFlashcards = (quiz: Quiz): Flashcard[] => {
  return quiz.questions.map((question: Question, index: number) => ({
    id: `${quiz.id || "unknown"}-${index}`,
    questionIndex: index,
    question: question.question,
    answer: question.options[question.correctAnswer],
    options: question.options,
    explanation: question.explanation,
    correctOptionIndex: question.correctAnswer,
  }));
};

// localStorage keys for persistence
export const FLASHCARD_STORAGE_KEYS = {
  SESSION: (quizId: string) => `flashcard_session_${quizId}`,
  HISTORY: "flashcard_history",
} as const;
