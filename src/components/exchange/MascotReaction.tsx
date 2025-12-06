import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/assets/logo/logo.png';
import { Sparkles, Heart, Star, Coins } from 'lucide-react';

export type MascotMood = 'idle' | 'success' | 'buying' | 'poor' | 'error';

interface MascotReactionProps {
    mood: MascotMood;
    className?: string;
}

const moodConfig = {
    idle: {
        text: "Mua gì nào? ✨",
        bgGradient: "from-violet-100 to-fuchsia-50",
        borderColor: "border-violet-300",
        textColor: "text-violet-600",
        icon: Sparkles,
        iconColor: "text-violet-400"
    },
    success: {
        text: "Yay! Mua thành công! 🎉",
        bgGradient: "from-green-100 to-emerald-50",
        borderColor: "border-green-400",
        textColor: "text-green-600",
        icon: Heart,
        iconColor: "text-rose-500"
    },
    buying: {
        text: "Đang xử lý...",
        bgGradient: "from-yellow-100 to-orange-50",
        borderColor: "border-yellow-400",
        textColor: "text-orange-600",
        icon: Coins,
        iconColor: "text-yellow-500"
    },
    poor: {
        text: "Huhu... thiếu tiền mất rồi 😢",
        bgGradient: "from-slate-100 to-gray-50",
        borderColor: "border-slate-300",
        textColor: "text-slate-500",
        icon: Star,
        iconColor: "text-slate-400"
    },
    error: {
        text: "Ối! Có lỗi xảy ra 😵",
        bgGradient: "from-red-50 to-rose-50",
        borderColor: "border-red-300",
        textColor: "text-red-500",
        icon: Sparkles,
        iconColor: "text-red-400"
    },
};

export function MascotReaction({ mood, className = '' }: MascotReactionProps) {
    const config = moodConfig[mood];
    const IconComponent = config.icon;

    return (
        <div className={`relative ${className}`}>
            {/* Floating decorative elements */}
            <AnimatePresence>
                {mood === 'success' && (
                    <>
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={`sparkle-${i}`}
                                initial={{ opacity: 0, scale: 0, y: 0 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0.5, 1, 0.5],
                                    y: [-20, -50 - i * 8],
                                    x: [0, (i % 2 === 0 ? 1 : -1) * (15 + i * 8)]
                                }}
                                transition={{ duration: 1.2, delay: i * 0.1, repeat: Infinity }}
                                className={`absolute ${config.iconColor} z-0`}
                                style={{ left: '50%', top: '20%' }}
                            >
                                {i % 2 === 0 ? '✨' : '💖'}
                            </motion.div>
                        ))}
                    </>
                )}
            </AnimatePresence>

            {/* Main mascot container */}
            <motion.div
                className={`
                    relative bg-gradient-to-br ${config.bgGradient} 
                    rounded-[2rem] p-5 
                    border-[3px] ${config.borderColor} 
                    shadow-[0_8px_30px_rgb(0,0,0,0.12)]
                    flex flex-col items-center justify-center
                    overflow-hidden
                `}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '10px 10px', color: 'black' }}>
                </div>

                {/* Mascot avatar with bounce effect */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mood}
                        initial={{ scale: 0.8, opacity: 0, y: 10 }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            y: mood === 'idle' ? [0, -6, 0] : 0,
                            rotate: mood === 'buying' ? [0, 5, -5, 0] :
                                mood === 'success' ? [0, -5, 5, 0] : 0
                        }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 15,
                            y: { repeat: mood === 'idle' ? Infinity : 0, duration: 2.5, ease: "easeInOut" }
                        }}
                        className="relative z-10 mb-3"
                    >
                        {/* Glowing ring behind mascot */}
                        <div className={`
                            absolute inset-0 rounded-full blur-xl transform scale-125
                            ${mood === 'success' ? 'bg-green-400/30' :
                                mood === 'error' ? 'bg-red-400/30' :
                                    mood === 'buying' ? 'bg-yellow-400/30' : 'bg-white/60'}
                        `} />

                        {/* Mascot Circle */}
                        <div className={`
                            relative w-24 h-24 sm:w-28 sm:h-28 rounded-full 
                            bg-white border-[4px] border-white ring-2 ring-${config.borderColor.split('-')[1]}-200 
                            shadow-lg overflow-hidden flex items-center justify-center p-3
                        `}>
                            <img
                                src={logo}
                                alt="QuizKen Mascot"
                                className={`
                                    w-full h-full object-contain filter drop-shadow-sm
                                    transition-all duration-300 
                                    ${mood === 'poor' ? 'grayscale opacity-70 blur-[0.5px]' : ''} 
                                    ${mood === 'buying' ? 'animate-pulse' : ''}
                                `}
                            />
                        </div>

                        {/* Floating icon indicator */}
                        <motion.div
                            animate={{
                                y: [0, -5, 0],
                                rotate: mood === 'success' ? [0, 15, -15, 0] : 0
                            }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            className={`
                                absolute -top-1 -right-1 w-9 h-9 
                                rounded-full bg-white shadow-md border-2 ${config.borderColor} 
                                flex items-center justify-center z-20
                            `}
                        >
                            <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
                        </motion.div>
                    </motion.div>
                </AnimatePresence>

                {/* Speech bubble */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    key={`speech-${mood}`}
                    className={`
                        relative bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm
                        border border-${config.borderColor.split('-')[1]}-200
                        ${config.textColor} font-bold text-center text-sm
                    `}
                >
                    {config.text}
                    {/* Speech bubble tail */}
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-inherit transform rotate-45"></div>
                </motion.div>
            </motion.div>
        </div>
    );
}
