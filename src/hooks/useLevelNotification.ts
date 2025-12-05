import { useEffect, useRef } from 'react';
import { UserStatistics } from '@/types/dashboard';
import { calculateXP, calculateLevel, ZCOIN_PER_LEVEL_UP } from '@/utils/levelSystem';
import confetti from 'canvas-confetti';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

const STORAGE_KEY_LEVEL = 'quizken_user_last_level';

export function useLevelNotification(stats: UserStatistics | null) {
    const { t } = useTranslation();
    const prevLevelRef = useRef<number | null>(null);

    useEffect(() => {
        if (!stats) return;

        const currentXP = calculateXP(stats);
        const currentLevel = calculateLevel(currentXP);

        // Initial load check from storage
        const storedLevelStr = localStorage.getItem(STORAGE_KEY_LEVEL);
        const storedLevel = storedLevelStr ? parseInt(storedLevelStr, 10) : null;

        // If it's the first time we see stats, just sync storage, don't celebrate yet (unless we want to celebrate on first login?)
        // Better: Compare with storage. If storage exists and < current, celebrate.
        if (storedLevel !== null && currentLevel > storedLevel) {
            const levelDiff = currentLevel - storedLevel;
            const earnedZCoin = levelDiff * ZCOIN_PER_LEVEL_UP;

            // Trigger Celebration
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#FFA500', '#FF4500'], // Gold / ZCoin colors
                zIndex: 9999
            });

            toast({
                title: t('notifications.levelUp.title', { level: currentLevel }),
                description: t('notifications.levelUp.message', { level: currentLevel, zcoin: earnedZCoin }),
                variant: 'default', // You might want a custom 'success' or 'gold' variant style if available
                duration: 5000,
                className: "border-yellow-400 bg-yellow-50 text-yellow-900",
            });
        }

        // Update Ref and Storage
        if (storedLevel !== currentLevel) {
            localStorage.setItem(STORAGE_KEY_LEVEL, currentLevel.toString());
        }
        prevLevelRef.current = currentLevel;

    }, [stats, t]);
}
