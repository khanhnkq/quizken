/**
 * CEFR Level Badge Component
 * Displays a colored badge for vocabulary difficulty level
 */

import { CEFR_LEVELS, type CEFRLevel } from '@/types/cefr';
import { cn } from '@/lib/utils';

interface CEFRBadgeProps {
    level: CEFRLevel;
    showName?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function CEFRBadge({ level, showName = false, size = 'md', className }: CEFRBadgeProps) {
    const levelInfo = CEFR_LEVELS[level];

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full font-bold text-white shadow-sm',
                sizeClasses[size],
                className
            )}
            style={{ backgroundColor: levelInfo.color }}
            title={levelInfo.description}
        >
            <span>{level}</span>
            {showName && <span className="font-medium">{levelInfo.name}</span>}
        </span>
    );
}

/**
 * CEFR Level Indicator - shows color-coded difficulty
 */
interface CEFRIndicatorProps {
    level: CEFRLevel;
    className?: string;
}

export function CEFRIndicator({ level, className }: CEFRIndicatorProps) {
    const levelInfo = CEFR_LEVELS[level];

    return (
        <div
            className={cn('w-3 h-3 rounded-full', className)}
            style={{ backgroundColor: levelInfo.color }}
            title={`${level} - ${levelInfo.name}`}
        />
    );
}

/**
 * CEFR Level Bar - shows all levels with current highlighted
 */
interface CEFRLevelBarProps {
    currentLevel: CEFRLevel;
    className?: string;
}

export function CEFRLevelBar({ currentLevel, className }: CEFRLevelBarProps) {
    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

    return (
        <div className={cn('flex items-center gap-1', className)}>
            {levels.map((level) => {
                const levelInfo = CEFR_LEVELS[level];
                const isActive = levelInfo.order <= CEFR_LEVELS[currentLevel].order;

                return (
                    <div
                        key={level}
                        className={cn(
                            'h-2 flex-1 rounded-full transition-all',
                            isActive ? 'opacity-100' : 'opacity-20'
                        )}
                        style={{ backgroundColor: levelInfo.color }}
                        title={`${level} - ${levelInfo.name}`}
                    />
                );
            })}
        </div>
    );
}
