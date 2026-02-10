/* GamePlayerPage.tsx - Updated Layout */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { BackgroundDecorations } from '@/components/ui/BackgroundDecorations';
import { useToast } from '@/hooks/use-toast';
import { PlayerHeader } from '@/components/game/player/PlayerHeader';
import { PlayerLoginForm } from '@/components/game/player/PlayerLoginForm';
import { PlayerJoinForm } from '@/components/game/player/PlayerJoinForm';
import { PlayerWaitingScreen } from '@/components/game/player/PlayerWaitingScreen';
import { HostPlayersGrid } from '@/components/game/host/HostPlayersGrid';
import { PlayerLobbyHeader } from '@/components/game/player/PlayerLobbyHeader';

const GamePlayerPage = () => {
    const { t } = useTranslation();
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const { profileData } = useProfile(user?.id);

    // State
    const [isJoined, setIsJoined] = useState(false);
    const [nickname, setNickname] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [participantId, setParticipantId] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [participants, setParticipants] = useState<any[]>([]);
    const [quizTitle, setQuizTitle] = useState(''); // Added state

    // 1. Check Session
    useEffect(() => {
        if (!roomId) return;
        const sessionKey = `quiz_game_session_${roomId}`;
        const savedSession = sessionStorage.getItem(sessionKey);

        if (savedSession) {
            const { nickname, avatarUrl, participantId } = JSON.parse(savedSession);
            setNickname(nickname);
            setAvatarUrl(avatarUrl);
            setParticipantId(participantId);
            setIsJoined(true);
        }
    }, [roomId]);

    // 2. Realtime Listener & Data Fetching
    useEffect(() => {
        if (!roomId) return;

        // Fetch Room & Participants
        const fetchRoomData = async () => {
             // Fetch Room with Quiz Title
             const { data: roomData } = await supabase
                .from('game_rooms')
                .select('*, quizzes(title)')
                .eq('id', roomId)
                .single();
             
             if (roomData && roomData.quizzes) {
                 // @ts-expect-error - quizzes is actually a single object here
                 setQuizTitle(roomData.quizzes.title);
             }

             // Check session directly (not state) to avoid race condition
             const sessionKey = `quiz_game_session_${roomId}`;
             const hasSession = sessionStorage.getItem(sessionKey) !== null;

             // If room is already playing and player has session, redirect to match
             if (roomData && roomData.status === 'playing' && hasSession) {
                 navigate(`/game/play/${roomId}/match`);
                 return;
             }

             // Fetch Participants
             const { data } = await supabase.from('game_participants').select('*').eq('room_id', roomId);
             if (data) setParticipants(data);
        };
        fetchRoomData();

        const channel = supabase
            .channel(`player_room:${roomId}`)
            .on('postgres_changes', { 
                event: 'UPDATE', 
                schema: 'public', 
                table: 'game_rooms', 
                filter: `id=eq.${roomId}` 
            }, (payload: { new: { status: string } }) => {
                if (payload.new.status === 'playing') {
                    toast({ title: t('game.player.gameStarting'), description: t('game.player.getReady') });
                    navigate(`/game/play/${roomId}/match`);
                }
            })
            .on('postgres_changes', { 
                event: 'DELETE', 
                schema: 'public', 
                table: 'game_rooms', 
                filter: `id=eq.${roomId}` 
            }, (payload) => {
                toast({ title: t('game.host.gameEnded'), description: t('game.player.hostClosedRoom') });
                navigate('/game/lobby');
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'game_participants',
                filter: `room_id=eq.${roomId}`
            }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setParticipants(prev => [...prev, payload.new]);
                } else if (payload.eventType === 'DELETE') {
                    setParticipants(prev => prev.filter(p => p.id !== payload.old.id));
                } else if (payload.eventType === 'UPDATE') {
                   setParticipants(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomId, navigate, toast, t]);

    const handleJoin = async () => {
        setIsJoining(true);
        try {
            const { data: room, error: roomError } = await supabase.from('game_rooms').select('status').eq('id', roomId).single();
            if (roomError || !room) throw new Error(t('game.host.roomNotFound'));
            if (room.status !== 'waiting') throw new Error(t('game.player.gameStarted'));

            const nickname = profileData?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || t('game.common.playerFallback');
            const avatar = profileData?.avatar_url || user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`;

            const { data, error } = await supabase
                .from('game_participants')
                .insert({ room_id: roomId, nickname, user_id: user?.id, avatar_url: avatar })
                .select().single();

            if (error) throw error;

            const sessionData = { participantId: data.id, nickname: data.nickname, avatarUrl: data.avatar_url };
            sessionStorage.setItem(`quiz_game_session_${roomId}`, JSON.stringify(sessionData));

            setNickname(sessionData.nickname);
            setAvatarUrl(sessionData.avatarUrl);
            setParticipantId(sessionData.participantId);
            setIsJoined(true);
            toast({ title: t('game.player.joinSuccess'), className: "bg-green-500 text-white" });

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : t('game.player.unknownError');
            toast({ title: t('game.player.joinFailed'), description: errorMessage, variant: "destructive" });
        } finally {
            setIsJoining(false);
        }
    };

    const handleExit = async () => {
        if (participantId) {
            try {
                await supabase.from('game_participants').delete().eq('id', participantId);
            } catch (error) {
                console.error("Error removing participant:", error);
            }
        }
        sessionStorage.removeItem(`quiz_game_session_${roomId}`);
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden font-sans flex flex-col">
            <BackgroundDecorations density="medium" />
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 pt-8 pb-24 flex-1 flex flex-col">
                {!isJoined ? (
                     <div className="flex-1 flex flex-col items-center justify-center min-h-[500px]">
                         <Card className="w-full max-w-lg border-4 border-white/20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-2xl rounded-[2.5rem] overflow-hidden animate-in zoom-in-50 duration-500 ring-1 ring-white/30">
                            <CardContent className="p-8 md:p-10 flex flex-col items-center gap-8">
                                <PlayerHeader isJoined={false} />
                                {!user ? (
                                    <PlayerLoginForm roomId={roomId || ''} />
                                ) : (
                                    <PlayerJoinForm 
                                        user={user}
                                        profileData={profileData}
                                        isJoining={isJoining}
                                        onJoin={handleJoin}
                                    />
                                )}
                            </CardContent>
                        </Card>
                     </div>
                ) : (
                    // JOINED - HOST-LIKE LAYOUT
                    <>
                        <PlayerLobbyHeader 
                            quizTitle={quizTitle} 
                            onExit={handleExit} 
                        />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch">
                            {/* LEFT: Waiting/Status Screen */}
                            <PlayerWaitingScreen 
                                nickname={nickname}
                                avatarUrl={avatarUrl}
                            />

                            {/* RIGHT: Players Grid */}
                            <HostPlayersGrid 
                                participants={participants}
                                hostId="" 
                                onStartGame={() => {}} 
                                isPlayerView={true} 
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default GamePlayerPage;
