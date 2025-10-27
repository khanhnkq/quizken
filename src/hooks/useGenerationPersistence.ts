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

  // Set up leader election for localStorage coordination
  const { isLeader } = useLeaderElection({
    channelName: `${CHANNEL_NAME}-leader`,
    onLeaderChange: (isLeader) => {
      if (isLeader) {
        console.log("This tab is now the leader for localStorage coordination");
      } else {
        console.log("This tab is no longer the leader for localStorage coordination");
      }
    },
  });

  // Set up BroadcastChannel for cross-tab communication
  const { postMessage, isSupported } = useBroadcastChannel({
    channelName: CHANNEL_NAME,
    onMessage: (message: BroadcastMessage) => {
      if (message.type === "state-update") {
        const newState = message.data as GenState;
        if (newState) {
          lastKnownStateRef.current = newState;
          console.log("Received state update from another tab:", newState);
        }
      } else if (message.type === "state-request") {
        // Another tab is requesting current state, send it if we're the leader
        if (isLeader) {
          const currentState = read();
          if (currentState) {
            postMessage("state-response", currentState);
          }
        }
      } else if (message.type === "state-response") {
        // Received state from leader tab
        const state = message.data as GenState;
        if (state) {
          lastKnownStateRef.current = state;
          console.log("Received state from leader tab:", state);
        }
      }
    },
  });

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

        // Only write to localStorage if we're the leader
        if (isLeader) {
          localStorage.setItem(KEY, JSON.stringify(next));
          lastKnownStateRef.current = next;
          
          // Broadcast the update to other tabs
          postMessage("state-update", next);
        } else {
          // If we're not the leader, request current state from leader
          postMessage("state-request", { tabId: "requesting" });
          
          // Store locally for immediate use (optimistic update)
          lastKnownStateRef.current = next;
        }
      } catch (e) {
        // Log to help debug storage issues (e.g. quota, privacy settings)
        console.warn("useGenerationPersistence write error:", e);
      }
    },
    [read, isLeader, postMessage]
  );

  const clear = useCallback(() => {
    if (isLeader) {
      localStorage.removeItem(KEY);
      localStorage.removeItem(LEGACY_ID);
      lastKnownStateRef.current = null;
      
      // Broadcast clear to other tabs
      postMessage("state-update", null);
    }
  }, [isLeader, postMessage]);

  const setLegacyId = useCallback((id: string) => {
    if (isLeader) {
      localStorage.setItem(LEGACY_ID, id);
    }
  }, [isLeader]);

  const getLegacyId = useCallback((): string | null => {
    if (isLeader) {
      return localStorage.getItem(LEGACY_ID);
    }
    // If not leader, return null - other tabs should get this from leader
    return null;
  }, [isLeader]);

  // Request state from leader when component mounts (if not leader)
  useEffect(() => {
    if (!isLeader && isSupported) {
      postMessage("state-request", { tabId: "requesting" });
    }
  }, [isLeader, isSupported, postMessage]);

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
