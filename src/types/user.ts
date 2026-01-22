import type { User } from "@supabase/supabase-js";
import type { UserStatistics } from "./dashboard";

/**
 * UserProfile interface extending Supabase User with additional metadata
 */
export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  provider?: "google" | "email" | "github";
  created_at: string;
  last_sign_in_at?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
    provider?: string;
    full_name?: string;
    user_name?: string;
  };
}

/**
 * Extended user statistics for profile display
 */
export interface UserProfileStatistics extends UserStatistics {
  // Additional statistics specific to user profile
  total_study_time_hours: number;
  average_time_per_quiz: number;
  favorite_category?: string;
  streak_days: number;
  join_date: string;
  last_active_date: string;
}

/**
 * User achievement data
 */
export interface UserAchievement {
  id: string;
  title: string;
  description: string;
  icon_url?: string;
  unlocked_at: string;
  category: "quiz" | "streak" | "score" | "time" | "special";
}

/**
 * User activity data for timeline
 */
export interface UserActivity {
  id: string;
  type:
    | "quiz_completed"
    | "quiz_created"
    | "achievement_unlocked"
    | "streak_milestone";
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * Complete user profile data
 */
export interface CompleteUserProfile {
  user: UserProfile;
  statistics: UserProfileStatistics;
  achievements: UserAchievement[];
  recent_activities: UserActivity[];
}

/**
 * Props for UserProfile component
 */
export interface UserProfileProps {
  user: User | null;
  statistics: UserStatistics | null;
  isLoading: boolean;
  className?: string;
  overrideDisplayName?: string | null;
  overrideAvatarUrl?: string | null;
  streak?: number;
}

/**
 * Props for UserAvatar sub-component
 */
export interface UserAvatarProps {
  user: User | UserProfile;
  size?: "sm" | "md" | "lg" | "xl";
  showStatus?: boolean;
  className?: string;
}

/**
 * Props for StatsCard sub-component
 */
export interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

/**
 * Props for AchievementBadge sub-component
 */
export interface AchievementBadgeProps {
  achievement: UserAchievement;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Props for ActivityItem sub-component
 */
export interface ActivityItemProps {
  activity: UserActivity;
  className?: string;
}
