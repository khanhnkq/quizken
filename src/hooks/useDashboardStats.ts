import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { UserStatistics } from "@/types/dashboard";

export function useDashboardStats(userId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ["dashboard-stats", userId];

  const { data: statistics, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase.rpc("get_user_statistics", {
        user_uuid: userId,
      });

      if (error) {
        throw new Error(error.message);
      }

      return (data && data.length > 0) ? data[0] : null;
    },
    enabled: !!userId,
    // Stale time 5 minutes to avoid spamming refetches on focus refetch
    staleTime: 1000 * 60 * 5,
  });

  return {
    statistics: statistics as UserStatistics | null,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch: () => queryClient.invalidateQueries({ queryKey }),
  };
}
