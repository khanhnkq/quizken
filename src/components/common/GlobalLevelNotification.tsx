import React from 'react';
import { useAuth } from '@/lib/auth';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useLevelNotification } from '@/hooks/useLevelNotification';

export const GlobalLevelNotification = () => {
    const { user } = useAuth();
    // Only fetch if we have a user. useDashboardStats handles "skip if no userId" internal logic via enabled: !!userId
    const { statistics } = useDashboardStats(user?.id);

    // This hook handles the side effects: comparing cached level vs current, showing toast, throwing confetti
    useLevelNotification(statistics);

    return null; // This component handles side-effects only (toast/confetti)
};
