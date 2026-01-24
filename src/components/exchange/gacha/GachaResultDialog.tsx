import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExchangeItem } from '@/lib/exchangeItems';
import { Sparkles, Share2, Check, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

interface GachaResultProps {
  item: ExchangeItem | null;
  open: boolean;
  onClose: () => void;
}

export const GachaResult: React.FC<GachaResultProps> = ({ item, open, onClose }) => {
  const [showCard, setShowCard] = useState(false);
  
  // Use a simplified rarity check for MVP
  const isRare = item && (item.type === 'theme' || item.type === 'avatar');

  useEffect(() => {
    if (open) {
      // Delay showing the card content slightly for a "reveal" feel
      const timer = setTimeout(() => setShowCard(true), 100);
      
      // Bonus confetti for rare items
      if (isRare) {
        const rareTimer = setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 160,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FFA500']
          });
        }, 500);
        return () => clearTimeout(rareTimer);
      }
      
      return () => clearTimeout(timer);
    } else {
      setShowCard(false);
    }
  }, [open, isRare]);

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md border-0 bg-transparent shadow-none p-0 overflow-visible outline-none focus:outline-none">
        
        {/* Main Card Container */}
        <motion.div
          initial={{ rotateX: 90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: -90, opacity: 0 }}
          transition={{ type: "spring", damping: 15, stiffness: 100 }}
          className="relative perspective-1000 group"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Rarity Glow Behind Card */}
          <div className={`
            absolute inset-0 rounded-[2.5rem] blur-3xl opacity-50 
            transition-all duration-1000 -z-10 animate-pulse
            ${isRare ? 'bg-amber-500 scale-110' : 'bg-slate-400 scale-100'}
          `} />

          {/* Card Body */}
          <div className={`
            relative bg-gradient-to-b overflow-hidden
            ${isRare 
              ? 'from-amber-100 via-white to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-amber-950/30 border-amber-400/50' 
              : 'from-slate-100 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border-slate-700/50'}
            border-4 rounded-[2.5rem] shadow-2xl
          `}>
             {/* Card Top Decoration */}
             <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/5 to-transparent dark:from-white/5 pointer-events-none" />

            <div className="flex flex-col items-center p-8 pb-10 text-center">
              
              {/* Rarity Header */}
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                 {isRare ? (
                   <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-widest border border-amber-200 dark:border-amber-700/50">
                     <Sparkles className="w-3 h-3 fill-current" /> Legendary Find
                   </div>
                 ) : (
                   <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest">
                     Common Drop
                   </div>
                 )}
              </motion.div>

              {/* Item Image */}
              <motion.div 
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                className="relative w-40 h-40 mb-8"
              >
                {/* Glow behind image */}
                <div className={`absolute inset-0 rounded-full blur-2xl opacity-40 ${isRare ? 'bg-amber-400' : 'bg-slate-400'}`} />
                
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-contain relative z-10 drop-shadow-xl" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl relative z-10 drop-shadow-xl select-none">
                    {item.icon}
                  </div>
                )}
              </motion.div>

              {/* Item Info */}
              <div className="space-y-2 mb-8">
                <h3 className={`text-2xl font-black ${isRare ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-200'}`}>
                  {item.name}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm px-4">
                  {item.description}
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 w-full">
                <Button 
                  variant="outline" 
                  className="rounded-xl h-12 border-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                  onClick={() => {
                    navigator.clipboard.writeText(`I just got ${item.name} in QuizKen!`);
                    toast.success("Copied to clipboard!");
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
                <Button 
                  onClick={onClose}
                  className={`
                    rounded-xl h-12 text-base font-bold shadow-lg
                    ${isRare 
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200 dark:shadow-none' 
                      : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200'}
                  `}
                >
                  Collect
                </Button>
              </div>

            </div>
          </div>
        </motion.div>

      </DialogContent>
    </Dialog>
  );
};
