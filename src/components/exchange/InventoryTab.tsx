import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUserItems } from '@/hooks/useUserItems';
import { useItems } from '@/hooks/useItems';
import { Loader2, PackageOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export function InventoryTab() {
    const { t, i18n } = useTranslation();
    const { data: ownedItems = [], isLoading: isLoadingOwned } = useUserItems();
    const { data: allItems = [], isLoading: isLoadingItems } = useItems();

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
                type: owned.item_type,
                color: 'bg-gray-100',
                description: 'Item data not found'
            }
        };
    });

    if (isLoadingOwned || isLoadingItems) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (ownedItems.length === 0) {
        return (
            <div className="text-center py-16 px-4 bg-gray-50 rounded-3xl border-4 border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PackageOpen className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-500 mb-2">
                    {t('inventory.empty.title')}
                </h3>
                <p className="text-gray-400 max-w-md mx-auto">
                    {t('inventory.empty.description')}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {detailedItems.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card className={`overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 ${item.details.color ? item.details.color.replace('bg-', 'bg-opacity-20 bg-') : ''}`}>
                            <CardHeader className={`p-6 flex flex-col items-center justify-center ${item.details.color || 'bg-gray-50'}`}>
                                <div className="text-6xl mb-2 drop-shadow-sm filter">
                                    {item.details.icon}
                                </div>
                                <Badge variant="secondary" className="uppercase text-xs font-bold tracking-wider opacity-80">
                                    {item.item_type}
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-5">
                                <CardTitle className="text-lg font-bold text-center mb-2 line-clamp-1">
                                    {item.details.name}
                                </CardTitle>
                                <p className="text-sm text-center text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                                    {item.details.description}
                                </p>

                                <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-center text-gray-400">
                                    {t('inventory.item.owned')} • {new Date(item.purchased_at).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'vi-VN')}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
