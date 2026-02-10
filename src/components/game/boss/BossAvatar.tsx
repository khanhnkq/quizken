
import React, { useEffect } from 'react';
import Mascot from '@/components/ui/Mascot';
import { motion, useAnimation } from 'framer-motion';

interface BossAvatarProps {
    hpPercentage: number;
    isHit: boolean;
}

export const BossAvatar = ({ hpPercentage, isHit }: BossAvatarProps) => {
    const controls = useAnimation();

    // Determine emotion based on HP
    const getEmotion = () => {
        if (hpPercentage <= 0) return 'sad'; // Dead
        if (hpPercentage < 20) return 'confused'; // Panic
        if (hpPercentage < 50) return 'angry'; // Angry
        return 'cool'; // Confident
    };

    // Hit Animation
    useEffect(() => {
        if (isHit) {
            controls.start({
                x: [0, -10, 10, -10, 10, 0],
                rotate: [0, -5, 5, -5, 5, 0],
                scale: [1, 1.1, 0.9, 1.1, 1],
                filter: ["brightness(1)", "brightness(2) sepia(1) hue-rotate(-50deg) saturate(2)", "brightness(1)"],
                transition: { duration: 0.4 }
            });
        }
    }, [isHit, controls]);

    return (
        <div className="relative flex justify-center items-center">
             {/* Boss Aura */}
             <div className={`absolute inset-0 rounded-full blur-[60px] opacity-40 transition-colors duration-1000 ${
                 hpPercentage < 20 ? 'bg-red-600 animate-pulse' : 
                 hpPercentage < 50 ? 'bg-orange-500' : 'bg-purple-600'
             }`} />

            <motion.div animate={controls}>
                <Mascot 
                    emotion={getEmotion()} 
                    size={280} // Big Boss Size
                    className={`drop-shadow-2xl filter transition-all duration-500`}
                />
            </motion.div>
            
            {/* Status Text (Optional) */}
            {hpPercentage < 20 && (
                <div className="absolute -top-10 bg-red-600 text-white font-bold px-4 py-1 rounded-full animate-bounce">
                    PANIC!
                </div>
            )}
        </div>
    );
};
