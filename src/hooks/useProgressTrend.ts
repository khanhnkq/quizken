import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ProgressTrendData } from "@/types/dashboard";

export function useProgressTrend(userId?: string, daysBack: number = 30) {
  const [trendData, setTrendData] = useState<ProgressTrendData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrendData = async (uid: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc("get_user_progress_trend", {
        user_uuid: uid,
        days_back: daysBack,
      });

      if (error) {
        console.error("Error fetching progress trend:", error);
        setError(error.message);
        return;
      }

      if (data) {
        // Format the data to ensure consistent date format
        const formattedData = data.map(
          (item: {
            date: string;
            quiz_count: number;
            average_score: number;
          }) => ({
            date: new Date(item.date).toLocaleDateString("vi-VN"),
            quiz_count: item.quiz_count,
            average_score: parseFloat(item.average_score.toString()) || 0,
          })
        );
        setTrendData(formattedData);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Failed to fetch progress trend");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchTrendData(userId);
    }
  }, [userId, daysBack]);

  return {
    trendData,
    isLoading,
    error,
    refetch: () => userId && fetchTrendData(userId),
  };
}
