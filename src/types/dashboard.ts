export interface UserStatistics {
  total_quizzes_created: number;
  total_quizzes_taken: number;
  highest_score: number;
  average_score: number;
  total_time_taken_seconds: number;
  zcoin?: number;
}

export interface ProgressTrendData {
  date: string;
  quiz_count: number;
  average_score: number;
}

export interface RecentQuizAttempt {
  attempt_id: string;
  quiz_id: string;
  quiz_title: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  completed_at: string;
  time_taken_seconds?: number;
}

export interface CreatedQuiz {
  id: string;
  title: string;
  description: string | null;
  questions: unknown; /* JSONB */
  created_at: string;
  is_public: boolean;
  usage_count: number;
  pdf_download_count: number;
  category: string;
  tags: string[] | null;
  difficulty: string;
  status?: string; // Added status field
}

export interface DashboardData {
  statistics: UserStatistics | null;
  progressTrend: ProgressTrendData[];
  recentAttempts: RecentQuizAttempt[];
  isLoading: boolean;
  error: string | null;
}
