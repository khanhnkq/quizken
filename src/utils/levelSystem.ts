import { UserStatistics } from "@/types/dashboard";

export const XP_PER_LEVEL_SCALE = 500;
export const ZCOIN_PER_LEVEL_UP = 1000;

export const calculateXP = (stats: UserStatistics | null): number => {
    if (!stats) return 0;
    const createdXP = (stats.total_quizzes_created || 0) * 100;
    const takenXP = Math.round((stats.total_quizzes_taken || 0) * (stats.average_score || 0));
    return createdXP + takenXP;
};

export const calculateLevel = (xp: number): number => {
    return Math.floor(Math.sqrt(xp / XP_PER_LEVEL_SCALE)) + 1;
};

export const calculateNextLevelXP = (level: number): number => {
    return XP_PER_LEVEL_SCALE * Math.pow(level, 2);
};

export const calculateCurrentLevelBaseXP = (level: number): number => {
    return XP_PER_LEVEL_SCALE * Math.pow(level - 1, 2);
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


