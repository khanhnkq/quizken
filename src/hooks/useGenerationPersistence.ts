import { useCallback } from "react";

type GenState = {
  quizId?: string;
  loading?: boolean;
  generationStatus?: string | null;
  generationProgress?: string;
  timestamp?: number;
};

const KEY = "currentQuizGeneration";
const LEGACY_ID = "currentQuizId";

export const useGenerationPersistence = () => {
  const read = useCallback((): GenState | null => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw) as GenState;
    } catch {
      return null;
    }
  }, []);

  const write = useCallback(
    (partial: GenState) => {
      try {
        const current = read() || {};
        const next = {
          ...current,
          ...partial,
          timestamp: Date.now(),
        } as GenState;
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch (e) {
        // Log to help debug storage issues (e.g. quota, privacy settings)
         
        console.warn("useGenerationPersistence write error:", e);
      }
    },
    [read]
  );

  const clear = useCallback(() => {
    localStorage.removeItem(KEY);
    localStorage.removeItem(LEGACY_ID);
  }, []);

  const setLegacyId = useCallback((id: string) => {
    localStorage.setItem(LEGACY_ID, id);
  }, []);

  const getLegacyId = useCallback((): string | null => {
    return localStorage.getItem(LEGACY_ID);
  }, []);

  return { read, write, clear, setLegacyId, getLegacyId };
};
