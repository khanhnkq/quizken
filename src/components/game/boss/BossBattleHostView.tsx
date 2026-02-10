
import React, { useEffect, useState } from 'react';
import { BossAvatar } from './BossAvatar';
import { BossHealthBar } from './BossHealthBar';
import { DamageFloater, DamageNumber } from './DamageFloater';
import { motion } from 'framer-motion';

interface BossBattleHostViewProps {
    bossHp: number;
    maxBossHp: number;
    totalDamageTaken: number; // Damage taken in this round
    roundDamages: DamageNumber[]; // Individual damages for visual effect
}

export const BossBattleHostView = ({ bossHp, maxBossHp, totalDamageTaken, roundDamages }: BossBattleHostViewProps) => {
    const hpPercentage = (bossHp / maxBossHp) * 100;
    const [isHit, setIsHit] = useState(false);

    useEffect(() => {
        if (totalDamageTaken > 0) {
            setIsHit(true);
            const timer = setTimeout(() => setIsHit(false), 500);
            return () => clearTimeout(timer);
        }
    }, [totalDamageTaken]);

    return (
        <div className="w-full flex-1 flex flex-col items-center justify-center relative min-h-[500px]">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent pointer-events-none" />
            
            {/* Health Bar */}
            <BossHealthBar currentHp={bossHp} maxHp={maxBossHp} />

            {/* Boss Avatar Area */}
            <div className="relative mt-8">
                <BossAvatar hpPercentage={hpPercentage} isHit={isHit} />
                
                {/* Visual Feedback Text */}
                {totalDamageTaken > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.5 }}
                        animate={{ opacity: 1, y: -100, scale: 1.5 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 font-black text-6xl text-yellow-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] stroke-red-800"
                        style={{ WebkitTextStroke: '2px #b91c1c' }}
                    >
                        -{totalDamageTaken}
                    </motion.div>
                )}
            </div>

            {/* Damage Floaters (Individual hits from players if needed, but maybe too chaotic for host view) */}
            {/* <DamageFloater damages={roundDamages} /> */}

            {/* Battle Log / Status */}
            <div className="mt-12 text-center space-y-2 relative z-10">
                <h3 className="text-2xl font-bold text-white drop-shadow-md">
                    {hpPercentage <= 0 ? (
                        <span className="text-yellow-400">BOSS DEFEATED! 🏆</span>
                    ) : (
                        <span className="text-white">Boss is {hpPercentage < 50 ? 'Enraged' : 'Healthy'}!</span>
                    )}
                </h3>
            </div>
        </div>
    );
};
