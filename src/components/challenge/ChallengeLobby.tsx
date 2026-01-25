import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Swords, 
  PlusCircle, 
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FramedAvatar } from '@/components/ui/FramedAvatar';
import { useNavigate } from 'react-router-dom';

interface Challenge {
  id: string;
  quiz_id: string;
  host_id: string;
  bet_amount: number;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  quiz: {
    title: string;
    questions: any[];
  };
  host: {
    display_name: string;
    avatar_url: string;
    equipped_avatar_frame: string;
  };
}

export function ChallengeLobby() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  // Fetch active challenges
  const { data: challenges, isLoading, refetch } = useQuery({
    queryKey: ['public-challenges'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('challenges')
        .select(`
          *,
          quiz:quizzes(title, questions),
          host:profiles!challenges_host_id_fkey(display_name, avatar_url, equipped_avatar_frame)
        `)
        .eq('status', 'waiting')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Challenge[];
    },
    refetchInterval: 5000, 
  });

  // Realtime Subscription
  useEffect(() => {
    const channel = (supabase as any)
      .channel('public-challenges')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'challenges', filter: 'status=eq.waiting' },
        () => {
          queryClient.invalidateQueries({ queryKey: ["public-challenges"] });
        }
      )
      .subscribe();

    return () => {
      (supabase as any).removeChannel(channel);
    };
  }, [queryClient]);

  const handleJoin = async (challengeId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(t('auth.loginRequired'));
        return;
      }

      // Call join function
      const { error } = await (supabase as any).rpc('join_challenge', {
        p_challenge_id: challengeId
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(t('challenge.joinedSuccess'));
      navigate(`/challenge/${challengeId}`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 flex items-center gap-3">
            <Swords className="w-10 h-10 text-red-500" />
            {t('challenge.arenaTitle', 'Đấu trường PvP')}
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            {t('challenge.arenaDesc', 'Thách đấu người chơi khác, cược ZCoin và giành chiến thắng!')}
          </p>
        </div>
        
        <Button 
          size="lg" 
          variant="hero"
          className="shadow-xl hover:scale-105 transition-transform"
          onClick={() => navigate('/quiz/library?mode=challenge')} // Redirect to library to pick a quiz
        >
          <PlusCircle className="mr-2 w-5 h-5" />
          {t('challenge.createRoom', 'Tạo phòng')}
        </Button>
      </div>

      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden min-h-[400px]">
        <div className="p-4 border-b flex items-center justify-between bg-white/40 dark:bg-slate-800/40">
           <h2 className="font-bold flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             {t('challenge.activeRooms', 'Phòng đang chờ')} ({challenges?.length || 0})
           </h2>
           <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isLoading}>
             <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
           </Button>
        </div>

        <ScrollArea className="h-[500px] p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : challenges && challenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.map((room) => (
                <div 
                  key={room.id}
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl p-4 border-2 border-slate-100 dark:border-slate-700 hover:border-red-400 dark:hover:border-red-500 shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                       <FramedAvatar 
                          avatarUrl={room.host.avatar_url}
                          frameId={room.host.equipped_avatar_frame}
                          fallbackName={room.host.display_name}
                          size="md"
                       />
                       <div>
                         <p className="font-bold text-lg leading-tight group-hover:text-red-500 transition-colors">
                           {room.host.display_name}
                         </p>
                         <p className="text-xs text-muted-foreground">Host</p>
                       </div>
                    </div>
                    
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      🪙 {room.bet_amount} ZCoin
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                       <span className="text-muted-foreground">{t('common.quiz')}:</span>
                       <span className="font-semibold truncate max-w-[150px]">{room.quiz?.title}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                       <span className="text-muted-foreground">{t('common.questions')}:</span>
                       <span className="font-semibold">{room.quiz?.questions?.length || 0}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-4 bg-slate-900 text-white hover:bg-red-600 dark:bg-slate-700 dark:hover:bg-red-600 transition-colors"
                    onClick={() => handleJoin(room.id)}
                  >
                    <Swords className="w-4 h-4 mr-2" />
                    {t('challenge.joinNow', 'Thách đấu ngay')}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-60 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                 <Swords className="w-10 h-10 text-slate-300" />
              </div>
              <div>
                <p className="text-lg font-bold text-muted-foreground">
                  {t('challenge.noRooms', 'Chưa có phòng nào')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('challenge.createFirst', 'Hãy tạo phòng đầu tiên để thách đấu mọi người!')}
                </p>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
