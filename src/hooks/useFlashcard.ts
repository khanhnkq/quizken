import { useState, useEffect, useCallback } from "react";
import type { Quiz } from "@/types/quiz";
import type {
  Flashcard,
  FlashcardSession,
  FlashcardState,
} from "@/types/flashcard";
import {
  convertQuizToFlashcards,
  FLASHCARD_STORAGE_KEYS,
} from "@/types/flashcard";

interface FlashcardHistoryItem {
  quizId: string;
  quizTitle: string;
  lastAccessed: string;
}

export const useFlashcard = (quiz: Quiz | null) => {
  const [state, setState] = useState<FlashcardState>({
    session: null,
    isLoading: false,
    error: null,
  });

  // Initialize flashcard session from quiz
  const initializeSession = useCallback((quizData: Quiz) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const flashcards = convertQuizToFlashcards(quizData);
      const quizId = quizData.id || "unknown";

      // Try to load saved session from localStorage
      const savedSession = localStorage.getItem(
        FLASHCARD_STORAGE_KEYS.SESSION(quizId)
      );

      let session: FlashcardSession;

      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        // Validate saved session data
        if (parsed && parsed.quizId === quizId && parsed.flashcards) {
          session = {
            ...parsed,
            flashcards, // Always use fresh flashcards data
            totalCards: flashcards.length,
          };
        } else {
          // Create new session if saved data is invalid
          session = {
            quizId,
            quizTitle: quizData.title,
            flashcards,
            currentIndex: 0,
            isFlipped: false,
            totalCards: flashcards.length,
          };
        }
      } else {
        // Create new session
        session = {
          quizId,
          quizTitle: quizData.title,
          flashcards,
          currentIndex: 0,
          isFlipped: false,
          totalCards: flashcards.length,
        };
      }

      setState({
        session,
        isLoading: false,
        error: null,
      });

      // Save to localStorage
      localStorage.setItem(
        FLASHCARD_STORAGE_KEYS.SESSION(quizId),
        JSON.stringify(session)
      );

      // Add to history
      const history: FlashcardHistoryItem[] = JSON.parse(
        localStorage.getItem(FLASHCARD_STORAGE_KEYS.HISTORY) || "[]"
      );
      const updatedHistory = [
        {
          quizId,
          quizTitle: quizData.title,
          lastAccessed: new Date().toISOString(),
        },
        ...history.filter(
          (item: FlashcardHistoryItem) => item.quizId !== quizId
        ),
      ].slice(0, 10); // Keep only last 10 items

      localStorage.setItem(
        FLASHCARD_STORAGE_KEYS.HISTORY,
        JSON.stringify(updatedHistory)
      );
    } catch (error) {
      setState({
        session: null,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to initialize flashcard session",
      });
    }
  }, []);

  // Navigate to previous card
  const goToPrevious = useCallback(() => {
    if (!state.session) return;

    const newIndex = Math.max(0, state.session.currentIndex - 1);
    const updatedSession = {
      ...state.session,
      currentIndex: newIndex,
      isFlipped: false, // Reset flip state when navigating
    };

    setState((prev) => ({ ...prev, session: updatedSession }));

    // Save to localStorage
    localStorage.setItem(
      FLASHCARD_STORAGE_KEYS.SESSION(state.session.quizId),
      JSON.stringify(updatedSession)
    );
  }, [state.session]);

  // Navigate to next card
  const goToNext = useCallback(() => {
    if (!state.session) return;

    const newIndex = Math.min(
      state.session.totalCards - 1,
      state.session.currentIndex + 1
    );
    const updatedSession = {
      ...state.session,
      currentIndex: newIndex,
      isFlipped: false, // Reset flip state when navigating
    };

    setState((prev) => ({ ...prev, session: updatedSession }));

    // Save to localStorage
    localStorage.setItem(
      FLASHCARD_STORAGE_KEYS.SESSION(state.session.quizId),
      JSON.stringify(updatedSession)
    );
  }, [state.session]);

  // Jump to specific card
  const goToCard = useCallback(
    (index: number) => {
      if (!state.session) return;

      const validIndex = Math.max(
        0,
        Math.min(state.session.totalCards - 1, index)
      );
      const updatedSession = {
        ...state.session,
        currentIndex: validIndex,
        isFlipped: false, // Reset flip state when navigating
      };

      setState((prev) => ({ ...prev, session: updatedSession }));

      // Save to localStorage
      localStorage.setItem(
        FLASHCARD_STORAGE_KEYS.SESSION(state.session.quizId),
        JSON.stringify(updatedSession)
      );
    },
    [state.session]
  );

  // Toggle flip state
  const toggleFlip = useCallback(() => {
    if (!state.session) return;

    const updatedSession = {
      ...state.session,
      isFlipped: !state.session.isFlipped,
    };

    setState((prev) => ({ ...prev, session: updatedSession }));

    // Save to localStorage
    localStorage.setItem(
      FLASHCARD_STORAGE_KEYS.SESSION(state.session.quizId),
      JSON.stringify(updatedSession)
    );
  }, [state.session]);

  // Reset session
  const resetSession = useCallback(() => {
    if (!state.session) return;

    const updatedSession = {
      ...state.session,
      currentIndex: 0,
      isFlipped: false,
    };

    setState((prev) => ({ ...prev, session: updatedSession }));

    // Save to localStorage
    localStorage.setItem(
      FLASHCARD_STORAGE_KEYS.SESSION(state.session.quizId),
      JSON.stringify(updatedSession)
    );
  }, [state.session]);

  // Clear session data
  const clearSession = useCallback(() => {
    if (state.session) {
      localStorage.removeItem(
        FLASHCARD_STORAGE_KEYS.SESSION(state.session.quizId)
      );
    }

    setState({
      session: null,
      isLoading: false,
      error: null,
    });
  }, [state.session]);

  // Initialize when quiz is provided
  useEffect(() => {
    if (quiz) {
      initializeSession(quiz);
    } else {
      clearSession();
    }
  }, [quiz, initializeSession, clearSession]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!state.session) return;

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          goToPrevious();
          break;
        case "ArrowRight":
          event.preventDefault();
          goToNext();
          break;
        case " ":
        case "Enter":
          event.preventDefault();
          toggleFlip();
          break;
        case "Escape":
          event.preventDefault();
          clearSession();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.session, goToPrevious, goToNext, toggleFlip, clearSession]);

  return {
    session: state.session,
    isLoading: state.isLoading,
    error: state.error,
    currentFlashcard:
      state.session?.flashcards[state.session?.currentIndex] || null,
    currentIndex: state.session?.currentIndex || 0,
    totalCards: state.session?.totalCards || 0,
    isFlipped: state.session?.isFlipped || false,
    canGoPrevious: (state.session?.currentIndex || 0) > 0,
    canGoNext:
      (state.session?.currentIndex || 0) < (state.session?.totalCards || 1) - 1,
    goToPrevious,
    goToNext,
    goToCard,
    toggleFlip,
    resetSession,
    clearSession,
  };
};
