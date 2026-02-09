import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Loader2, Gamepad2, Trophy, Sparkles, BookOpen, User, Play,  } from 'lucide-react';
import { Label } from '@/components/ui/label';
import Mascot from '@/components/ui/Mascot';
import { BackgroundDecorations } from '@/components/ui/BackgroundDecorations';
import Navbar from '@/components/layout/Navbar';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/useProfile';
import { LobbyJoinTab } from './lobby/LobbyJoinTab';
import { LobbyHostTab } from './lobby/LobbyHostTab';
import { LobbyMascotSection } from './lobby/LobbyMascotSection';

export const GameLobby = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { profileData } = useProfile(user?.id);
    const { toast } = useToast();
    const navigate = useNavigate();
    
    const [isLoading, setIsLoading] = useState(false);

    // Host State
    const [selectedQuizId, setSelectedQuizId] = useState<string>('');
    const [myQuizzes, setMyQuizzes] = useState<any[]>([]);

    // Player State
    const [joinCode, setJoinCode] = useState('');
    const [nickname, setNickname] = useState('');

    // Fetch Host's quizzes
    useEffect(() => {
        if (user) {
            const fetchQuizzes = async () => {
                const { data } = await supabase
                    .from('quizzes')
                    .select('id, title')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(10);
                if (data) setMyQuizzes(data);
            };
            fetchQuizzes();
        }
    }, [user]);

    const handleCreateRoom = async () => {
        if (!user) return;
        if (!selectedQuizId) {
            toast({ title: t('game.lobby.selectQuizError'), variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const code = Math.floor(100000 + Math.random() * 900000).toString();

            const { data, error } = await supabase
                .from('game_rooms')
                .insert({
                    host_id: user.id,
                    quiz_id: selectedQuizId,
                    code: code,
                    status: 'waiting',
                    phase: 'lobby'
                })
                .select()
                .single();

            if (error) throw error;

            // Add Host as Participant
            const hostNickname = profileData?.display_name || user.user_metadata.full_name || user.email?.split('@')[0] || t('game.host.hostRole');
            const hostAvatarUrl = profileData?.avatar_url || user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;

            const { error: participantError } = await supabase
                .from('game_participants')
                .insert({
                    room_id: data.id,
                    user_id: user.id,
                    nickname: hostNickname,
                    avatar_url: hostAvatarUrl
                });

            if (participantError) {
                console.error("Error adding host as participant:", participantError);
                // We don't stop flow, but good to know
            }

            toast({ title: t('game.host.nowHosting'), description: `Code: ${code}` });
            navigate(`/game/host/${data.id}`);

        } catch (error: any) {
            toast({ title: t('game.lobby.createRoomError'), description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinRoom = async () => {
        if (!joinCode) {
            toast({ title: t('game.lobby.enterCodeError'), description: t('game.lobby.enterCodeDesc'), variant: "destructive" });
            return;
        }
        if (!user) {
            toast({ title: t('game.lobby.loginRequired'), description: t('game.lobby.loginRequiredDesc'), variant: "destructive" });
            navigate('/login');
            return;
        }

        setIsLoading(true);
        try {
            const { data: room, error: roomError } = await supabase
                .from('game_rooms')
                .select('id, status')
                .eq('code', joinCode)
                .single();

            if (roomError || !room) {
               throw new Error(t('game.lobby.roomNotFound'));
            }

            if (room.status !== 'waiting') {
                throw new Error(t('game.lobby.gameAlreadyStarted'));
            }

            const nickname = profileData?.display_name || user.user_metadata.full_name || user.email?.split('@')[0] || t('game.common.playerFallback');
            const avatarUrl = profileData?.avatar_url || user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;

            const { error: joinError, data: joinData } = await supabase
                .from('game_participants')
                .insert({
                    room_id: room.id,
                    user_id: user.id, 
                    nickname: nickname,
                    avatar_url: avatarUrl
                })
                .select();

            if (joinError) throw joinError;

            sessionStorage.setItem(`quiz_game_session_${room.id}`, JSON.stringify({
                participantId: joinData[0].id,
                nickname: nickname,
                avatarUrl: joinData[0].avatar_url
            }));

            navigate(`/game/play/${room.id}`);

        } catch (error: any) {
            toast({ title: t('game.lobby.oops'), description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden font-sans">
             <Navbar />
             <BackgroundDecorations density="medium" />

             {/* Blob Backgrounds from Library */}
             <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/20 dark:bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/20 dark:bg-purple-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
                
                {/* Floating Icons */}
                <div className="hidden lg:block absolute inset-0">
                    <div className="absolute top-[20%] left-[10%] animate-float hover:scale-110 transition-transform duration-1000">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg border border-border/50 rotate-[-10deg]">
                            <div className="w-8 h-8 text-primary flex items-center justify-center text-3xl">🎮</div>
                        </div>
                    </div>
                    <div className="absolute bottom-[20%] right-[10%] animate-float animation-delay-2000 hover:scale-110 transition-transform duration-1000">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg border border-border/50 rotate-[10deg]">
                            <div className="w-8 h-8 text-yellow-400 flex items-center justify-center text-3xl">🏆</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 pt-32 pb-12 relative z-10 min-h-[calc(100vh-80px)] flex flex-col items-center justify-center">
                
                <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    
                    {/* Left Side: Mascot & Intro */}
                    <LobbyMascotSection />

                    {/* Right Side: Action Card */}
                    <Card className="border-4 border-white/20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-2xl rounded-[2.5rem] overflow-hidden animate-in slide-in-from-right duration-700 ring-1 ring-white/30 h-auto min-h-[600px] md:h-[600px]">
                    <CardContent className="p-8 md:p-10 h-full flex flex-col">
                        <div className="md:hidden flex flex-col items-center mb-8 space-y-2">
                            <div className="w-32 h-32"><Mascot className="w-full h-full" /></div>
                            <h1 className="text-4xl font-black font-heading text-center">Quiz Survival</h1>
                        </div>

                        <Tabs defaultValue="join" className="w-full h-full flex flex-col">
                                <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-200/50 dark:bg-slate-800/50 p-2 rounded-full h-auto">
                                    <TabsTrigger 
                                        value="join" 
                                        className="rounded-full h-14 text-lg font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all flex items-center justify-center p-0"
                                    >
                                        <Gamepad2 className="w-5 h-5 mr-2" /> {t('game.lobby.joinTab')}
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="host" 
                                        className="rounded-full h-14 text-lg font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all flex items-center justify-center p-0"
                                    >
                                        <Trophy className="w-5 h-5 mr-2" /> {t('game.lobby.hostTab')}
                                    </TabsTrigger>
                                </TabsList>

                                {/* JOIN TAB */}
                                <TabsContent value="join" className="flex-1 flex flex-col">
                                    <LobbyJoinTab 
                                        joinCode={joinCode}
                                        setJoinCode={setJoinCode}
                                        isLoading={isLoading}
                                        onJoin={handleJoinRoom}
                                    />
                                </TabsContent>

                                {/* HOST TAB */}
                                <TabsContent value="host">
                                    <LobbyHostTab
                                        myQuizzes={myQuizzes}
                                        selectedQuizId={selectedQuizId}
                                        setSelectedQuizId={setSelectedQuizId}
                                        isLoading={isLoading}
                                        onHost={handleCreateRoom}
                                    />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
