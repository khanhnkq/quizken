import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { QuizContent } from '@/components/quiz/QuizContent';
import { ChallengeResult } from './ChallengeResult';
import { Progress } from '@/components/ui/progress';
import { FramedAvatar } from '@/components/ui/FramedAvatar';
import { toast } from 'sonner';
import Mascot from '@/components/ui/Mascot';

interface ChallengeGameProps {
  challenge: any;
  currentUser: any;
  onFinish?: () => void;
}

export function ChallengeGame({ challenge, currentUser, onFinish }: ChallengeGameProps) {
  const [isFinished, setIsFinished] = useState(false);
  const isHost = challenge.host_id === currentUser.id;
  const opponent = isHost ? challenge.guest : challenge.host;

  // State for quiz logic
  const [userAnswers, setUserAnswers] = useState<number[]>(
    new Array(challenge.quiz.questions.length).fill(-1)
  );

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = answerIndex;
    setUserAnswers(newAnswers);
  };

  useEffect(() => {
    const channel = (supabase as any)
      .channel(`challenge-game-${challenge.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'challenges', filter: `id=eq.${challenge.id}` },
        (payload: any) => {
          const newRow = payload.new;
          const oppScore = isHost ? newRow.guest_score : newRow.host_score;
          // If opponent finished, show notification
          if (oppScore !== null && ((isHost && challenge.guest_score === null) || (!isHost && challenge.host_score === null))) {
             toast.info(`${opponent.display_name} has finished!`);
             // We could force refresh or just let the user finish
             if (isFinished) {
               // If I am also finished, trigger onFinish to show result
               onFinish && onFinish();
             }
          }
        }
      )
      .subscribe();

    return () => {
      (supabase as any).removeChannel(channel);
    };
  }, [challenge.id, isFinished, isHost, opponent.display_name, onFinish, challenge.guest_score, challenge.host_score]);


  const handleQuizFinish = async (score: number, correctCount: number, timeTaken: number) => {
    setIsFinished(true);
    
    // Submit result
    const { error } = await (supabase as any).rpc('submit_challenge_result', {
      p_challenge_id: challenge.id,
      p_score: score, 
      p_time_seconds: timeTaken
    });

    if (error) {
      toast.error('Failed to submit result');
      return;
    }

    if (onFinish) onFinish();
  };

  if (challenge.status === 'completed' || (isHost && challenge.host_score !== null) || (!isHost && challenge.guest_score !== null)) {
      // If I finished, show Waiting for Opponent OR Result
      if ((isHost && challenge.guest_score === null) || (!isHost && challenge.host_score === null)) {
          return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
               <div className="animate-bounce mb-8">
                 <Mascot emotion="celebrate" size={150} />
               </div>
               <h2 className="text-3xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">
                 You Finished! 🚀
               </h2>
               <p className="text-xl text-muted-foreground animate-pulse font-medium">
                 Waiting for opponent to finish...
               </p>
               
               <div className="mt-8 p-6 bg-slate-100 dark:bg-slate-800 rounded-3xl w-full max-w-sm">
                  <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Your Score</div>
                  <div className="text-5xl font-black">
                    {isHost ? challenge.host_score : challenge.guest_score}
                  </div>
               </div>
            </div>
          );
      }
      return <ChallengeResult challenge={challenge} currentUser={currentUser} />;
  }

  // Reuse QuizContent but with PvP wrappers
  return (
    <div className="relative">
       {/* Opponent Status Header */}
       <div className="fixed top-20 right-4 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xl flex items-center gap-3 animate-in slide-in-from-right duration-700">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black tracking-widest text-red-500 uppercase">VS OPPONENT</span>
            <span className="font-bold text-sm max-w-[100px] truncate">{opponent.display_name}</span>
          </div>
          <FramedAvatar 
             avatarUrl={opponent.avatar_url}
             frameId={opponent.equipped_avatar_frame}
             size="sm"
          />
       </div>

       <QuizContent 
         quiz={challenge.quiz}
         userAnswers={userAnswers}
         showResults={false}
         tokenUsage={null}
         onAnswerSelect={handleAnswerSelect}
         onGrade={() => {}} // Not used because we pass onComplete
         onReset={() => {}} // No reset in PvP
         calculateScore={() => 0} // Not used for display
         onDownload={() => {}}
         userId={currentUser.id}
         startTime={Date.now()} 
         onComplete={handleQuizFinish}
       />
    </div>
  );
}
