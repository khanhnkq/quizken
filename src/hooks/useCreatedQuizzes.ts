import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CreatedQuiz } from "@/types/dashboard";

export function useCreatedQuizzes(userId?: string) {
    const [createdQuizzes, setCreatedQuizzes] = useState<CreatedQuiz[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCreatedQuizzes = async (uid: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase
                .from("quizzes")
                .select("*")
                .eq("user_id", uid)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching created quizzes:", error);
                setError(error.message);
                return;
            }

            if (data) {
                // Map to match CreatedQuiz interface if needed, currently direct mapping
                setCreatedQuizzes(data as unknown as CreatedQuiz[]);
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            setError("Failed to fetch created quizzes");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchCreatedQuizzes(userId);
        }
    }, [userId]);

    return {
        createdQuizzes,
        isLoading,
        error,
        refetch: () => userId && fetchCreatedQuizzes(userId),
    };
}
