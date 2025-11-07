import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { UserStatistics } from "@/types/dashboard";

export function useDashboardStats(userId?: string) {
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = async (uid: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc("get_user_statistics", {
        user_uuid: uid,
      });

      if (error) {
        console.error("Error fetching user statistics:", error);
        setError(error.message);
        return;
      }

      if (data && data.length > 0) {
        setStatistics(data[0]);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Failed to fetch statistics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchStatistics(userId);
    }
  }, [userId]);

  return {
    statistics,
    isLoading,
    error,
    refetch: () => userId && fetchStatistics(userId),
  };
}
