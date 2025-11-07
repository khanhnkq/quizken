import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RecentQuizAttempt } from "@/types/dashboard";

export function useRecentQuizzes(userId?: string, limit: number = 10) {
  const [recentAttempts, setRecentAttempts] = useState<RecentQuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentAttempts = async (uid: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc("get_user_recent_attempts", {
        user_uuid: uid,
        limit_count: limit,
      });

      if (error) {
        console.error("Error fetching recent attempts:", error);
        setError(error.message);
        return;
      }

      if (data) {
        // Format the data to ensure consistent types
        const formattedData = data.map(
          (item: {
            attempt_id: string;
            quiz_id: string;
            quiz_title: string;
            score: number;
            total_questions: number;
            correct_answers: number;
            completed_at: string;
            time_taken_seconds?: number;
          }) => ({
            attempt_id: item.attempt_id,
            quiz_id: item.quiz_id,
            quiz_title: item.quiz_title,
            score: parseFloat(item.score.toString()) || 0,
            total_questions: item.total_questions,
            correct_answers: item.correct_answers,
            completed_at: item.completed_at,
            time_taken_seconds: item.time_taken_seconds,
          })
        );
        setRecentAttempts(formattedData);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Failed to fetch recent attempts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchRecentAttempts(userId);
    }
  }, [userId, limit]);

  return {
    recentAttempts,
    isLoading,
    error,
    refetch: () => userId && fetchRecentAttempts(userId),
  };
}
