import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import { supabase } from '@/integrations/supabase/client';
import { useItems } from '@/hooks/useItems';
import { Loader2, Store } from 'lucide-react';
import { ExchangeItemCard } from './ExchangeItemCard';
import { MascotReaction, MascotMood } from './MascotReaction';
import { useUserItems } from '@/hooks/useUserItems';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { ExchangeItem } from '@/lib/exchangeItems';

export function ExchangeTab() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { statistics: stats, refetch: refetchStats } = useDashboardStats(user?.id);
    const { data: ownedItems = [], refetch: refetchItems } = useUserItems();
    const { data: items = [], isLoading: isLoadingItems } = useItems();

    const [purchasingId, setPurchasingId] = useState<string | null>(null);
    const [mascotMood, setMascotMood] = useState<MascotMood>('idle');

    const handleBuy = async (item: ExchangeItem) => {
        if (!stats || stats.zcoin < item.price) {
            setMascotMood('poor');
            setTimeout(() => setMascotMood('idle'), 2000);
            return;
        }

        setPurchasingId(item.id);
        setMascotMood('buying');

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

                setMascotMood('success');
                await Promise.all([refetchStats(), refetchItems()]);
            } else {
                throw new Error(data?.message || 'Transaction failed');
            }
        } catch (err: any) {
            console.error('Purchase error:', err);
            setMascotMood('error');
            toast.error('Lỗi giao dịch', {
                description: err.message
            });
        } finally {
            setPurchasingId(null);
            setTimeout(() => setMascotMood('idle'), 3000);
        }
    };

    const ownedItemIds = new Set(ownedItems.map(i => i.item_id));

    if (isLoadingItems) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="relative bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-6 sm:p-10 text-white overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Store className="w-32 h-32" />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">
                            ZCoin Bazaar
                        </h2>
                        <p className="text-indigo-100 text-lg">
                            Đổi xu lấy quà - Thêm màu sắc cho QuizKen!
                        </p>
                    </div>

                    <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                        <div className="text-right">
                            <p className="text-xs uppercase tracking-wider font-bold text-indigo-200">Số dư hiện tại</p>
                            <div key={stats?.zcoin} className="text-4xl font-black text-yellow-300 drop-shadow-md">
                                {stats?.zcoin?.toLocaleString()} <span className="text-2xl">🪙</span>
                            </div>
                        </div>
                        <MascotReaction mood={mascotMood} />
                    </div>
                </div>
            </div>

            {/* Grid Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item) => (
                    <ExchangeItemCard
                        key={item.id}
                        item={item}
                        userZCoin={stats?.zcoin || 0}
                        isOwned={ownedItemIds.has(item.id)}
                        isPurchasing={purchasingId === item.id}
                        onBuy={handleBuy}
                    />
                ))}
            </div>

            {/* Coming Soon Section */}
            <div className="mt-12 text-center p-8 border-4 border-dashed border-gray-200 rounded-3xl bg-gray-50">
                <h3 className="text-xl font-bold text-gray-500">
                    🚧 Nhiều vật phẩm thú vị hơn đang được chuyển đến...
                </h3>
                <p className="text-gray-400 mt-2">
                    Hãy tích lũy thêm ZCoin trong khi chờ đợi nhé!
                </p>
            </div>
        </div>
    );
}
