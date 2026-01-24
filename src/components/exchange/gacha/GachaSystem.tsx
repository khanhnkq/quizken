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
import { Loader2, AlertTriangle, Wallet, Palette, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export function GachaSystem() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { statistics: stats, refetch: refetchStats } = useDashboardStats(user?.id);
  const { data: ownedItems = [], refetch: refetchItems } = useUserItems();
  const { data: banners, isLoading: isLoadingBanners } = useGachaBanners();

  // Calculate owned themes count
  const ownedThemesCount = ownedItems.filter(i => i.item_id.startsWith('theme_')).length;

  const [isPulling, setIsPulling] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [wonItem, setWonItem] = useState<ExchangeItem | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [selectedBannerId, setSelectedBannerId] = useState<string | null>(null);

  // Auto-select first banner on load
  React.useEffect(() => {
    if (banners && banners.length > 0 && !selectedBannerId) {
      setSelectedBannerId(banners[0].id);
    }
  }, [banners, selectedBannerId]);

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
      const { data, error } = await (supabase as any).rpc('gacha_pull', {
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

  const selectedBanner = banners.find(b => b.id === selectedBannerId) || banners[0];

  return (
    <div className="relative min-h-[500px] space-y-8">
      {/* Header Stats */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6">
          <div className="text-center md:text-left space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-amber-400 dark:border-amber-600 text-amber-600 dark:text-amber-400 font-bold text-sm shadow-sm animate-fade-in">
                  <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>Lucky Draw</span>
              </div>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground dark:text-white drop-shadow-sm">
                  {t('exchange.luckyDraw', 'Vòng Quay May Mắn')}
              </h1>
              <p className="text-lg text-muted-foreground font-medium max-w-lg">
                  {t('exchange.luckyDescription', 'Thử vận may để nhận giao diện độc quyền!')}
              </p>
          </div>

          <div className="flex items-center gap-4">
              {/* Theme Count */}
              <div className="bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <Palette className="w-5 h-5" />
                  </div>
                  <div>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Themes</div>
                      <div className="text-xl font-black text-foreground dark:text-white leading-none">
                          {ownedThemesCount}
                      </div>
                  </div>
              </div>

              {/* Wallet */}
              <div className="bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                      <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">ZCoin</div>
                      <div className="text-xl font-black text-foreground dark:text-white leading-none">
                          {stats?.zcoin?.toLocaleString() || 0}
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Banner List */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-3">
          <h3 className="font-bold text-lg px-2 text-muted-foreground">Sự kiện đang diễn ra</h3>
          <div className="flex flex-col gap-3">
             {banners.map(banner => (
                <button
                  key={banner.id}
                  onClick={() => setSelectedBannerId(banner.id)}
                  className={`relative p-3 rounded-2xl transition-all text-left flex items-center gap-3 border-2 group
                    ${selectedBannerId === banner.id 
                       ? 'bg-white dark:bg-slate-800 border-primary shadow-md scale-[1.02]' 
                       : 'bg-white/50 dark:bg-slate-900/50 border-transparent hover:bg-white hover:dark:bg-slate-800 hover:border-slate-200'}
                  `}
                >
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700 bg-slate-100">
                       <img src={banner.image_url} alt={banner.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className={`font-bold truncate ${selectedBannerId === banner.id ? 'text-primary' : 'text-foreground'}`}>
                         {banner.name}
                       </h4>
                       <p className="text-xs text-muted-foreground truncate line-clamp-1">{banner.description}</p>
                       <div className="mt-1 flex items-center gap-1">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                             {banner.cost} ZCoin
                          </span>
                       </div>
                    </div>
                </button>
             ))}
          </div>
        </div>

        {/* Main Content - Selected Banner */}
        <div className="flex-1 min-w-0">
           {selectedBanner && (
              <motion.div
                key={selectedBanner.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                  <GachaBanner
                    id={selectedBanner.id}
                    name={selectedBanner.name}
                    description={selectedBanner.description}
                    imageUrl={selectedBanner.image_url}
                    cost={selectedBanner.cost}
                    onPull={() => handlePull(selectedBanner.id, selectedBanner.cost)}
                    disabled={isPulling}
                  />
              </motion.div>
           )}
        </div>
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
