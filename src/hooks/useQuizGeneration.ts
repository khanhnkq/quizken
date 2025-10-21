import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Status = "pending" | "processing" | "completed" | "failed" | "expired" | null;

interface StartPollingCallbacks<Quiz> {
  onCompleted: (data: { quiz: Quiz; tokenUsage?: { prompt: number; candidates: number; total: number } }) => void;
  onFailed: (errorMessage?: string) => void;
  onExpired: () => void;
  onProgress?: (status: Status, progress: string) => void;
}

export function useQuizGeneration<Quiz = any>() {
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

  const startPolling = useCallback(
    async (
      quizId: string,
      callbacks: StartPollingCallbacks<Quiz>
    ) => {
      if (!quizId || isPolling) return;
      setIsPolling(true);
      setStatus((prev) => prev ?? "pending");
      setProgress((p) => p || "Đang chuẩn bị...");

      const interval = setInterval(async () => {
        try {
          const { data, error } = await supabase.functions.invoke(
            `generate-quiz/get-quiz-status?quiz_id=${quizId}`,
            {
              body: {},
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (error) throw error;

          const nextStatus = (data?.status as Status) || null;
          const nextProgress = data?.progress || "Đang xử lý...";
          setStatus(nextStatus);
          setProgress(nextProgress);
          callbacks.onProgress?.(nextStatus, nextProgress);

          if (nextStatus === "completed") {
            stopPolling();
            callbacks.onCompleted({ quiz: data.quiz, tokenUsage: data.quiz?.tokenUsage });
          } else if (nextStatus === "failed") {
            stopPolling();
            callbacks.onFailed(data?.error);
          } else if (nextStatus === "expired") {
            stopPolling();
            callbacks.onExpired();
          }
        } catch (_e) {
          // keep polling; transient errors are ignored
        }
      }, 2000);
      pollIntervalRef.current = interval;
    },
    [isPolling, stopPolling]
  );

  return {
    status,
    progress,
    isPolling,
    startPolling,
    stopPolling,
  };
}

export default useQuizGeneration;







