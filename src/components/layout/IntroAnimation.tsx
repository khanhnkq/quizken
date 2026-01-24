import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const IntroAnimation = () => {
  const [phase, setPhase] = useState<'walk' | 'trip' | 'reveal' | 'finished'>('walk');
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Sequence
    const tripTimer = setTimeout(() => setPhase('trip'), 2500); // Walk for 2.5s
    const revealTimer = setTimeout(() => {
        setPhase('reveal');
    }, 4500); // Trip happens, hold for 3s (was 1s)
    const finishTimer = setTimeout(() => {
        setPhase('finished');
        setShow(false);
    }, 4800); // Fully remove component

    return () => {
      clearTimeout(tripTimer);
      clearTimeout(revealTimer);
      clearTimeout(finishTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <motion.div 
        className="fixed inset-0 z-[9999] overflow-hidden font-sans"
        animate={phase === 'reveal' ? { 
            scale: 2, 
            opacity: 0,
            filter: "blur(20px)"
        } : {}}
        transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* --- SCENIC BACKGROUND (USER IMAGE) --- */}
      <div className="absolute inset-0">
        <img 
            src="/images/intro-bg.jpg" 
            alt="Forest Background" 
            className="w-full h-full object-cover"
        />
        {/* Subtle overlay to blend character if needed */}
        {/* <div className="absolute inset-0 bg-black/10" /> */}
      </div>

      {/* --- CONTENT LAYER --- */}
      <div className="absolute inset-x-0 bottom-[0%] flex justify-center z-20">
      <AnimatePresence mode='wait'>
        
        {/* Phase 1: Walking */}
        {phase === 'walk' && (
            <>
            <motion.div
                key="walk"
                initial={{ x: -1000 }} // Start further off-screen
                animate={{ x: 0 }}
                transition={{ duration: 2.5, ease: "linear" }}
                className="relative flex flex-col items-center"
            >
                <div className="relative z-10">
                    <motion.img 
                        src="/images/mascot/happy.png"
                        alt="Walking Mascot"
                        className="w-96 h-96 md:w-[32rem] md:h-[32rem] object-contain drop-shadow-2xl relative z-20"
                        animate={{ y: [0, -30, 0] }}
                        transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                    
                {/* Whistling notes */}
                    <motion.div 
                        className="absolute top-20 right-10 text-4xl z-30"
                        animate={{ opacity: [0, 1, 0.5], y: -10, x: 10 }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        🎵
                    </motion.div>
                </div>

                {/* Shadow */}
                <motion.div 
                    className="w-48 h-8 bg-black/20 rounded-[100%] blur-md mt-[-60px]"
                    animate={{ scale: [1, 0.8, 1], opacity: [0.6, 0.4, 0.6] }}
                    transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
                />
            </motion.div>
        
            {/* Flying Notebook (Incoming from off-screen) */}
            <motion.div
                key="notebook"
                className="absolute bottom-20 right-[-100px] z-40 bg-blue-500 text-white p-2 rounded-lg shadow-xl w-16 h-20 flex items-center justify-center border-l-4 border-white/20"
                initial={{ x: 500, rotate: 0 }} // Start off-screen right
                animate={{ x: -100, rotate: -360 }} // Target center
                transition={{ 
                    delay: 1.5,
                    duration: 1.0,
                    ease: "linear" 
                }}
            >
                <div className="w-10 h-1 bg-white/50 rounded-full mb-1" />
                <div className="w-8 h-1 bg-white/50 rounded-full" />
            </motion.div>
            </>
        )}

        {/* Phase 2: Trip & Fall */}
        {phase === 'trip' && (
            <motion.div
                key="trip"
                className="relative flex flex-col items-center"
            >
                <div className="relative z-10">
                    <motion.img 
                        src="/images/mascot/cry.png"
                        alt="Tripping Mascot"
                        className="w-72 h-72 md:w-96 md:h-96 object-contain drop-shadow-2xl relative z-20"
                        initial={{ rotate: 0, x: 0 }}
                        animate={{ 
                            rotate: 100, 
                            y: 200, 
                            x: 80 
                        }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 250, 
                            damping: 15 
                        }}
                    />
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [1.5, 1], opacity: 1 }}
                        className="absolute top-0 -right-20 text-8xl font-black text-primary rotate-12 drop-shadow-xl z-30"
                    >
                        OÁI!!
                    </motion.div>

                    {/* Notebook Bouncing Off */}
                    <motion.div
                        className="absolute top-20 left-0 z-40 bg-blue-500 text-white p-2 rounded-lg shadow-xl w-16 h-20 flex items-center justify-center border-l-4 border-white/20"
                        initial={{ x: -50, rotate: 0, y: 0 }}
                        animate={{ x: -300, rotate: -180, y: 200 }}
                        transition={{ 
                            duration: 0.8, 
                            ease: "easeOut" 
                        }}
                    >
                         <div className="w-10 h-1 bg-white/50 rounded-full mb-1" />
                         <div className="w-8 h-1 bg-white/50 rounded-full" />
                    </motion.div>

                    {/* Confused Culprit Appearing (Ops!) */}
                    <motion.div
                        className="fixed bottom-0 right-0 z-50 pointer-events-none" // Fixed to screen corner
                        initial={{ x: 300 }} // Start hidden to the right
                        animate={{ x: 0 }}   // Slide in
                        transition={{ 
                            delay: 0.5, // Wait for fall
                            type: "spring", 
                            stiffness: 150 
                        }}
                    >
                        <img 
                            src="/images/mascot/confused.png" 
                            alt="Culprit" 
                            className="w-84 h-82 object-contain drop-shadow-xl" // Increased size
                        />
                         <div className="absolute top-10 right-10 text-6xl font-black text-primary drop-shadow-md"> ?!</div>
                    </motion.div>
                </div>

                 {/* Shadow Static (at start of trip) */}
                 <motion.div 
                    className="w-48 h-8 bg-black/20 rounded-[100%] blur-md mt-[-10px]"
                    animate={{ opacity: [1, 0] }} // Fade out as he jumps/falls away
                    transition={{ duration: 0.2 }}
                />
            </motion.div>
        )}
      </AnimatePresence>
      </div>
    </motion.div>
  );
};
