import { useCallback, useEffect, useRef } from "react";


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
  const lastKnownStateRef = useRef<GenState | null>(null);


  // Simplified persistence without cross-tab complexity for now
  // relying on Supabase Realtime for synchronization across tabs
  const isLeader = true;

  const read = useCallback((): GenState | null => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const state = JSON.parse(raw) as GenState;
      lastKnownStateRef.current = state;
      return state;
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

        // TEMPORARY: Always write to localStorage (no coordination)
        localStorage.setItem(KEY, JSON.stringify(next));
        lastKnownStateRef.current = next;

        // Dispatch custom event for same-tab listeners (GlobalQuizListener)
        window.dispatchEvent(new Event("generation-storage-update"));
      } catch (e) {
        // Log to help debug storage issues (e.g. quota, privacy settings)
        console.warn("useGenerationPersistence write error:", e);
      }
    },
    [read]
  );

  const clear = useCallback(() => {
    // TEMPORARY: Always clear localStorage (no coordination)
    localStorage.removeItem(KEY);
    localStorage.removeItem(LEGACY_ID);
    lastKnownStateRef.current = null;

    // Dispatch custom event for same-tab listeners
    window.dispatchEvent(new Event("generation-storage-update"));
  }, []);

  const setLegacyId = useCallback((id: string) => {
    // TEMPORARY: Always set legacy ID (no coordination)
    localStorage.setItem(LEGACY_ID, id);
  }, []);

  const getLegacyId = useCallback((): string | null => {
    // TEMPORARY: Always get legacy ID (no coordination)
    return localStorage.getItem(LEGACY_ID);
  }, []);


  return {
    read,
    write,
    clear,
    setLegacyId,
    getLegacyId,
    isLeader,
    lastKnownState: lastKnownStateRef.current,
  };
};
