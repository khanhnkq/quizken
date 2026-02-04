import { useCallback, useRef, useState, useEffect } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
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

  const currentQuizIdRef = useRef<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const fallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanupSubscription = useCallback(() => {
    if (channelRef.current) {
      console.log("[useQuizGeneration] Cleaning up Realtime subscription");
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  const clearFallbackTimeout = useCallback(() => {
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupSubscription();
      clearFallbackTimeout();
    };
  }, [cleanupSubscription, clearFallbackTimeout]);

  const stopPolling = useCallback(() => {
    cleanupSubscription();
    clearFallbackTimeout();
    setIsPolling(false);
    currentQuizIdRef.current = null;
  }, [cleanupSubscription, clearFallbackTimeout]);

  const reset = useCallback(() => {
    stopPolling();
    setStatus(null);
    setProgress("");
  }, [stopPolling]);

  const startPolling = useCallback(
    async (quizId: string, callbacks: StartPollingCallbacks<Quiz>) => {
      if (!quizId) return;

      // Stop any previous monitoring
      stopPolling();

      currentQuizIdRef.current = quizId;
      setIsPolling(true);
      setStatus("pending");
      setProgress("Đang chuẩn bị...");

      console.log(`[useQuizGeneration] startMonitoring for quizId=${quizId}`);

      // Helper to handle status updates
      const handleStatusUpdate = (newStatus: Status, newProgress: string, quizData?: any) => {
        // Critical: Check if polling was stopped while we were waiting/processing
        if (!currentQuizIdRef.current) {
          console.log("[useQuizGeneration] Polling stopped, ignoring status update");
          return;
        }

        setStatus(newStatus);
        setProgress(newProgress);
        callbacks.onProgress?.(newStatus, newProgress);

        if (newStatus === "completed") {
          console.log(`✅ [useQuizGeneration] Status is COMPLETED. Calling onCompleted with quizData.title=${quizData?.title}`);
          stopPolling();
          callbacks.onCompleted({
            quiz: quizData,
            tokenUsage: quizData?.tokenUsage,
          });
        } else if (newStatus === "failed") {
          stopPolling();
          callbacks.onFailed(quizData?.error || "Unknown error");
        } else if (newStatus === "expired") {
          stopPolling();
          callbacks.onExpired();
        }
      };

      // Helper to schedule fallback
      const scheduleFallback = () => {
        clearFallbackTimeout();
        if (!currentQuizIdRef.current) return;

        fallbackTimeoutRef.current = setTimeout(() => {
          console.log("[useQuizGeneration] Fallback timeout triggered (60s silence). Performing manual check...");
          performManualCheck();
        }, 5000); // 5s fast retry (was 60s) to handling missed Realtime events
      };

      // Helper function to check status manually (for initial load and fallback)
      const performManualCheck = async () => {
        console.log(`[useQuizGeneration] performManualCheck called. currentQuizIdRef=${currentQuizIdRef.current}`);
        if (!currentQuizIdRef.current) return;

        try {
          // Build the Edge Function URL based on Supabase project URL
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
          const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
          const functionUrl = `${supabaseUrl}/functions/v1/generate-quiz-from-file/get-quiz-status?quiz_id=${currentQuizIdRef.current}`;

          // Get current session for auth
          const { data: { session } } = await supabase.auth.getSession();
          const authToken = session?.access_token;

          const response = await fetch(functionUrl, {
            method: "GET",
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseAnonKey,
              ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
            }
          });

          // Check again after await
          if (!currentQuizIdRef.current) return;

          // Handle specific error codes as failures
          if (response.status === 404) {
            console.log("❌ [useQuizGeneration] Quiz not found (404). Treating as deletion/cancellation.");
            stopPolling();
            callbacks.onFailed("Quiz was cancelled or deleted");
            return;
          }

          if (response.status === 429) {
            console.log("❌ [useQuizGeneration] Rate limit exceeded (429).");
            stopPolling();
            callbacks.onFailed("API rate limit exceeded. Please try again later.");
            return;
          }

          if (response.status === 401) {
            console.log("❌ [useQuizGeneration] Authentication error (401).");
            stopPolling();
            callbacks.onFailed("Authentication failed. Please log in again.");
            return;
          }

          if (response.status === 403) {
            console.log("❌ [useQuizGeneration] Access forbidden (403).");
            stopPolling();
            callbacks.onFailed("Access denied. Check API permissions.");
            return;
          }

          if (response.status >= 500) {
            console.log(`❌ [useQuizGeneration] Server error (${response.status}).`);
            stopPolling();
            callbacks.onFailed("Server error. Please try again later.");
            return;
          }

          if (!response.ok) {
            console.log(`❌ [useQuizGeneration] Unexpected error (${response.status}).`);
            stopPolling();
            callbacks.onFailed(`Request failed: ${response.status}`);
            return;
          }

          const data = await response.json();

          // Check again after parsing
          if (!currentQuizIdRef.current) return;

          // Using strict check for completion to decide whether to keep listening
          const isDone = data.status === "completed" || data.status === "failed" || data.status === "expired";

          if (data.status === "failed") {
            console.log("❌ [useQuizGeneration] Manual check returned FAILED. Raw Data:", data);
          }

          // Pass data.error too if it exists at root level
          handleStatusUpdate(data.status, data.progress, { ...data.quiz, error: data.error || data.quiz?.error });

          if (!isDone) {
            // If not done, reschedule fallback to keep checking if Realtime stays silent
            scheduleFallback();
          }

        } catch (err) {
          if (!currentQuizIdRef.current) return; // Stop if cancelled
          console.error("[useQuizGeneration] Manual check error:", err);
          // Even on error, reschedule fallback to try again later
          scheduleFallback();
        }
      };

      // 1. Initial Fetch
      await performManualCheck();

      // If performManualCheck stopped the polling (completed/failed), we shouldn't subscribe
      if (!currentQuizIdRef.current) return;

      // 2. Setup Realtime Subscription
      const channel = supabase
        .channel(`quiz-status-${quizId}`)
        .on(
          "postgres_changes",
          {
            event: "*", // Listen for DELETE too
            schema: "public",
            table: "quizzes",
            filter: `id=eq.${quizId}`,
          },
          (payload) => {
            if (payload.eventType === 'DELETE') {
              console.log("[useQuizGeneration] Quiz deleted remotely");
              stopPolling();
              // Treat deletion as cancellation/failure
              callbacks.onFailed("Quiz cancelled remotely");
              return;
            }

            const newRecord = payload.new as any;
            console.log("[useQuizGeneration] Realtime update:", newRecord);

            // Reset fallback timer on every live event
            scheduleFallback();

            // We only have the raw record here.
            handleStatusUpdate(newRecord.status, newRecord.progress, newRecord);
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log(`[useQuizGeneration] Subscribed to quiz ${quizId}`);
            // Start the first fallback timer once subscribed
            scheduleFallback();
          }
          if (status === 'CHANNEL_ERROR') {
            console.error(`[useQuizGeneration] Subscription error:`, err);
            // If subscription fails, the initial manual check loop (via scheduleFallback)
            // will effectively turn into a slow poll (every 60s), which is a safe fallback.
          }
        });

      channelRef.current = channel;
    },
    [stopPolling, cleanupSubscription, clearFallbackTimeout]
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
