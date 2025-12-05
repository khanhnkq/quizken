import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Quiz } from "@/types/quiz";

interface TokenUsage {
  prompt: number;
  candidates: number;
  total: number;
}

interface QuizState {
  prompt: string;
  questionCount: string;
  quiz: Quiz | null;
  userAnswers: number[];
  showResults: boolean;
  tokenUsage: TokenUsage | null;
  setPrompt: (v: string) => void;
  setQuestionCount: (v: string) => void;
  setQuiz: (q: Quiz | null) => void;
  setUserAnswers: (a: number[]) => void;
  setShowResults: (v: boolean) => void;
  setTokenUsage: (t: TokenUsage | null) => void;
  reset: () => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      prompt: "",
      questionCount: "",
      quiz: null,
      userAnswers: [],
      showResults: false,
      tokenUsage: null,
      setPrompt: (v) => set({ prompt: v }),
      setQuestionCount: (v) => set({ questionCount: v }),
      setQuiz: (q) => set({ quiz: q }),
      setUserAnswers: (a) => set({ userAnswers: a }),
      setShowResults: (v) => set({ showResults: v }),
      setTokenUsage: (t) => set({ tokenUsage: t }),
      reset: () =>
        set({
          prompt: "",
          questionCount: "",
          quiz: null,
          userAnswers: [],
          showResults: false,
          tokenUsage: null,
        }),
    }),
    {
      name: "quiz-storage",
      partialize: (state) => ({
        quiz: state.quiz,
        userAnswers: state.userAnswers,
        showResults: state.showResults,
        tokenUsage: state.tokenUsage,
      }),
    }
  )
);

export default useQuizStore;
