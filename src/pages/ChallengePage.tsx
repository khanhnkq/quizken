import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChallengeLobby } from '@/components/challenge/ChallengeLobby';
import { ChallengeWaitingRoom } from '@/components/challenge/ChallengeWaitingRoom';
import { ChallengeGame } from '@/components/challenge/ChallengeGame';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export default function ChallengePage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  
  // Get Current User
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['challenge-user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    }
  });

  // If ID exists, fetch challenge state
  const { data: challenge, isLoading: isChallengeLoading } = useQuery({
    queryKey: ['challenge-state', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await (supabase as any)
        .from('challenges')
        .select(`
           *,
           quiz:quizzes(*),
           host:profiles!challenges_host_id_fkey(*),
           guest:profiles!challenges_guest_id_fkey(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as any;
    },
    enabled: !!id,
    refetchInterval: (query) => {
       // Poll faster if waiting or active
       const data = query.state.data as any;
       if (data && (data.status === 'waiting' || data.status === 'active')) return 2000;
       return 5000;
    }
  });

  if (isUserLoading || (id && isChallengeLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // 1. No ID -> Render Lobby
  if (!id) {
    return <ChallengeLobby />;
  }

  // 2. ID exists but not found -> 404
  if (!challenge) {
    return <div>Challenge not found</div>;
  }

  // 3. Status handling
  if (challenge.status === 'waiting') {
     return <ChallengeWaitingRoom challengeId={id} />;
  }

  if (challenge.status === 'active' || challenge.status === 'completed') {
     return <ChallengeGame challenge={challenge} currentUser={user} />;
  }

  return <div>Unknown Status</div>;
}
