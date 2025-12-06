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
            toast.error(t('Không đủ ZCoin'), {
                description: 'Bạn cần tích thêm ZCoin nhé!',
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

                toast.success(`Đã mua thành công ${item.name}!`, {
                    description: "Kiểm tra kho đồ của bạn nhé.",
                    icon: "🎉"
                });

                await Promise.all([refetchStats(), refetchItems()]);
            } else {
                throw new Error(data?.message || 'Transaction failed');
            }
        } catch (err: any) {
            console.error('Purchase error:', err);
            toast.error('Lỗi giao dịch', {
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
        { id: 'all', label: 'Tất cả', icon: Store, color: 'bg-violet-100 text-violet-600' },
        { id: 'avatar', label: 'Avatar', icon: Shirt, color: 'bg-blue-100 text-blue-600' },
        { id: 'theme', label: 'Theme', icon: Palette, color: 'bg-pink-100 text-pink-600' },
        { id: 'powerup', label: 'Power-up', icon: Zap, color: 'bg-amber-100 text-amber-600' },
        { id: 'document', label: 'Tài liệu', icon: FileText, color: 'bg-emerald-100 text-emerald-600' },
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
            {/* Top Header Row - Symmetric like Dashboard */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Title Section */}
                <div className="text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 font-bold text-sm mb-3 shadow-sm border border-violet-200">
                        <Sparkles className="w-4 h-4" />
                        <span>Cửa hàng phép thuật</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight drop-shadow-sm mb-2"
                        style={{ fontFamily: '"Nunito", "Quicksand", sans-serif' }}>
                        ZCoin Bazaar
                    </h2>
                    <p className="text-slate-500 text-lg font-medium">
                        Biến coin thành niềm vui! 🛍️
                    </p>
                </div>

                {/* Wallet Badge - High Visibility */}
                <div className="flex flex-col items-center md:items-end">
                    <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-3xl border-2 border-orange-100 shadow-xl flex items-center gap-4 hover:scale-105 transition-transform duration-300">
                        <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center shadow-md border-4 border-white">
                                <Wallet className="w-8 h-8 text-white drop-shadow-sm" />
                            </div>
                            <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-yellow-500 animate-pulse" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ví ZCoin</span>
                            <span className="text-4xl font-black text-slate-700 tabular-nums leading-none">
                                {stats?.zcoin?.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>



            {/* Filter & Search Bar */}
            <div className="sticky top-4 z-30 bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">

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
                                    : 'bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100'}
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
                        placeholder="Tìm vật phẩm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white transition-all shadow-inner"
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
                    <h3 className="text-xl font-bold text-slate-600">Không tìm thấy món đồ nào</h3>
                    <p className="text-slate-400">Thử tìm từ khóa khác xem sao nhé!</p>
                </div>
            )}
        </div>
    );
}
