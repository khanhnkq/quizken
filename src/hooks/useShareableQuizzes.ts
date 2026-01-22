import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ShareableQuiz {
  id: string;
  title: string;
  created_at: string;
  status: string;
  is_public: boolean;
  question_count: number;
  expires_at: string | null;
}

const SHAREABLE_STATUSES = ["completed"];

export function useShareableQuizzes(userId?: string) {
  return useQuery<ShareableQuiz[]>({
    queryKey: ["shareable-quizzes", userId],
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("quizzes")
        .select(
          "id, title, created_at, status, is_public, questions, expires_at, user_id",
        )
        .eq("user_id", userId)
        .in("status", SHAREABLE_STATUSES)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching shareable quizzes:", error);
        throw error;
      }

      return (data || []).map((quiz: any) => ({
        id: quiz.id,
        title: quiz.title,
        created_at: quiz.created_at,
        status: quiz.status || "unknown",
        is_public: Boolean(quiz.is_public),
        expires_at: quiz.expires_at ?? null,
        question_count: Array.isArray(quiz.questions)
          ? quiz.questions.length
          : 0,
      }));
    },
  });
}
