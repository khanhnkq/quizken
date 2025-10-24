import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

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

      // Reset base state unconditionally for a fresh progress UI
      setIsPolling(true);
      setStatus("pending");
      setProgress("Đang chuẩn bị...");

      // Debug: log when polling starts
       
      console.log(
        `[useQuizGeneration] startPolling called for quizId=${quizId}`
      );

      const interval = setInterval(async () => {
        try {
          // Debug: log each poll attempt
           
          console.log(`[useQuizGeneration] polling quizId=${quizId}...`);

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
             
            console.warn("[useQuizGeneration] polling error:", error);
            throw error;
          }

          const nextStatus = (data?.status as Status) || null;
          const nextProgress = data?.progress || "Đang xử lý...";
          setStatus(nextStatus);
          setProgress(nextProgress);
          callbacks.onProgress?.(nextStatus, nextProgress);

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
      }, 2000);
      pollIntervalRef.current = interval;
    },
    [stopPolling]
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
