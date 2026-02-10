import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { Users, Copy, Play, Loader2, Settings2, Sparkles, Wand2 } from 'lucide-react';
import { BackgroundDecorations } from '@/components/ui/BackgroundDecorations';
import Mascot from '@/components/ui/Mascot';
import { cn } from '@/lib/utils';
import { HostHeader } from '@/components/game/host/HostHeader';
import { HostActionCard } from '@/components/game/host/HostActionCard';
import { HostPlayersGrid } from '@/components/game/host/HostPlayersGrid';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useProfile } from '@/hooks/useProfile';


import { useTranslation } from 'react-i18next';




const GameHostPage = () => {
    const { t } = useTranslation();
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [room, setRoom] = useState<any>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showExitDialog, setShowExitDialog] = useState(false);
    
    // Time Limit State
    const [timeLimit, setTimeLimit] = useState<string>("20");
    // Game Mode State
    const [gameMode, setGameMode] = useState<'classic' | 'boss_battle'>('classic');

    const joinLink = `${window.location.origin}/game/play/${roomId}`; // Define joinLink for QR and Copy

    // Fetch Room Data
    useEffect(() => {
        const fetchRoom = async () => {
            if (!roomId) return;
            const { data, error } = await supabase
                .from('game_rooms')
                .select('*, quizzes(*)')
                .eq('id', roomId)
                .maybeSingle();

            if (error) {
                console.error("Error fetching room:", error);
                // Only show toast if it's a real error, not just "not found" which might happen on unmount/race condition
                if (error.code !== 'PGRST116') { 
                     toast({ title: "Error loading room", description: error.message, variant: "destructive" });
                }
                navigate('/game/lobby');
                return;
            }

            if (!data) {
                 toast({ title: "Room not found", description: "This room may have been deleted.", variant: "destructive" });
                 navigate('/game/lobby');
                 return;
            }

            setRoom(data);
            if (data.time_limit_seconds) {
                setTimeLimit(data.time_limit_seconds.toString());
            }
            if (data.game_mode) {
                setGameMode(data.game_mode);
            }
            setIsLoading(false);
        };

        const fetchParticipants = async () => {
            if (!roomId) return;
            const { data, error } = await supabase
                .from('game_participants')
                .select('*')
                .eq('room_id', roomId);
            if (data) setParticipants(data);
        };

        fetchRoom();
        fetchParticipants();

        // Subscribe to participant changes
        const channel = supabase
            .channel(`room:${roomId}`)
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'game_participants', 
                filter: `room_id=eq.${roomId}` 
            }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setParticipants(current => [...current, payload.new]);
                    toast({ 
                        title: "👋 New Player Joined!", 
                        description: `${payload.new.nickname} is ready!`
                    });
                } else if (payload.eventType === 'DELETE') {
                    setParticipants(current => current.filter(p => p.id !== payload.old.id));
                    toast({
                        title: "Player Left",
                        description: "A player has left the lobby."
                    });
                }
            })
            .subscribe((status) => {
                if (status === 'CHANNEL_ERROR') {
                    toast({ title: "Realtime Error", variant: "destructive" });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomId, navigate]);

    // Auto-join Host as Participant
    useEffect(() => {
        const joinHostAsParticipant = async () => {
             if (!roomId || !room || !room.host_id) return;
             
             // Check if already joined
             const { data: existing } = await supabase
                .from('game_participants')
                .eq('room_id', roomId)
                .eq('user_id', room.host_id) // Assuming host is logged in and matches
                .maybeSingle();

             if (!existing) {
                 const { data: profile } = await supabase.from('profiles').select('*').eq('id', room.host_id).single();
                 
                 const nickname = profile?.display_name || "Host";
                 const avatar = profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${room.host_id}`;

                 const { error } = await supabase
                    .from('game_participants')
                    .insert({
                        room_id: roomId,
                        user_id: room.host_id,
                        nickname: nickname,
                        avatar_url: avatar
                    });
                 
                 if (error) {
                     console.error("Failed to join host:", error);
                 } else {
                     toast({ title: t('game.host.joinedAsPlayer') });
                 }
             }
        };

        if (room) {
            joinHostAsParticipant();
        }
    }, [roomId, room, t, toast]);

    // Polling fallback
    useEffect(() => {
        if (!roomId) return;
        const interval = setInterval(async () => {
            const { data } = await supabase
                .from('game_participants')
                .select('*')
                .eq('room_id', roomId);
            
            if (data) {
                setParticipants(prev => {
                    const currentMap = new Map(prev.map(p => [p.id, p]));
                    let hasChanges = false;
                    
                    data.forEach(p => {
                        if (!currentMap.has(p.id)) {
                            currentMap.set(p.id, p);
                            hasChanges = true;
                        }
                    });
                    return hasChanges ? Array.from(currentMap.values()) : prev;
                });
            }
        }, 3000); 
        return () => clearInterval(interval);
    }, [roomId]);

    const handleStartGame = async () => {
        setIsLoading(true);
        // Calculate timer_ends_at
        const now = new Date();
        const timeLimitSec = parseInt(timeLimit) || 20;
        const timerEndsAt = new Date(now.getTime() + (timeLimitSec + 5) * 1000); // 5s buffer for "Get Ready"

        const updateData: any = { 
            status: 'playing', 
            phase: 'question',
            current_question_index: 0,
            timer_ends_at: timerEndsAt.toISOString()
        };

        // Boss Battle Setup
        if (gameMode === 'boss_battle') {
            try {
                // Fetch question count
                const { count, error: countError } = await supabase
                    .from('questions')
                    .select('*', { count: 'exact', head: true })
                    .eq('quiz_id', room.quiz_id);
                
                if (!countError && count !== null) {
                    // Import calculateBossMaxHp dynamically or define helper
                    const playerCount = participants.length;
                    // Formula: (Players * 500) * (Questions / 1.5)
                    const baseHp = 500;
                    const maxHp = (Math.max(1, playerCount) * baseHp) * Math.ceil(Math.max(1, count) / 1.5);
                    
                    updateData.boss_hp = maxHp;
                    updateData.max_boss_hp = maxHp;
                }
            } catch (e) {
                console.error("Error calculating boss HP", e);
            }
        }

        const { error } = await supabase
            .from('game_rooms')
            .update(updateData)
            .eq('id', roomId);

        if (error) {
            toast({ title: t('game.host.failedStart'), description: error.message, variant: "destructive" });
            setIsLoading(false);
        } else {
            navigate(`/game/host/${roomId}/play`);
        }
    };

    const copyLink = () => {
        const url = `${window.location.origin}/game/play/${roomId}`;
        navigator.clipboard.writeText(url);
        toast({ title: "Link copied!", description: "Share it with your friends." });
    };

    const handleExit = () => {
        if (!roomId) return;
        setShowExitDialog(true);
    };

    const confirmExit = async () => {
        if (!roomId) return;

        // Delete the room from DB
        const { error } = await supabase
            .from('game_rooms')
            .delete()
            .eq('id', roomId);

        if (error) {
            console.error("Error deleting room:", error);
            toast({ title: "Error ending game", description: "Could not delete room.", variant: "destructive" });
        } else {
            toast({ title: "Game Ended", description: "Room has been closed." });
        }
        
        // Navigate back
        navigate('/game/lobby');
    };

    const handleTimeLimitChange = async (value: string) => {
        setTimeLimit(value);
        // Optimistic update done, now save to DB
        const { error } = await supabase
            .from('game_rooms')
            .update({ time_limit_seconds: parseInt(value) })
            .eq('id', roomId);
            
        if (error) {
            toast({ title: "Error updating time", description: error.message, variant: "destructive" });
        } else {
             // Optional: toast success
        }
    };

    const handleGameModeChange = async (value: 'classic' | 'boss_battle') => {
        setGameMode(value);
        const { error } = await supabase
            .from('game_rooms')
            .update({ game_mode: value })
            .eq('id', roomId);
            
        if (error) {
            toast({ title: "Error updating mode", description: error.message, variant: "destructive" });
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-white">
            <Loader2 className="w-12 h-12 animate-spin text-yellow-400" />
            <p className="animate-pulse font-bold tracking-widest text-lg">{t('game.host.loading')}</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden font-sans flex flex-col">
            <BackgroundDecorations density="medium" />

            {/* Blob Backgrounds */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
            </div>
            
            <div className="relative z-10 container mx-auto px-4 pt-8 pb-24 flex-1 flex flex-col">
                
                {/* Game Header */}
                <HostHeader 
                    quizTitle={room.quizzes?.title || "Unknown Quiz"}
                    timeLimit={timeLimit}
                    onTimeLimitChange={handleTimeLimitChange}
                    gameMode={gameMode}
                    onGameModeChange={handleGameModeChange}
                    onExit={handleExit}
                />

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
                    
                    {/* LEFT: Join Info (Code & QR) */}
                    <HostActionCard 
                        joinLink={joinLink}
                        roomCode={room.code}
                    />

                    {/* RIGHT: Players Area */}
                    <HostPlayersGrid 
                        participants={participants}
                        hostId={room?.host_id}
                        onStartGame={handleStartGame}
                    />
                </div>
            </div>
            {/* Exit Confirmation Dialog */}
            <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('game.host.endGameConfirm')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('game.host.endGameDesc')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('game.host.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmExit} className="bg-destructive hover:bg-destructive/90 border-destructive hover:border-destructive/90 text-destructive-foreground">
                            {t('game.host.endGame')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default GameHostPage;
