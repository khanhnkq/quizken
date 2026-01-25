import { UserStatistics } from "@/types/dashboard";

export const XP_PER_LEVEL_SCALE = 500;
export const ZCOIN_PER_LEVEL_UP = 1000;

export const calculateXP = (stats: UserStatistics | null): number => {
    if (!stats) return 0;
    if (stats.total_xp !== undefined) return stats.total_xp;
    const createdXP = (stats.total_quizzes_created || 0) * 100;
    const takenXP = Math.round((stats.total_quizzes_taken || 0) * (stats.average_score || 0));
    return createdXP + takenXP;
};

export const calculateLevel = (xp: number): number => {
    return Math.max(1, Math.floor((1 + Math.sqrt(1 + 0.08 * Math.max(0, xp))) / 2));
};

export const calculateNextLevelXP = (level: number): number => {
    return 50 * level * (level + 1);
};

export const calculateCurrentLevelBaseXP = (level: number): number => {
    return 50 * level * (level - 1);
};

export const calculateRewardMultiplier = (level: number): number => {
    return 1 + (level * 0.1);
};

export const calculateCreateReward = (level: number): number => {
    return Math.floor(10 * calculateRewardMultiplier(level));
};

export const calculateAttemptReward = (level: number, score: number): number => {
    return Math.floor((score / 10) * calculateRewardMultiplier(level));
};


