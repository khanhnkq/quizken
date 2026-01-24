import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useUserItems } from '@/hooks/useUserItems';
import { useGachaBanners } from '@/hooks/useGachaBanners';
import { ExchangeItem } from '@/lib/exchangeItems';
import { GachaBanner } from './GachaBanner';
import { GachaAnimation } from './GachaAnimation';
import { GachaResult } from './GachaResultDialog'; // I named the file GachaResultDialog.tsx but export GachaResult
import { Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export function GachaSystem() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { statistics: stats, refetch: refetchStats } = useDashboardStats(user?.id);
  const { refetch: refetchItems } = useUserItems();
  const { data: banners, isLoading: isLoadingBanners } = useGachaBanners();

  const [isPulling, setIsPulling] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [wonItem, setWonItem] = useState<ExchangeItem | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handlePull = async (bannerId: string, cost: number) => {
    console.log("Pull initiated for banner:", bannerId, "Cost:", cost);
    console.log("Current ZCoins:", stats?.zcoin);

    if (!stats || stats.zcoin < cost) {
      console.warn("Not enough ZCoins");
      toast.error(t('exchange.noZCoin') || "Not enough ZCoins!", {
        description: "You need more ZCoins to summon.",
        icon: "🪙"
      });
      return;
    }

    setIsPulling(true);
    setShowAnimation(true);

    try {
      console.log("Calling gacha_pull RPC...");
      const { data, error } = await supabase.rpc('gacha_pull', {
        p_banner_id: bannerId
      });

      if (error) {
        console.error("RPC Error:", error);
        throw error;
      }

      console.log("RPC Result:", data);

      if (data && data.success) {
        // Wait for animation
        setWonItem(data.item);
        // Stats/Items will be refetched after animation
      } else {
        throw new Error(data?.message || 'Summon failed');
      }
    } catch (err: any) {
      console.error('Gacha error:', err);
      toast.error("Summon Failed", {
        description: err.message
      });
      setIsPulling(false);
      setShowAnimation(false);
    }
  };

  const handleAnimationComplete = async () => {
    setShowAnimation(false);
    setShowResult(true);
    setIsPulling(false);
    
    // Refresh data
    await Promise.all([refetchStats(), refetchItems()]);
  };

  if (isLoadingBanners) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-yellow-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400">No Events Active</h3>
        <p className="text-slate-400 text-sm">Check back later for new banners!</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[500px]">
      <div className="grid grid-cols-1 gap-8">
        {banners.map((banner) => (
          <GachaBanner
            key={banner.id}
            id={banner.id}
            name={banner.name}
            description={banner.description}
            imageUrl={banner.image_url}
            cost={banner.cost}
            onPull={() => handlePull(banner.id, banner.cost)}
            disabled={isPulling}
          />
        ))}
      </div>

      <AnimatePresence>
        {showAnimation && (
          <GachaAnimation onComplete={handleAnimationComplete} />
        )}
      </AnimatePresence>

      <GachaResult 
        item={wonItem} 
        open={showResult} 
        onClose={() => setShowResult(false)} 
      />
    </div>
  );
}
