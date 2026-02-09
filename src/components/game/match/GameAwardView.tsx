import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { BackgroundDecorations } from '@/components/ui/BackgroundDecorations';
import { Trophy, Home, RotateCcw, Crown, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Types
export interface LeaderboardParticipant {
    id: string;
    nickname: string;
    score: number;
    avatar_url?: string;
    rank?: number;
}

interface GameAwardViewProps {
    participants: LeaderboardParticipant[];
    isHost: boolean;
    onReplay?: () => void; // Host only
    onExit: () => void;
}

// ----------------------------------------------------------------------
// Sub-components (Can be extracted later)
// ----------------------------------------------------------------------

const PodiumStep = ({ participant, rank, delay }: { participant: LeaderboardParticipant; rank: 1 | 2 | 3; delay: number }) => {
    const isFirst = rank === 1;
    const height = isFirst ? 'h-64' : rank === 2 ? 'h-48' : 'h-40';
    const color = isFirst 
        ? 'bg-yellow-400 border-yellow-200 shadow-yellow-500/50' 
        : rank === 2 
            ? 'bg-slate-300 border-slate-100 shadow-slate-400/50' 
            : 'bg-amber-600 border-amber-400 shadow-amber-700/50';

    return (
        <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay, duration: 0.8, type: 'spring' }}
            className="flex flex-col items-center z-10 mx-2"
        >
            {/* Avatar */}
            <div className="relative mb-4">
                {isFirst && (
                    <Crown className="w-12 h-12 text-yellow-300 absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce drop-shadow-lg" fill="currentColor" />
                )}
                <Avatar className={cn(
                    "w-20 h-20 border-4 border-white shadow-xl",
                    isFirst ? "w-28 h-28 ring-4 ring-yellow-400" : ""
                )}>
                    <AvatarImage src={participant.avatar_url} />
                    <AvatarFallback className="bg-primary/20 text-primary font-black text-2xl">
                        {participant.nickname.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border border-white/20">
                    {participant.nickname}
                </div>
            </div>

            {/* Bar */}
            <div className={cn(
                "w-24 md:w-32 rounded-t-lg border-t-4 border-x-2 flex flex-col items-center justify-end pb-4 shadow-2xl relative overflow-hidden backdrop-blur-sm",
                height, color
            )}>
                 <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                 <span className={cn(
                     "text-4xl md:text-6xl font-black text-white/90 drop-shadow-md",
                     isFirst ? "scale-110" : ""
                 )}>
                     {rank}
                 </span>
                 <div className="mt-2 text-white font-bold bg-black/20 px-3 py-1 rounded-full text-sm">
                     {participant.score} pts
                 </div>
            </div>
        </motion.div>
    );
};

const LeaderboardItem = ({ participant, rank, index }: { participant: LeaderboardParticipant; rank: number; index: number }) => {
    return (
        <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.5 + (index * 0.1) }}
            className="flex items-center bg-card/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 mb-2 shadow-sm"
        >
            <div className="w-8 h-8 flex items-center justify-center font-black text-muted-foreground mr-3">
                #{rank}
            </div>
            <Avatar className="w-10 h-10 border-2 border-white/20 mr-3">
                 <AvatarImage src={participant.avatar_url} />
                 <AvatarFallback className="text-xs">{participant.nickname.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 font-bold text-foreground truncate">
                {participant.nickname}
            </div>
            <div className="font-mono font-black text-lg text-primary">
                {participant.score}
            </div>
        </motion.div>
    );
};

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

export const GameAwardView: React.FC<GameAwardViewProps> = ({ 
    participants, 
    isHost,
    onReplay,
    onExit 
}) => {
    
    // Sort logic handled by parent usually, but ensuring here
    const sorted = [...participants].sort((a, b) => b.score - a.score);
    const top3 = sorted.slice(0, 3);
    const rest = sorted.slice(3);

    // Confetti Effect on Mount
    useEffect(() => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    // Podium Order: 2 - 1 - 3 (Left - Center - Right)
    const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
    // Need to map back original ranks for display
    const getRank = (p: LeaderboardParticipant) => sorted.indexOf(p) + 1;

    return (
        <div className="min-h-screen bg-background relative overflow-hidden font-outfit flex flex-col items-center">
            <BackgroundDecorations density="high" />
            
            <div className="z-20 w-full max-w-4xl px-4 flex-1 flex flex-col pt-10 pb-48">
                {/* Title */}
                <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-6xl font-black text-foreground drop-shadow-xl uppercase tracking-wider flex items-center justify-center gap-4">
                        <Trophy className="w-12 h-12 md:w-16 md:h-16 text-yellow-400 fill-yellow-400 animate-pulse" />
                        Game Finished
                        <Trophy className="w-12 h-12 md:w-16 md:h-16 text-yellow-400 fill-yellow-400 animate-pulse" />
                    </h1>
                </motion.div>

                {/* Podium */}
                <div className="flex items-end justify-center mb-12 min-h-[300px]">
                    {/* 2nd Place */}
                    {top3[1] && <PodiumStep participant={top3[1]} rank={2} delay={0.5} />}
                    {/* 1st Place */}
                    {top3[0] && <PodiumStep participant={top3[0]} rank={1} delay={1.0} />}
                    {/* 3rd Place */}
                    {top3[2] && <PodiumStep participant={top3[2]} rank={3} delay={0.8} />}
                </div>

                {/* List for the rest */}
                {rest.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="w-full max-w-md mx-auto bg-card/20 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl h-64 overflow-y-auto"
                    >
                        <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-4 text-center">Runners Up</h3>
                        {rest.map((p, idx) => (
                            <LeaderboardItem key={p.id} participant={p} rank={idx + 4} index={idx} />
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Footer Actions - Moved up to avoid Chat Ticker */}
            <div className="fixed bottom-32 left-0 right-0 z-50 flex justify-center gap-6 pointer-events-none">
                 <div className="pointer-events-auto flex gap-4 animate-in slide-in-from-bottom-10 fade-in duration-700">
                     {isHost ? (
                         <>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button 
                                        variant="destructive" 
                                        size="lg" 
                                        className="rounded-full px-8 shadow-lg font-bold h-14 text-lg"
                                    >
                                        Exit Game
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>End Game Session?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will close the room for all players and delete the session data. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={onExit} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            Confirm Exit
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            <Button 
                                onClick={onReplay}
                                size="lg" 
                                className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-xl shadow-primary/20 scale-110 h-14 text-lg"
                            >
                                <RotateCcw className="w-6 h-6 mr-2" /> Replay
                            </Button>
                         </>
                     ) : (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button 
                                    size="lg" 
                                    className="rounded-full px-12 shadow-lg font-bold h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
                                >
                                    <Home className="w-5 h-5 mr-2" /> Return to Home
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Leave Game?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to leave? You won't be able to rejoin this session if it closes.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Stay</AlertDialogCancel>
                                    <AlertDialogAction onClick={onExit}>
                                        Leave Now
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                     )}
                 </div>
            </div>
        </div>
    );
};
