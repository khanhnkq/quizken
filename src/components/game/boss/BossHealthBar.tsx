
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Skull } from 'lucide-react';

interface BossHealthBarProps {
    currentHp: number;
    maxHp: number;
}

export const BossHealthBar = ({ currentHp, maxHp }: BossHealthBarProps) => {
    const percentage = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
    
    // Delayed HP for smooth drop effect
    const [displayHp, setDisplayHp] = useState(currentHp);

    useEffect(() => {
        const timeout = setTimeout(() => setDisplayHp(currentHp), 500); // 0.5s delay for impact feel
        return () => clearTimeout(timeout);
    }, [currentHp]);

    const displayPercentage = Math.max(0, Math.min(100, (displayHp / maxHp) * 100));

    return (
        <div className="w-full max-w-4xl mx-auto mb-8 relative z-50">
            {/* Header Info */}
            <div className="flex justify-between items-end mb-2 px-2">
                <div className="flex items-center gap-2">
                    <div className="bg-red-600 p-2 rounded-lg shadow-lg">
                        <Skull className="w-6 h-6 text-white animate-pulse" />
                    </div>
                    <span className="font-black text-2xl text-white drop-shadow-md tracking-wider">BOSS</span>
                </div>
                <div className="font-mono font-bold text-xl text-white drop-shadow-md">
                    {currentHp.toLocaleString()} / {maxHp.toLocaleString()} HP
                </div>
            </div>

            {/* Bars Container */}
            <div className="h-10 bg-slate-900/80 backdrop-blur-sm rounded-full border-4 border-slate-800 shadow-2xl relative overflow-hidden">
                
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]" />

                {/* White Flash Bar (Damage taken) */}
                <motion.div 
                    className="absolute top-0 left-0 h-full bg-white"
                    initial={{ width: `${displayPercentage}%` }}
                    animate={{ width: `${displayPercentage}%` }}
                    transition={{ duration: 0.3 }}
                />

                {/* Actual Red Health Bar */}
                <motion.div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-800 via-red-600 to-red-500"
                    initial={{ width: `${percentage}%` }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }} // Slower catch up
                >
                    {/* Glossy Effect */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-t-full" />
                </motion.div>
                
                {/* Text Overlay (Optional for clarity) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <span className="text-white/30 font-black text-sm tracking-[0.5em]">{percentage.toFixed(1)}%</span>
                </div>
            </div>
        </div>
    );
};
