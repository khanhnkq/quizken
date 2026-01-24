import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GachaAnimationProps {
  onComplete: () => void;
}

export const GachaAnimation: React.FC<GachaAnimationProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'fall' | 'tension' | 'explode'>('fall');

  useEffect(() => {
    // Sequence Controller
    const tensionTimer = setTimeout(() => setPhase('tension'), 800);
    const explodeTimer = setTimeout(() => setPhase('explode'), 2000); // Shorter tension
    const completeTimer = setTimeout(() => {
      // Trigger Explosion Particles
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#FFD700', '#F0E68C', '#E6E6FA', '#FF69B4', '#00FFFF'],
        zIndex: 9999
      });
      onComplete();
    }, 2100); // Only 100ms after explode start -> almost instant cut

    return () => {
      clearTimeout(tensionTimer);
      clearTimeout(explodeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      {/* Deep Cosmic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-900 via-indigo-950 to-black" />
      
      {/* Animated Nebula overlay */}
      <motion.div 
        animate={{ opacity: [0.4, 0.6, 0.4], scale: [1, 1.1, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-screen" 
      />

      {/* Background Energy Rays */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[0] w-[200vw] h-[200vw] -translate-x-1/2 -translate-y-1/2 opacity-30 bg-[conic-gradient(from_0deg,transparent_0deg_10deg,theme(colors.purple.500)_45deg,transparent_80deg_360deg)] blur-3xl mix-blend-screen"
      />

      <div className="relative z-10">
        <AnimatePresence mode='wait'>
          
          {/* Phase 1 & 2: The Capsule */}
          {(phase === 'fall' || phase === 'tension') && (
            <motion.div
              layoutId="capsule"
              initial={{ y: -800, scale: 0.5, opacity: 0 }}
              animate={phase === 'fall' ? { 
                y: 0, 
                scale: 1, 
                opacity: 1,
                rotate: 0
              } : { 
                y: 0, 
                scale: [1, 1.1, 1.2, 1.5, 2.5], // Scales up massively at the end!
                rotate: [0, -5, 5, -10, 10, -20, 20, -40, 40, -60, 60], // Violent shaking
                filter: ["brightness(1)", "brightness(1.2)", "brightness(1.5)", "brightness(2)", "brightness(3)"], // Blinding light
              }}
              style={{ transformOrigin: "bottom center" }} // Pivot from bottom
              transition={phase === 'fall' ? { 
                type: "spring", 
                stiffness: 200, 
                damping: 15,
                mass: 2
              } : {
                duration: 1.4, // Match the tension phase duration
                ease: "easeInOut",
              }}
              className="relative w-72 h-72 md:w-96 md:h-96" 
            >
              {/* Outer Glow */}
              <div className={`absolute inset-0 rounded-full bg-violet-500 blur-3xl transition-opacity duration-300 ${phase === 'tension' ? 'opacity-80 scale-125' : 'opacity-40'}`} />
              
              {/* The Capsule Body - Now Mascot Confused */}
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay rounded-full"></div>
                
                {/* Inner Energy */}
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute w-48 h-48 bg-white/20 rounded-[40%] blur-md"
                />

                <img 
                  src="/images/mascot/confused.png" 
                  alt="Confused Mascot"
                  className="relative z-10 w-full h-full object-contain drop-shadow-[0_0_25px_rgba(255,255,255,0.6)]"
                />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Phase 3: The Flash - Screen Wide */}
      <AnimatePresence>
        {phase === 'explode' && (
          <motion.div
            key="flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.3, ease: "easeOut" }} // Super fast flash
            className="fixed inset-0 z-[200] bg-white pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Text Overlay */}
      <motion.div
        initial={{ opacity: 0, y: 220 }}
        animate={
          phase === 'fall' ? { opacity: 0 } :
          phase === 'explode' ? { opacity: 0 } : // Disappear instantly on explode
          { 
            opacity: [1, 0.5, 1, 0.5, 1],
            scale: [1, 1.1, 1, 1.2, 1.1],
            rotate: [-1, 1, -2, 2, 0]
          }
        }
        transition={{ 
          duration: 1.4,
          times: [0, 0.4, 0.7, 0.9, 1], // ACCELERATING timing!
          ease: "easeInOut" 
        }}
        className="absolute text-center w-full"
      >
        <h2 className="text-2xl md:text-4xl font-black text-yellow-300 tracking-widest uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] px-4">
          {phase === 'tension' ? "Úm ba la... xì bùa!!" : ""}
        </h2>
        <p className="text-white/80 text-sm mt-2 font-medium animate-pulse">
          {phase === 'tension' ? "(Đang niệm chú...)" : ""}
        </p>
      </motion.div>

    </div>
  );
};
