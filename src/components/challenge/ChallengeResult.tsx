import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { FramedAvatar } from '@/components/ui/FramedAvatar';
import { Crown, Trophy, Frown, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Mascot from '@/components/ui/Mascot';
import { Confetti } from '@/components/ui/confetti';

interface ChallengeResultProps {
  challenge: any;
  currentUser: any;
}

export function ChallengeResult({ challenge, currentUser }: ChallengeResultProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isWinner = challenge.winner_id === currentUser.id;
  const isDraw = !challenge.winner_id;
  const earnings = isWinner ? challenge.bet_amount * 2 : (isDraw ? challenge.bet_amount : 0);

  const opponent = challenge.host_id === currentUser.id ? challenge.guest : challenge.host;
  const myScore = challenge.host_id === currentUser.id ? challenge.host_score : challenge.guest_score;
  const oppScore = challenge.host_id === currentUser.id ? challenge.guest_score : challenge.host_score;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {isWinner && <Confetti />}
      
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border-4 border-slate-100 dark:border-slate-800">
        <div className={`h-32 ${isWinner ? 'bg-yellow-400' : isDraw ? 'bg-slate-400' : 'bg-red-500'} flex items-center justify-center`}>
           <Mascot emotion={isWinner ? 'party' : isDraw ? 'neutral' : 'sad'} size={120} className="translate-y-10" />
        </div>

        <div className="pt-16 pb-8 px-6 text-center space-y-4">
           {isWinner ? (
             <>
               <h1 className="text-4xl font-black text-yellow-500 flex items-center justify-center gap-2">
                 <Crown className="w-10 h-10 fill-yellow-500" />
                 VICTORY!
               </h1>
               <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-2xl border-2 border-yellow-200 dark:border-yellow-700">
                  <p className="text-sm font-bold text-yellow-700 dark:text-yellow-400">EARNINGS</p>
                  <p className="text-4xl font-black text-yellow-600 dark:text-yellow-400">+{earnings} ZCoin</p>
               </div>
             </>
           ) : isDraw ? (
             <>
               <h1 className="text-4xl font-black text-slate-500">DRAW!</h1>
               <p className="text-muted-foreground">Bet refunded.</p>
             </>
           ) : (
             <>
               <h1 className="text-4xl font-black text-red-500">DEFEAT</h1>
               <p className="text-muted-foreground">Better luck next time!</p>
             </>
           )}

           <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                 <p className="text-xs font-bold text-muted-foreground mb-2">YOU</p>
                 <div className="text-2xl font-black">{myScore}</div>
                 <p className="text-xs text-muted-foreground">Points</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl opacity-80">
                 <p className="text-xs font-bold text-muted-foreground mb-2">OPPONENT</p>
                 <div className="text-2xl font-black">{oppScore}</div>
                 <p className="text-xs text-muted-foreground">Points</p>
              </div>
           </div>
           
           <div className="flex flex-col gap-2 pt-4">
              <Button size="lg" className="w-full" onClick={() => navigate('/challenge')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Lobby
              </Button>
              <Button variant="ghost" onClick={() => navigate('/')}>
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
