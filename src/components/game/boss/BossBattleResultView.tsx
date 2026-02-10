
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trophy, Skull, Home, RefreshCw } from 'lucide-react';
import Mascot from '@/components/ui/Mascot';

interface BossBattleResultViewProps {
    bossHp: number;
    isHost: boolean;
    onExit: () => void;
    onReplay?: () => void;
}

export const BossBattleResultView = ({ bossHp, isHost, onExit, onReplay }: BossBattleResultViewProps) => {
    const isVictory = bossHp <= 0;

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className={`absolute inset-0 opacity-20 ${isVictory ? 'bg-yellow-500' : 'bg-red-900'} z-0`} />
            
            <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="z-10 flex flex-col items-center text-center space-y-8"
            >
                {isVictory ? (
                    <>
                        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-2xl">
                            VICTORY!
                        </h1>
                         <Mascot emotion="excited" size={200} className="drop-shadow-[0_0_50px_rgba(234,179,8,0.5)]" />
                        <p className="text-2xl text-yellow-200 font-bold max-w-lg">
                            The Boss has been defeated! You are true heroes!
                        </p>
                    </>
                ) : (
                    <>
                        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 drop-shadow-2xl">
                            DEFEAT...
                        </h1>
                        <div className="relative">
                            <Mascot emotion="confused" size={200} className="grayscale brightness-50" />
                            <Skull className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 text-red-600 opacity-80" />
                        </div>
                        <p className="text-2xl text-red-300 font-bold max-w-lg">
                            The Boss still stands. Identify your weaknesses and try again!
                        </p>
                         <p className="text-xl text-white/50">Boss HP Remaining: {bossHp}</p>
                    </>
                )}

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <Button 
                        onClick={onExit} 
                        variant="outline" 
                        size="lg" 
                        className="border-2 border-white/20 hover:bg-white/10 text-xl h-16 px-8 rounded-full"
                    >
                        <Home className="mr-2 h-6 w-6" /> Back to Home
                    </Button>
                    
                    {isHost && onReplay && (
                        <Button 
                            onClick={onReplay} 
                            size="lg" 
                            className={`${isVictory ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-red-600 hover:bg-red-700'} text-white text-xl h-16 px-8 rounded-full shadow-lg`}
                        >
                            <RefreshCw className="mr-2 h-6 w-6" /> Play Again
                        </Button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
