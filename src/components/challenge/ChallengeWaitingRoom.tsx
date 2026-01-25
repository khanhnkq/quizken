import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Copy, Trash2, Swords } from 'lucide-react';
import { FramedAvatar } from '@/components/ui/FramedAvatar';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Mascot from '@/components/ui/Mascot';

interface ChallengeWaitingRoomProps {
  challengeId: string;
}

export function ChallengeWaitingRoom({ challengeId }: ChallengeWaitingRoomProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch challenge details
  const { data: challenge, isLoading, refetch } = useQuery({
    queryKey: ['challenge', challengeId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('challenges')
        .select(`
          *,
          quiz:quizzes(title, questions),
          host:profiles!challenges_host_id_fkey(display_name, avatar_url, equipped_avatar_frame),
          guest:profiles!challenges_guest_id_fkey(display_name, avatar_url, equipped_avatar_frame)
        `)
        .eq('id', challengeId)
        .single();

      if (error) throw error;
      return data as any; // Temporary cast to avoid deep type instantiation errors
    },
    // Don't auto refetch everything, rely on realtime
  });

  // Realtime Subscription for Status Change or Guest Join
  useEffect(() => {
    const channel = (supabase as any)
      .channel(`challenge-${challengeId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'challenges', filter: `id=eq.${challengeId}` },
        (payload) => {
          console.log('Challenge updated:', payload);
          refetch(); // Refresh data to get full guest profile
          
          if (payload.new.status === 'active') {
            toast({
              title: (t('challenge.gameStarting') || 'Game Starting!'),
              description: (t('challenge.opponentJoined') || 'Opponent joined!'),
              variant: 'default',
              duration: 2000,
            });
            // Game will handle redirect or view switch
          }
        }
      )
      .subscribe();

    return () => {
      (supabase as any).removeChannel(channel);
    };
  }, [challengeId, refetch, t]);

  const handleCancel = async () => {
    try {
      const { error } = await (supabase as any).rpc('cancel_challenge', {
        p_challenge_id: challengeId
      });
      if (error) throw error;
      navigate('/challenge');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: t('common.copied'),
      description: t('challenge.linkCopied'),
    });
  };

  if (isLoading || !challenge) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 flex flex-col items-center justify-center min-h-[600px] gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black font-heading text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          Waiting for Opponent...
        </h1>
        <p className="text-muted-foreground text-lg">
          Room ID: <span className="font-mono bg-muted px-2 py-1 rounded select-all">{challengeId}</span>
          <Button variant="ghost" size="icon" onClick={copyLink} className="ml-2">
            <Copy className="w-4 h-4" />
          </Button>
        </p>
      </div>

      <div className="flex items-center gap-8 w-full justify-center">
        {/* Host */}
        <div className="flex flex-col items-center gap-4 animate-in slide-in-from-left duration-500">
           <div className="relative">
             <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10">
               HOST
             </div>
             <FramedAvatar 
               avatarUrl={challenge.host.avatar_url}
               frameId={challenge.host.equipped_avatar_frame}
               fallbackName={challenge.host.display_name}
               size="xl"
               className="w-32 h-32"
             />
           </div>
           <p className="text-2xl font-bold">{challenge.host.display_name}</p>
        </div>

        {/* VS Animation */}
        <div className="flex flex-col items-center gap-2 z-10">
           <div className="relative">
             <Swords className="w-16 h-16 text-red-500 animate-pulse" />
             <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 animate-pulse" />
           </div>
           <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-xl border-2 border-yellow-400 shadow-lg">
             <span className="font-black text-2xl text-yellow-600">
               {challenge.bet_amount}
             </span>
             <span className="text-xs font-bold text-yellow-600 ml-1">ZCOIN</span>
           </div>
        </div>

        {/* Guest (Placeholder or Actual) */}
        <div className="flex flex-col items-center gap-4 animate-in slide-in-from-right duration-500">
           {challenge.guest ? (
             <>
               <FramedAvatar 
                 avatarUrl={challenge.guest.avatar_url}
                 frameId={challenge.guest.equipped_avatar_frame}
                 fallbackName={challenge.guest.display_name}
                 size="xl"
                 className="w-32 h-32"
               />
               <p className="text-2xl font-bold">{challenge.guest.display_name}</p>
             </>
           ) : (
             <div className="flex flex-col items-center gap-4 opacity-50">
               <div className="w-32 h-32 rounded-full border-4 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                 <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
               </div>
               <p className="text-xl font-medium text-slate-400">Waiting...</p>
             </div>
           )}
        </div>
      </div>

      <div className="mt-8">
        <Mascot emotion="celebrate" size={150} />
      </div>

      <div className="flex gap-4">
        {challenge.host_id === (supabase.auth.getUser() as any)?.data?.user?.id && (
           <Button variant="destructive" size="lg" onClick={handleCancel}>
             <Trash2 className="w-4 h-4 mr-2" />
             Cancel Room
           </Button>
        )}
      </div>

    </div>
  );
}
