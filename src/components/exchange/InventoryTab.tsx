import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUserItems } from '@/hooks/useUserItems';
import { useItems } from '@/hooks/useItems';
import { Loader2, PackageOpen, Download, Package, Sparkles, Search, Shirt, Palette, Zap, FileText, Check, Calendar, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

type FilterType = 'all' | 'avatar' | 'theme' | 'powerup' | 'document';

export function InventoryTab() {
    const { t, i18n } = useTranslation();
    const { data: ownedItems = [], isLoading: isLoadingOwned } = useUserItems();
    const { data: allItems = [], isLoading: isLoadingItems } = useItems();

    const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Map owned item IDs to full item details from useItems hook
    const detailedItems = ownedItems.map(owned => {
        const details = allItems.find(i => i.id === owned.item_id);
        return {
            ...owned,
            details: details || {
                name: 'Unknown Item',
                id: 'unknown',
                price: 0,
                icon: '❓',
                type: owned.item_type as 'theme' | 'avatar' | 'powerup' | 'document',
                color: 'bg-gray-100',
                description: 'Item data not found',
                download_url: null,
                image_url: null
            }
        };
    });

    // Filter items logic
    const filteredItems = detailedItems.filter(item => {
        const matchesFilter = selectedFilter === 'all' || item.item_type === selectedFilter;
        const matchesSearch = item.details.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const categories = [
        { id: 'all', label: t('exchange.filter.all'), icon: Package, color: 'bg-teal-100 text-teal-600' },
        { id: 'avatar', label: t('exchange.filter.avatar'), icon: Shirt, color: 'bg-blue-100 text-blue-600' },
        { id: 'theme', label: t('exchange.filter.theme'), icon: Palette, color: 'bg-pink-100 text-pink-600' },
        { id: 'powerup', label: t('exchange.filter.powerup'), icon: Zap, color: 'bg-amber-100 text-amber-600' },
        { id: 'document', label: t('exchange.filter.document'), icon: FileText, color: 'bg-emerald-100 text-emerald-600' },
    ];

    const { user } = useAuth();
    const { profileData, refetch: refetchProfile } = useProfile(user?.id);

    const handleEquip = async (item: any) => {
        const isTheme = item.details.type === 'theme';
        const isAvatar = item.details.type === 'avatar';
        
        console.log("Attempting to equip/unequip:", item.details.name, "Type:", item.details.type);

        const isEquipped = (isTheme && profileData?.equipped_theme === item.item_id) ||
                           (isAvatar && profileData?.equipped_avatar_frame === item.item_id);

        console.log("Current status - Equipped:", isEquipped);
        console.log("Profile Data:", profileData);

        try {
            const updateData: any = {};
            
            // Logic Toggle: If equipped -> unequip (null), else equip
            if (isEquipped) {
                 if (isTheme) updateData.equipped_theme = null;
                 if (isAvatar) updateData.equipped_avatar_frame = null;
            } else {
                 if (isTheme) updateData.equipped_theme = item.item_id;
                 if (isAvatar) updateData.equipped_avatar_frame = item.item_id;
            }

            console.log("Update Payload:", updateData);

            if (Object.keys(updateData).length === 0) {
                console.warn("No fields to update! Check item type.");
                toast.error("Không thể xác định loại vật phẩm.");
                return;
            }

            const { error } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', user?.id);

            if (error) {
                console.error("Supabase update error:", error);
                throw error;
            }

            if (isEquipped) {
                toast.info(t('inventory.unequipped', 'Đã gỡ bỏ trang bị.'));
            } else {
                toast.success(t('inventory.equipSuccess', 'Đã thay đổi thành công!'));
            }
            
            // Force immediate refetch
            await refetchProfile();
            console.log("Profile refetched.");

        } catch (error) {
            console.error('Error equipping item:', error);
            toast.error(t('inventory.equipError', 'Lỗi khi thay đổi trang bị.'));
        }
    };

    const handleDownload = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    if (isLoadingOwned || isLoadingItems) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header - Matching Dashboard Style */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6">
                <div className="text-center md:text-left space-y-2">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-teal-400 dark:border-teal-600 text-teal-600 dark:text-teal-400 font-bold text-sm shadow-sm animate-fade-in">
                        <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span>{t('inventory.badge')}</span>
                    </div>

                    {/* Title with SVG underline */}
                    <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground dark:text-white drop-shadow-sm">
                        {t('inventory.welcomeTitle')}
                        <span className="inline-block animate-wave ml-2 origin-[70%_70%]">🎒</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg text-muted-foreground dark:text-gray-400 font-medium max-w-lg">
                        {t('inventory.subtitle')}
                    </p>
                </div>

                {/* Item Count Badge - Matching Wallet style */}
                <div className="group">
                    <div className="relative bg-gradient-to-br from-teal-500 to-emerald-600 px-8 py-5 rounded-3xl shadow-xl border-4 border-teal-400/50 flex items-center gap-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-default">
                        <div className="absolute inset-0 bg-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="relative">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-sm group-hover:rotate-12 transition-transform duration-300">
                                <Package className="w-9 h-9 text-white drop-shadow-md" />
                            </div>
                            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300 animate-pulse drop-shadow-md" />
                        </div>

                        <div className="flex flex-col relative z-10">
                            <span className="text-xs font-bold text-white/70 uppercase tracking-wider">{t('inventory.itemCount')}</span>
                            <span className="text-4xl font-black text-white tabular-nums leading-none drop-shadow-sm">
                                {ownedItems.length}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar - Matching Shop Style */}
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

            {/* Items Grid - Matching Shop Style */}
            <AnimatePresence mode="popLayout">
                {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="group relative flex flex-col p-1 rounded-[2rem] transition-all h-full"
                            >
                                {/* Card Body - Claymorphism matching Shop */}
                                <div className="relative flex flex-col h-full rounded-[1.8rem] p-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 shadow-[0_10px_20px_rgba(0,0,0,0.05),inset_0_-5px_0_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1),inset_0_-5px_0_rgba(0,0,0,0.02)] hover:border-teal-200 dark:hover:border-teal-800 transition-all duration-300">

                                    {/* Type Badge */}
                                    <div className="absolute top-4 left-4 z-10">
                                        <div className={`
                                            px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm
                                            ${item.item_type === 'avatar' ? 'bg-blue-100 text-blue-600' :
                                                item.item_type === 'theme' ? 'bg-pink-100 text-pink-600' :
                                                    item.item_type === 'powerup' ? 'bg-amber-100 text-amber-600' :
                                                        'bg-emerald-100 text-emerald-600'}
                                        `}>
                                            {t(`exchange.filter.${item.item_type}`)}
                                        </div>
                                    </div>

                                    {/* Owned Badge */}
                                    <div className="absolute top-4 right-4 z-10">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-sm">
                                            <Check className="w-4 h-4 stroke-[3]" />
                                        </div>
                                    </div>

                                    {/* Item Icon/Image */}
                                    <div className="flex-1 flex flex-col items-center justify-center py-6">
                                        <div className="relative group-hover:scale-110 transition-transform duration-300 ease-out">
                                            {/* Glow effect behind */}
                                            <div className={`absolute inset-0 bg-gradient-to-tr from-teal-200 to-emerald-200 opacity-20 blur-xl rounded-full`}></div>

                                            {item.details.image_url ? (
                                                <img
                                                    src={item.details.image_url}
                                                    alt={item.details.name}
                                                    className="relative w-24 h-24 object-cover rounded-2xl shadow-lg border-4 border-white dark:border-slate-700 transform rotate-3 hover:rotate-6 transition-all"
                                                />
                                            ) : (
                                                <div className="relative text-7xl filter drop-shadow-xl transform -rotate-3 hover:rotate-0 transition-all cursor-default">
                                                    {item.details.icon}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="text-center space-y-3 mb-4">
                                        <h3 className="font-extrabold text-xl text-slate-800 dark:text-white leading-tight">
                                            {item.details.name}
                                        </h3>
                                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 line-clamp-2 min-h-[2.5em] px-2">
                                            {item.details.description}
                                        </p>
                                    </div>

                                    {/* Action Area */}
                                    <div className="mt-auto space-y-3">
                                        {/* Equip/Use Buttons */}
                                        {(item.details.type === 'theme' || item.details.type === 'avatar') && (
                                            <Button
                                                onClick={() => handleEquip(item)}
                                                // Remove disabled prop to allow un-equipping
                                                variant={(
                                                    (item.details.type === 'theme' && profileData?.equipped_theme === item.item_id) ||
                                                    (item.details.type === 'avatar' && profileData?.equipped_avatar_frame === item.item_id)
                                                ) ? "outline" : "default"}
                                                className={`w-full rounded-2xl h-12 font-bold text-sm transition-all
                                                    ${((item.details.type === 'theme' && profileData?.equipped_theme === item.item_id) ||
                                                       (item.details.type === 'avatar' && profileData?.equipped_avatar_frame === item.item_id))
                                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 border border-slate-200 dark:border-slate-700'
                                                        : 'bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white shadow-violet-200 hover:shadow-violet-300 hover:-translate-y-1 active:translate-y-0'
                                                    }
                                                `}
                                            >
                                                {((item.details.type === 'theme' && profileData?.equipped_theme === item.item_id) ||
                                                  (item.details.type === 'avatar' && profileData?.equipped_avatar_frame === item.item_id)) ? (
                                                    <span className="flex items-center group-hover:hidden">
                                                        <Check className="w-4 h-4 mr-2" />
                                                        {t('inventory.equipped', 'Đang sử dụng')}
                                                    </span>
                                                ) : (
                                                    <>
                                                        <Power className="w-4 h-4 mr-2" />
                                                        {t('inventory.equip', 'Sử dụng')}
                                                    </>
                                                )}
                                                
                                                {/* Hover Text for Unequip */}
                                                {((item.details.type === 'theme' && profileData?.equipped_theme === item.item_id) ||
                                                  (item.details.type === 'avatar' && profileData?.equipped_avatar_frame === item.item_id)) && (
                                                    <span className="hidden group-hover:flex items-center text-red-500">
                                                        <Power className="w-4 h-4 mr-2" />
                                                        {t('inventory.unequip', 'Gỡ bỏ')}
                                                    </span>
                                                )}
                                            </Button>
                                        )}

                                        {/* Download Button for Document Items */}
                                        {item.details.type === 'document' && item.details.download_url && (
                                            <Button
                                                onClick={() => handleDownload(item.details.download_url!)}
                                                className="w-full rounded-2xl h-12 font-bold text-sm bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-1 active:translate-y-0 transition-all"
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                {t('inventory.download')}
                                            </Button>
                                        )}

                                        {/* Owned Status & Date */}
                                        <div className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>
                                                {t('inventory.item.owned')} • {new Date(item.purchased_at).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'vi-VN')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Background Layer for depth */}
                                <div className="absolute inset-0 rounded-[2rem] transform translate-y-2 translate-x-0 bg-slate-200 dark:bg-slate-800 -z-10"></div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 px-4">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            {ownedItems.length === 0 ? (
                                <PackageOpen className="w-10 h-10 text-slate-300" />
                            ) : (
                                <Search className="w-10 h-10 text-slate-300" />
                            )}
                        </div>
                        <h3 className="text-xl font-bold text-slate-600 dark:text-gray-300">
                            {ownedItems.length === 0 ? t('inventory.empty.title') : t('inventory.noResults')}
                        </h3>
                        <p className="text-slate-400">
                            {ownedItems.length === 0 ? t('inventory.empty.description') : t('inventory.noResultsDesc')}
                        </p>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
