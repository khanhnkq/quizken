import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import { supabase } from '@/integrations/supabase/client';
import { useItems } from '@/hooks/useItems';
import { Loader2, Store, Shirt, Palette, Zap, FileText, Search, Sparkles, Wallet } from 'lucide-react';
import { ExchangeItemCard } from './ExchangeItemCard';

import { useUserItems } from '@/hooks/useUserItems';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { ExchangeItem } from '@/lib/exchangeItems';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

type FilterType = 'all' | 'avatar' | 'theme' | 'powerup' | 'document';

export function ExchangeTab() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { statistics: stats, refetch: refetchStats } = useDashboardStats(user?.id);
    const { data: ownedItems = [], refetch: refetchItems } = useUserItems();
    const { data: items = [], isLoading: isLoadingItems } = useItems();

    const [purchasingId, setPurchasingId] = useState<string | null>(null);

    const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const handleBuy = async (item: ExchangeItem) => {
        if (!stats || stats.zcoin < item.price) {
            toast.error(t('exchange.noZCoin'), {
                description: t('exchange.noZCoinDesc'),
                icon: "🪙"
            });
            return;
        }

        setPurchasingId(item.id);

        try {
            const { data, error } = await supabase.rpc('purchase_item', {
                p_item_id: item.id,
                p_metadata: {}
            });

            if (error) throw error;

            if (data && data.success) {
                // Success!
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#FFD700', '#FFA500', '#FF4500'] // Gold colors
                });

                toast.success(t('exchange.purchaseSuccess', { name: item.name }), {
                    description: t('exchange.purchaseSuccessDesc'),
                    icon: "🎉"
                });

                await Promise.all([refetchStats(), refetchItems()]);
            } else {
                throw new Error(data?.message || 'Transaction failed');
            }
        } catch (err: any) {
            console.error('Purchase error:', err);
            toast.error(t('exchange.purchaseError'), {
                description: err.message
            });
        } finally {
            setPurchasingId(null);
        }
    };

    const ownedItemIds = new Set(ownedItems.map(i => i.item_id));

    // Filter items logic
    const filteredItems = items.filter(item => {
        const matchesFilter = selectedFilter === 'all' || item.type === selectedFilter;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const categories = [
        { id: 'all', label: t('exchange.filter.all'), icon: Store, color: 'bg-violet-100 text-violet-600' },
        { id: 'avatar', label: t('exchange.filter.avatar'), icon: Shirt, color: 'bg-blue-100 text-blue-600' },
        { id: 'theme', label: t('exchange.filter.theme'), icon: Palette, color: 'bg-pink-100 text-pink-600' },
        { id: 'powerup', label: t('exchange.filter.powerup'), icon: Zap, color: 'bg-amber-100 text-amber-600' },
        { id: 'document', label: t('exchange.filter.document'), icon: FileText, color: 'bg-emerald-100 text-emerald-600' },
    ];

    if (isLoadingItems) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Top Header Row - Matching Dashboard "Hello" Style */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6">
                {/* Title Section - Matching Dashboard Style */}
                <div className="text-center md:text-left space-y-2">
                    {/* Badge - Same style as Dashboard "Welcome Back" badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-violet-400 dark:border-violet-600 text-violet-600 dark:text-violet-400 font-bold text-sm shadow-sm animate-fade-in">
                        <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span>{t('exchange.badge')}</span>
                    </div>

                    {/* Title - Same style as Dashboard "Hello, {name}" */}
                    <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground dark:text-white drop-shadow-sm">
                        {t('exchange.welcome')}{' '}
                        <span className="text-violet-600 relative inline-block">
                            ZCoin Bazaar
                            <svg className="absolute -bottom-2 left-0 w-full h-3 text-violet-300 -z-10 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="12" fill="none" />
                            </svg>
                        </span>
                        <span className="inline-block animate-wave ml-2 origin-[70%_70%]">🛍️</span>
                    </h1>

                    {/* Subtitle - Same style as Dashboard */}
                    <p className="text-lg text-muted-foreground dark:text-gray-400 font-medium max-w-lg">
                        {t('exchange.subtitle')}
                    </p>
                </div>

                {/* Wallet Card - Redesigned to match Dashboard button style */}
                <div className="group">
                    <div className="relative bg-gradient-to-br from-violet-500 to-purple-600 px-8 py-5 rounded-3xl shadow-xl border-4 border-violet-400/50 flex items-center gap-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-default">
                        {/* Decorative background elements */}
                        <div className="absolute inset-0 bg-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        {/* Wallet Icon */}
                        <div className="relative">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-sm group-hover:rotate-12 transition-transform duration-300">
                                <Wallet className="w-9 h-9 text-white drop-shadow-md" />
                            </div>
                            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300 animate-pulse drop-shadow-md" />
                        </div>

                        {/* Balance */}
                        <div className="flex flex-col relative z-10">
                            <span className="text-xs font-bold text-white/70 uppercase tracking-wider">{t('exchange.wallet')}</span>
                            <span className="text-4xl font-black text-white tabular-nums leading-none drop-shadow-sm">
                                {stats?.zcoin?.toLocaleString() || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>



            {/* Filter & Search Bar */}
            <div className="sticky top-4 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">

                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 px-2 scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedFilter(cat.id as FilterType)}
                            className={`
                                flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-200 border-2
                                ${selectedFilter === cat.id
                                    ? `${cat.color} border-current shadow-md scale-105`
                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'}
                            `}
                        >
                            <cat.icon className="w-4 h-4" />
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Search Input */}
                <div className="relative w-full md:w-64 px-2 md:px-0">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder={t('exchange.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner"
                    />
                </div>
            </div>

            {/* Grid Items */}
            <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <ExchangeItemCard
                                item={item}
                                userZCoin={stats?.zcoin || 0}
                                isOwned={ownedItemIds.has(item.id)}
                                isPurchasing={purchasingId === item.id}
                                onBuy={handleBuy}
                            />
                        </motion.div>
                    ))}
                </div>
            </AnimatePresence>

            {/* Empty State */}
            {filteredItems.length === 0 && (
                <div className="text-center py-20 px-4">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <Search className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300">{t('exchange.noResults')}</h3>
                    <p className="text-slate-400">{t('exchange.noResultsDesc')}</p>
                </div>
            )}
        </div>
    );
}
