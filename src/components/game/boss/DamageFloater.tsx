
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface DamageNumber {
    id: string;
    value: number;
    x: number; // Random offset X
    y: number; // Random offset Y
    isCrit: boolean;
}

interface DamageFloaterProps {
    damages: DamageNumber[];
}

export const DamageFloater = ({ damages }: DamageFloaterProps) => {
    return (
        <div className="absolute inset-0 pointer-events-none z-[100] flex items-center justify-center">
            <AnimatePresence>
                {damages.map((d) => (
                    <motion.div
                        key={d.id}
                        initial={{ opacity: 0, scale: 0.5, y: d.y, x: d.x }}
                        animate={{ 
                            opacity: [1, 1, 0], 
                            scale: d.isCrit ? [1.5, 2, 1.5] : [1, 1.2, 1],
                            y: d.y - 150 // Fly up
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute text-center"
                    >
                        <span 
                            className={`font-black tracking-tighter drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] 
                            ${d.isCrit 
                                ? "text-6xl text-yellow-400 stroke-red-800 stroke-[3px]" 
                                : "text-4xl text-white stroke-black stroke-[2px]"}`}
                            style={{ 
                                textShadow: d.isCrit ? '0 0 20px rgba(255,200,0,0.8)' : 'none',
                                WebkitTextStroke: d.isCrit ? '2px #b91c1c' : '1px black'
                            }}
                        >
                            {d.isCrit && "CRIT! "}
                            -{d.value}
                        </span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
