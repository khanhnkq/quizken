import { useCallback, useEffect, useRef } from "react";
import { useBroadcastChannel, BroadcastMessage } from "./useBroadcastChannel";
import { useLeaderElection } from "./useLeaderElection";

type GenState = {
  quizId?: string;
  loading?: boolean;
  generationStatus?: string | null;
  generationProgress?: string;
  timestamp?: number;
};

const KEY = "currentQuizGeneration";
const LEGACY_ID = "currentQuizId";
const CHANNEL_NAME = "quiz-generation-persistence";

export const useGenerationPersistence = () => {
  const lastKnownStateRef = useRef<GenState | null>(null);

  // TEMPORARY: Disable leader election for localStorage to fix immediate issue
  // TODO: Re-enable after testing multi-tab coordination
  // const { isLeader } = useLeaderElection({
  //   channelName: `${CHANNEL_NAME}-leader`,
  //   onLeaderChange: (isLeader) => {
  //     if (isLeader) {
  //       console.log("This tab is now the leader for localStorage coordination");
  //     } else {
  //       console.log("This tab is no longer the leader for localStorage coordination");
  //     }
  //   },
  // });
  
  // Temporary fallback - always allow localStorage writes
  const isLeader = true;

  // TEMPORARY: Disable BroadcastChannel for localStorage to fix immediate issue
  // TODO: Re-enable after testing multi-tab coordination
  // const { postMessage, isSupported } = useBroadcastChannel({
  //   channelName: CHANNEL_NAME,
  //   onMessage: (message: BroadcastMessage) => {
  //     if (message.type === "state-update") {
  //       const newState = message.data as GenState;
  //       if (newState) {
  //         lastKnownStateRef.current = newState;
  //         console.log("Received state update from another tab:", newState);
  //       }
  //     } else if (message.type === "state-request") {
  //       // Another tab is requesting current state, send it if we're the leader
  //       if (isLeader) {
  //         const currentState = read();
  //         if (currentState) {
  //           postMessage("state-response", currentState);
  //         }
  //       }
  //     } else if (message.type === "state-response") {
  //       // Received state from leader tab
  //       const state = message.data as GenState;
  //       if (state) {
  //         lastKnownStateRef.current = state;
  //         console.log("Received state from leader tab:", state);
  //       }
  //     }
  //   },
  // });
  
  // Temporary fallback - disable cross-tab communication
  const postMessage = () => {};
  const isSupported = false;

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
  }, []);

  const setLegacyId = useCallback((id: string) => {
    // TEMPORARY: Always set legacy ID (no coordination)
    localStorage.setItem(LEGACY_ID, id);
  }, []);

  const getLegacyId = useCallback((): string | null => {
    // TEMPORARY: Always get legacy ID (no coordination)
    return localStorage.getItem(LEGACY_ID);
  }, []);

  // TEMPORARY: Disable state request (no coordination)
  // useEffect(() => {
  //   if (!isLeader && isSupported) {
  //     postMessage("state-request", { tabId: "requesting" });
  //   }
  // }, [isLeader, isSupported, postMessage]);

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
