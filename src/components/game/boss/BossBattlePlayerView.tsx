
import React, { useEffect, useState } from 'react';
import { BossAvatar } from './BossAvatar';
import { BossHealthBar } from './BossHealthBar';
import { motion, AnimatePresence } from 'framer-motion';

interface BossBattlePlayerViewProps {
    bossHp: number;
    maxBossHp: number;
    myDamage?: number; // Damage dealt by this player in this round
    totalDamageTaken?: number; // Total damage taken by boss (optional sync)
}

export const BossBattlePlayerView = ({ bossHp, maxBossHp, myDamage }: BossBattlePlayerViewProps) => {
    const hpPercentage = (bossHp / maxBossHp) * 100;
    const [showDamage, setShowDamage] = useState(false);

    useEffect(() => {
        if (myDamage && myDamage > 0) {
            setShowDamage(true);
        }
    }, [myDamage]);

    return (
        <div className="w-full flex-1 flex flex-col items-center justify-start pt-10 relative min-h-[500px]">
             {/* Battle Atmosphere */}
             <div className="absolute inset-0 bg-gradient-to-t from-red-900/10 to-transparent pointer-events-none" />

            {/* Health Bar */}
            <BossHealthBar currentHp={bossHp} maxHp={maxBossHp} />

            {/* Boss Avatar */}
            <div className="relative mt-4 scale-75 md:scale-100 origin-top">
                <BossAvatar hpPercentage={hpPercentage} isHit={!!myDamage} />
                
                {/* My Damage Popup */}
                <AnimatePresence>
                {showDamage && (
                    <motion.div 
                        initial={{ opacity: 0, y: 0, scale: 0.5, rotate: -10 }}
                        animate={{ opacity: 1, y: -150, scale: 1.5, rotate: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
                    >
                        <div className="flex flex-col items-center">
                            <span 
                                className="font-black text-7xl text-yellow-300 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
                                style={{ WebkitTextStroke: '3px #b91c1c' }}
                            >
                                -{myDamage}
                            </span>
                            <span className="text-white font-bold text-xl uppercase tracking-widest bg-red-600 px-3 py-1 rounded-full mt-2 animate-pulse">
                                CRITICAL HIT!
                            </span>
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>

            {/* Status Message */}
            <div className="mt-8 text-center space-y-4 relative z-10 px-4">
                {myDamage && myDamage > 0 ? (
                    <div className="bg-green-600/20 backdrop-blur-md border border-green-500/50 p-6 rounded-2xl animate-in fade-in slide-in-from-bottom duration-500">
                        <h3 className="text-2xl font-bold text-green-400 mb-1">Excellent Attack!</h3>
                        <p className="text-white opacity-80">You dealt <span className="text-yellow-400 font-bold">{myDamage}</span> damage to the boss.</p>
                    </div>
                ) : (
                    <div className="bg-red-600/20 backdrop-blur-md border border-red-500/50 p-6 rounded-2xl animate-in fade-in slide-in-from-bottom duration-500">
                        <h3 className="text-2xl font-bold text-red-400 mb-1">Missed!</h3>
                        <p className="text-white opacity-80">The boss dodged your attack. Focus!</p>
                    </div>
                )}
                
                <p className="text-muted-foreground animate-pulse mt-4">Waiting for next round...</p>
            </div>
        </div>
    );
};
