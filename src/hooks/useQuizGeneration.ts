import { useCallback, useRef, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBroadcastChannel, BroadcastMessage } from "./useBroadcastChannel";
import { useLeaderElection } from "./useLeaderElection";

type Status =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "expired"
  | null;

interface StartPollingCallbacks<Quiz> {
  onCompleted: (data: {
    quiz: Quiz;
    tokenUsage?: { prompt: number; candidates: number; total: number };
  }) => void;
  onFailed: (errorMessage?: string) => void;
  onExpired: () => void;
  onProgress?: (status: Status, progress: string) => void;
}

export function useQuizGeneration<Quiz = unknown>() {
  const [status, setStatus] = useState<Status>(null);
  const [progress, setProgress] = useState<string>("");
  const [isPolling, setIsPolling] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentQuizIdRef = useRef<string | null>(null);

  // Leader election for polling coordination
  const { isLeader } = useLeaderElection({
    channelName: "quiz-polling-leader",
    onLeaderChange: (isLeader) => {
      if (isLeader) {
        console.log("✅ This tab is now the leader for quiz polling");
      } else {
        console.log("⏸️ This tab is no longer the leader for quiz polling");
        // Stop polling if we're no longer the leader
        stopPolling();
      }
    },
  });

  // BroadcastChannel for cross-tab coordination
  const { postMessage, isSupported } = useBroadcastChannel({
    channelName: "quiz-polling-coordination",
    onMessage: (message: BroadcastMessage) => {
      if (message.type === "polling-status") {
        const data = message.data as {
          quizId: string;
          status: Status;
          progress: string;
        };
        if (data && data.quizId === currentQuizIdRef.current) {
          setStatus(data.status);
          setProgress(data.progress);
          setIsPolling(
            data.status !== "completed" &&
            data.status !== "failed" &&
            data.status !== "expired"
          );
        }
      } else if (message.type === "polling-start") {
        const data = message.data as { quizId: string };
        if (data && data.quizId !== currentQuizIdRef.current) {
          // Another tab started polling for a different quiz
          console.log("📡 Another tab started polling for quiz:", data.quizId);
        }
      } else if (message.type === "polling-stop") {
        const data = message.data as { quizId: string };
        if (data && data.quizId === currentQuizIdRef.current) {
          // Polling was stopped by another tab
          console.log(
            "📡 Polling stopped by another tab for quiz:",
            data.quizId
          );
          stopPolling();
        }
      }
    },
  });

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsPolling(false);

    // Broadcast that polling has stopped
    if (currentQuizIdRef.current && isSupported) {
      postMessage("polling-stop", { quizId: currentQuizIdRef.current });
    }

    currentQuizIdRef.current = null;
  }, [isSupported, postMessage]);

  const reset = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsPolling(false);
    setStatus(null);
    setProgress("");
  }, []);

  const startPolling = useCallback(
    async (quizId: string, callbacks: StartPollingCallbacks<Quiz>) => {
      if (!quizId) return;

      // Ensure any previous polling is stopped before starting a new one
      stopPolling();

      // Set current quiz ID
      currentQuizIdRef.current = quizId;

      // Reset base state unconditionally for a fresh progress UI
      setIsPolling(true);
      setStatus("pending");
      setProgress("Đang chuẩn bị...");

      // Broadcast that polling has started (only if leader)
      if (isSupported && isLeader) {
        postMessage("polling-start", { quizId });
      }

      // Debug: log when polling starts
      console.log(
        `[useQuizGeneration] startPolling called for quizId=${quizId}, isLeader=${isLeader}`
      );

      // Exponential backoff configuration
      const MAX_BACKOFF_MS = 60000; // Max 60s between polls
      const INITIAL_INTERVAL_MS = 13000; // 13s to stay under 5 req/min
      let currentIntervalMs = INITIAL_INTERVAL_MS;

      const sleep = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      // Perform first poll immediately, don't wait for interval
      let hasPolledOnce = false;

      const performPoll = async () => {
        try {
          console.log(
            `[useQuizGeneration] polling quizId=${quizId}, interval=${currentIntervalMs}ms`
          );

          // Use GET without a body to avoid fetch errors in browsers (some runtimes disallow GET with body)
          const invokeOptions: Record<string, unknown> = {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          };
          const { data, error } = await supabase.functions.invoke(
            `generate-quiz/get-quiz-status?quiz_id=${quizId}`,
            invokeOptions
          );
          if (error) {
            // Error → increase backoff
            currentIntervalMs = Math.min(
              currentIntervalMs * 1.5,
              MAX_BACKOFF_MS
            );
            console.warn(
              `[useQuizGeneration] poll error, backing off to ${currentIntervalMs}ms:`,
              error
            );
            throw error;
          }

          // Success → reset to initial interval
          currentIntervalMs = INITIAL_INTERVAL_MS;

          const nextStatus = (data?.status as Status) || null;
          const nextProgress = data?.progress || "Đang xử lý...";
          setStatus(nextStatus);
          setProgress(nextProgress);
          callbacks.onProgress?.(nextStatus, nextProgress);

          // Broadcast status update to other tabs (only leader broadcasts)
          if (isSupported && isLeader) {
            postMessage("polling-status", {
              quizId,
              status: nextStatus,
              progress: nextProgress,
            });
          }

          if (nextStatus === "completed") {
            stopPolling();
            callbacks.onCompleted({
              quiz: data.quiz,
              tokenUsage: data.quiz?.tokenUsage,
            });
          } else if (nextStatus === "failed") {
            stopPolling();
            callbacks.onFailed(data?.error);
          } else if (nextStatus === "expired") {
            stopPolling();
            callbacks.onExpired();
          }
        } catch (err) {
          // keep polling; transient errors are ignored
          console.debug(
            "[useQuizGeneration] poll caught error (ignored):",
            err
          );
        }
      };

      // Poll immediately on start
      performPoll();
      hasPolledOnce = true;

      const interval = setInterval(performPoll, currentIntervalMs);
      pollIntervalRef.current = interval;
    },
    [stopPolling, isLeader, isSupported, postMessage]
  );

  return {
    status,
    progress,
    isPolling,
    startPolling,
    stopPolling,
    reset,
  };
}

export default useQuizGeneration;
