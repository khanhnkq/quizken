import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CreatedQuiz } from "@/types/dashboard";

export function useCreatedQuizzes(userId?: string) {
    const queryClient = useQueryClient();
    const queryKey = ["created-quizzes", userId];

    const { data: createdQuizzes = [], isLoading, error } = useQuery({
        queryKey,
        queryFn: async () => {
            if (!userId) return [];
            console.log("🔍 [useCreatedQuizzes] Fetching quizzes for user:", userId);

            const { data, error } = await supabase
                .from("quizzes")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching created quizzes:", error);
                throw error;
            }

            const typedData = data as unknown as CreatedQuiz[];
            // Filter out cancelled quizzes or failed ones that have no content
            return typedData.filter(quiz => quiz.status !== 'cancelled');
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // Cache for 5 mins similar to other hooks
    });

    // Subscribe to realtime updates for the user's quizzes
    useEffect(() => {
        if (!userId) return;

        const channel = supabase
            .channel(`created-quizzes-${userId}`)
            .on(
                "postgres_changes",
                {
                    event: "*", // Listen for INSERT, UPDATE, DELETE
                    schema: "public",
                    table: "quizzes",
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    console.log("⚡ [useCreatedQuizzes] Quiz list updated:", payload.eventType);
                    queryClient.invalidateQueries({ queryKey });
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`[useCreatedQuizzes] Subscribed to quizzes for user ${userId}`);
                }
            });

        return () => {
            console.log("[useCreatedQuizzes] Cleaning up subscription");
            supabase.removeChannel(channel);
        };
    }, [userId, queryClient, queryKey]);

    return {
        createdQuizzes,
        isLoading,
        error: error ? (error as Error).message : null,
        refetch: () => queryClient.invalidateQueries({ queryKey }),
    };
}
