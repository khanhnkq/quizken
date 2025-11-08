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

  // Initialize flashcard session from quiz - NO dependencies on state
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
  }, []); // ✅ Empty dependencies - stable function

  // Navigate to previous card - Use functional setState
  const goToPrevious = useCallback(() => {
    setState((prev) => {
      if (!prev.session) return prev;

      const newIndex = Math.max(0, prev.session.currentIndex - 1);
      const updatedSession = {
        ...prev.session,
        currentIndex: newIndex,
        isFlipped: false,
      };

      // Save to localStorage
      localStorage.setItem(
        FLASHCARD_STORAGE_KEYS.SESSION(prev.session.quizId),
        JSON.stringify(updatedSession)
      );

      return { ...prev, session: updatedSession };
    });
  }, []); // ✅ Empty dependencies - stable function

  // Navigate to next card - Use functional setState
  const goToNext = useCallback(() => {
    setState((prev) => {
      if (!prev.session) return prev;

      const newIndex = Math.min(
        prev.session.totalCards - 1,
        prev.session.currentIndex + 1
      );
      const updatedSession = {
        ...prev.session,
        currentIndex: newIndex,
        isFlipped: false,
      };

      // Save to localStorage
      localStorage.setItem(
        FLASHCARD_STORAGE_KEYS.SESSION(prev.session.quizId),
        JSON.stringify(updatedSession)
      );

      return { ...prev, session: updatedSession };
    });
  }, []); // ✅ Empty dependencies - stable function

  // Jump to specific card - Use functional setState
  const goToCard = useCallback((index: number) => {
    setState((prev) => {
      if (!prev.session) return prev;

      const validIndex = Math.max(
        0,
        Math.min(prev.session.totalCards - 1, index)
      );
      const updatedSession = {
        ...prev.session,
        currentIndex: validIndex,
        isFlipped: false,
      };

      // Save to localStorage
      localStorage.setItem(
        FLASHCARD_STORAGE_KEYS.SESSION(prev.session.quizId),
        JSON.stringify(updatedSession)
      );

      return { ...prev, session: updatedSession };
    });
  }, []); // ✅ Empty dependencies - stable function

  // Toggle flip state - Use functional setState
  const toggleFlip = useCallback(() => {
    setState((prev) => {
      if (!prev.session) return prev;

      const updatedSession = {
        ...prev.session,
        isFlipped: !prev.session.isFlipped,
      };

      // Save to localStorage
      localStorage.setItem(
        FLASHCARD_STORAGE_KEYS.SESSION(prev.session.quizId),
        JSON.stringify(updatedSession)
      );

      return { ...prev, session: updatedSession };
    });
  }, []); // ✅ Empty dependencies - stable function

  // Reset session - Use functional setState
  const resetSession = useCallback(() => {
    setState((prev) => {
      if (!prev.session) return prev;

      const updatedSession = {
        ...prev.session,
        currentIndex: 0,
        isFlipped: false,
      };

      // Save to localStorage
      localStorage.setItem(
        FLASHCARD_STORAGE_KEYS.SESSION(prev.session.quizId),
        JSON.stringify(updatedSession)
      );

      return { ...prev, session: updatedSession };
    });
  }, []); // ✅ Empty dependencies - stable function

  // Clear session data - Use functional setState
  const clearSession = useCallback(() => {
    setState((prev) => {
      if (prev.session) {
        localStorage.removeItem(
          FLASHCARD_STORAGE_KEYS.SESSION(prev.session.quizId)
        );
      }

      return {
        session: null,
        isLoading: false,
        error: null,
      };
    });
  }, []); // ✅ Empty dependencies - stable function

  // Initialize when quiz is provided - Only depends on quiz ID change
  useEffect(() => {
    if (quiz) {
      initializeSession(quiz);
    } else {
      clearSession();
    }
    // ✅ Only quiz as dependency - initializeSession and clearSession are now stable
  }, [quiz, initializeSession, clearSession]);

  // Keyboard navigation - Only active when session exists
  useEffect(() => {
    // Only setup keyboard if there's a session
    if (!state.session) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't interfere with input fields
      const target = event.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      // Allow normal browser navigation with Alt+Arrow keys
      if (event.altKey) return;

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
    // ✅ Setup/cleanup when session changes
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
