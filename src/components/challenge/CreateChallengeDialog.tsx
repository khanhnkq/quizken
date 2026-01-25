import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Swords, Coins, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface CreateChallengeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (betAmount: number) => Promise<void>;
  quizTitle: string;
}

export function CreateChallengeDialog({ isOpen, onClose, onConfirm, quizTitle }: CreateChallengeDialogProps) {
  const { t } = useTranslation();
  const [betAmount, setBetAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (betAmount < 0) {
      toast.error('Bet amount cannot be negative');
      return;
    }
    setLoading(true);
    try {
      await onConfirm(betAmount);
      // Don't close here, wait for navigation inside onConfirm
    } catch (error) {
       console.error(error);
       setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl border-4 border-slate-100 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-center flex items-center justify-center gap-2">
            <Swords className="w-8 h-8 text-red-500" />
            Create Challenge
          </DialogTitle>
          <DialogDescription className="text-center">
            Challenge others in <strong>{quizTitle}</strong>!
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
           <div className="space-y-4">
              <Label className="text-base font-bold">Bet Amount (ZCoin)</Label>
              <div className="relative">
                 <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500 w-5 h-5 transition-transform group-focus-within:scale-110" />
                 <Input 
                   type="number" 
                   value={betAmount} 
                   onChange={(e) => setBetAmount(Number(e.target.value))}
                   className="pl-12 h-14 rounded-2xl text-lg font-bold border-4 border-slate-100 focus:border-yellow-400 transition-colors"
                   min={0}
                 />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                 Winner takes all! (If draw, bet is refunded)
              </p>
           </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
           <Button variant="ghost" onClick={onClose} disabled={loading} className="w-full sm:w-auto rounded-xl h-12">
             Cancel
           </Button>
           <Button 
             onClick={handleConfirm} 
             disabled={loading}
             className="w-full sm:w-auto rounded-xl h-12 font-bold text-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 border-b-4 border-red-700 active:border-b-0 active:translate-y-1 transition-all"
           >
             {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Create Room'}
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
