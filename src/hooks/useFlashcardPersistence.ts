import { useEffect, useState } from "react";
import type { FlashcardState } from "@/types/flashcard";

const FLASHCARD_STORAGE_KEY = "flashcard-state";
const FLASHCARD_SESSION_KEY = "flashcard-session-active";

export const useFlashcardPersistence = (state: FlashcardState | null) => {
  const [isFlashcardActive, setIsFlashcardActive] = useState(false);

  // Lưu trạng thái flashcard khi thay đổi
  useEffect(() => {
    if (state) {
      try {
        sessionStorage.setItem(FLASHCARD_STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error("Failed to save flashcard state:", error);
      }
    }
  }, [state]);

  // Khôi phục trạng thái flashcard khi component mount
  const restoreFlashcardState = (): FlashcardState | null => {
    try {
      const saved = sessionStorage.getItem(FLASHCARD_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Failed to restore flashcard state:", error);
      return null;
    }
  };

  // Xóa trạng thái flashcard khi cần
  const clearFlashcardState = () => {
    try {
      sessionStorage.removeItem(FLASHCARD_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear flashcard state:", error);
    }
  };

  // Activate flashcard session
  const activateFlashcard = () => {
    try {
      sessionStorage.setItem(FLASHCARD_SESSION_KEY, "true");
      setIsFlashcardActive(true);
    } catch (error) {
      console.error("Failed to activate flashcard session:", error);
    }
  };

  // Deactivate flashcard session
  const deactivateFlashcard = () => {
    try {
      sessionStorage.removeItem(FLASHCARD_SESSION_KEY);
      setIsFlashcardActive(false);
    } catch (error) {
      console.error("Failed to deactivate flashcard session:", error);
    }
  };

  // Check if flashcard session is active on mount
  useEffect(() => {
    try {
      const isActive = sessionStorage.getItem(FLASHCARD_SESSION_KEY) === "true";
      setIsFlashcardActive(isActive);
    } catch (error) {
      console.error("Failed to check flashcard session:", error);
    }
  }, []);

  return {
    isFlashcardActive,
    restoreFlashcardState,
    clearFlashcardState,
    activateFlashcard,
    deactivateFlashcard,
  };
};

export default useFlashcardPersistence;
