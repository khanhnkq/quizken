import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const USER_DAILY_LIMIT = 5;

export interface UserQuotaData {
    daily_count: number;
    last_reset_date: string;
}

export function useUserQuota(userId?: string) {
    const queryClient = useQueryClient();
    const queryKey = ["user-quota", userId];

    const { data, isLoading, error, refetch: queryRefetch } = useQuery({
        queryKey,
        queryFn: async () => {
            if (!userId) return null;

            const [quotaResult, apiKeyResult] = await Promise.all([
                supabase
                    .from("profiles")
                    .select("daily_quiz_count, last_daily_reset")
                    .eq("id", userId)
                    .maybeSingle(),
                supabase
                    .from("user_api_keys")
                    .select("id", { count: "exact", head: true })
                    .eq("user_id", userId)
                    .eq("provider", "gemini")
                    .eq("is_active", true)
            ]);

            if (quotaResult.error) {
                // If profiles not found, it might be a new user, default to 0
                if (quotaResult.error.code !== "PGRST116") {
                    console.error("Error fetching quota:", quotaResult.error);
                }
            }

            return {
                daily_count: quotaResult.data?.daily_quiz_count || 0,
                last_reset_date: quotaResult.data?.last_daily_reset || "",
                has_api_key: (apiKeyResult.count || 0) > 0
            };
        },
        enabled: !!userId,
        staleTime: 0, // Always fresh
        refetchOnWindowFocus: true,
    });

    // Real-time subscription for profiles and API keys changes
    useEffect(() => {
        if (!userId) return;

        // Subscribe to profiles table changes for this user
        const profilesChannel = supabase
            .channel(`profiles-quota-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${userId}`
                },
                (payload) => {
                    console.log("⚡ [useUserQuota] Profile updated, refetching quota", payload);
                    queryClient.invalidateQueries({ queryKey });
                }
            )
            .subscribe();

        // Subscribe to user_api_keys table changes for this user
        const apiKeysChannel = supabase
            .channel(`api-keys-quota-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'user_api_keys',
                    filter: `user_id=eq.${userId}`
                },
                () => {
                    // Refetch when API key changes
                    queryClient.invalidateQueries({ queryKey });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(profilesChannel);
            supabase.removeChannel(apiKeysChannel);
        };
    }, [userId, queryClient, queryKey]);

    // Calculate generic usage stats
    const dailyCount = data?.daily_count || 0;
    const hasApiKey = data?.has_api_key || false;

    // Check if reset is needed (if last_reset_date is different from today)
    const today = new Date().toISOString().split('T')[0];
    const lastResetDate = data?.last_reset_date;

    const effectiveCount = (lastResetDate && lastResetDate < today) ? 0 : dailyCount;
    const hasReachedLimit = !hasApiKey && effectiveCount >= USER_DAILY_LIMIT;
    const remaining = Math.max(0, USER_DAILY_LIMIT - effectiveCount);

    return {
        dailyCount: effectiveCount,
        hasReachedLimit,
        remaining,
        limit: USER_DAILY_LIMIT,
        hasApiKey,
        isLoading,
        error,
        refetch: () => queryClient.invalidateQueries({ queryKey }),
    };
}
