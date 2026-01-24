import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Info, Ticket, Star } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface GachaBannerProps {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  cost: number;
  onPull: () => void;
  disabled?: boolean;
}

export const GachaBanner: React.FC<GachaBannerProps> = ({
  id,
  name,
  description,
  imageUrl,
  cost,
  onPull,
  disabled
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full max-w-5xl mx-auto h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl group select-none"
    >
      {/* Background Layer */}
      <div className="absolute inset-0 bg-slate-900">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-full object-cover opacity-80 transition-transform duration-[20s] ease-linear group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500 via-purple-900 to-slate-900" />
        )}
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent" />
      </div>

      {/* Decorative Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [-10, -100], 
              opacity: [0, 1, 0],
              scale: [0.5, 1.2]
            }}
            transition={{ 
              duration: 3 + Math.random() * 2, 
              repeat: Infinity, 
              delay: Math.random() * 2,
              ease: "easeOut"
            }}
            className="absolute bg-yellow-400 rounded-full blur-[2px]"
            style={{
              left: `${20 + Math.random() * 60}%`,
              bottom: '0%',
              width: `${4 + Math.random() * 6}px`,
              height: `${4 + Math.random() * 6}px`,
            }}
          />
        ))}
      </div>

      {/* Main Content Container */}
      <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between">
        
        {/* Top Bar: Badges */}
        <div className="flex items-start justify-between">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex flex-col gap-2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-500/20 backdrop-blur-md border border-yellow-400/50 rounded-full text-yellow-300 text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(234,179,8,0.3)] animate-pulse">
              <Star className="w-3 h-3 fill-yellow-300" />
              Featured Event
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1 text-white/80 text-[10px] uppercase tracking-wide w-fit">
              Limited Time Only
            </div>
          </motion.div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/10">
                  <Info className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-slate-900/95 border-slate-700 backdrop-blur-xl text-slate-300">
                <div className="space-y-1 p-1">
                  <p className="font-bold text-white mb-2">Drop Rates</p>
                  <div className="flex justify-between gap-4 text-xs"><span className="text-yellow-400">★★★★ Rare</span> <span>10%</span></div>
                  <div className="flex justify-between gap-4 text-xs"><span className="text-violet-400">★★★ Uncommon</span> <span>30%</span></div>
                  <div className="flex justify-between gap-4 text-xs"><span className="text-slate-400">★★ Common</span> <span>60%</span></div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Bottom Area: Info & Action */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 z-10">
          
          {/* Text Info */}
          <div className="flex-1 space-y-4 max-w-2xl">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-white font-heading leading-[0.9] tracking-tight drop-shadow-2xl"
            >
              {name}
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed"
            >
              {description}
            </motion.p>
          </div>

          {/* Summon Button Block */}
          <div className="shrink-0 w-full md:w-auto">
            <div className="bg-slate-950/40 backdrop-blur-xl rounded-3xl p-2 border border-white/10 shadow-2xl">
              <Button
                onClick={onPull}
                disabled={disabled}
                className={`
                  relative overflow-hidden w-full md:w-64 h-20 rounded-2xl
                  bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500
                  border-t border-white/20 shadow-[0_8px_30px_rgb(79,70,229,0.4)]
                  transition-all duration-300 active:scale-95 group/btn
                  ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                `}
              >
                {/* Button Shine Effect */}
                <div className="absolute inset-0 -translate-x-[150%] group-hover/btn:translate-x-[150%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />

                <div className="flex flex-col items-center gap-0.5 relative z-10">
                  <div className="flex items-center gap-2 text-2xl font-black italic tracking-wider text-white">
                    <Sparkles className="w-5 h-5 fill-white animate-pulse" />
                    SUMMON
                  </div>
                  <div className="flex items-center gap-1.5 text-indigo-100 text-sm font-bold bg-black/20 px-3 py-0.5 rounded-full">
                    <Ticket className="w-3 h-3" />
                    {cost} ZCOIN
                  </div>
                </div>
              </Button>
            </div>
            {/* Balance Hint */}
            <div className="text-center mt-3 text-xs font-medium text-slate-500 uppercase tracking-widest">
              Guaranteed 3★+ every 10 pulls
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};
