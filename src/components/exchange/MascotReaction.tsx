import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/assets/logo/logo.png';

export type MascotMood = 'idle' | 'success' | 'buying' | 'poor' | 'error';

interface MascotReactionProps {
    mood: MascotMood;
    className?: string;
}

const moods = {
    idle: { scale: 1, rotate: 0, text: "Chào bạn!" },
    success: { scale: 1.2, rotate: [0, -10, 10, 0], text: "Tuyệt vời!" },
    buying: { scale: 1.1, rotate: 360, text: "Đang mua..." },
    poor: { scale: 0.9, rotate: -5, text: "Huhu thiếu tiền..." },
    error: { scale: 0.9, rotate: [0, -10, 10, 0], text: "Lỗi rồi..." },
};

export function MascotReaction({ mood, className = '' }: MascotReactionProps) {
    const currentMood = moods[mood];

    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={mood}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{
                        scale: currentMood.scale,
                        opacity: 1,
                        rotate: currentMood.rotate
                    }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center shadow-lg border-4 border-white bg-white overflow-hidden p-2`}
                >
                    <img
                        src={logo}
                        alt="QuizKen Mascot"
                        className={`w-full h-full object-contain ${mood === 'poor' ? 'grayscale opacity-70' : ''}`}
                    />
                </motion.div>
            </AnimatePresence>

            {/* Speech bubble */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={`text-${mood}`}
                className="absolute -top-6 -right-16 sm:-right-20 bg-white px-4 py-2 rounded-2xl shadow-md border-2 border-primary/20 text-xs sm:text-sm font-bold text-primary whitespace-nowrap z-20"
            >
                {currentMood.text}
                <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-white border-l-white w-2 h-2 transform -rotate-45 shadow-sm"></div>
            </motion.div>
        </div>
    );
}
