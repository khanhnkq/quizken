import React from 'react';
import { motion } from 'framer-motion';
import { ExchangeItem } from '@/lib/exchangeItems';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface ExchangeItemCardProps {
    item: ExchangeItem;
    userZCoin: number;
    isOwned: boolean;
    isPurchasing: boolean;
    onBuy: (item: ExchangeItem) => void;
}

export function ExchangeItemCard({ item, userZCoin, isOwned, isPurchasing, onBuy }: ExchangeItemCardProps) {
    const canAfford = userZCoin >= item.price;

    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={!isOwned && canAfford ? { scale: 0.98 } : {}}
            className={`relative flex flex-col p-4 rounded-3xl border-4 ${item.color} shadow-lg transition-all h-full bg-white bg-opacity-90`}
        >
            <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary" className="bg-white/50 backdrop-blur-sm">
                    {item.type.toUpperCase()}
                </Badge>
                {isOwned && (
                    <Badge className="bg-green-500 text-white animate-pulse">
                        OWNED
                    </Badge>
                )}
            </div>

            <div className="flex-1 flex flex-col items-center text-center space-y-2 py-4">
                <div className="text-6xl mb-2 filter drop-shadow-md transition-transform hover:scale-110 duration-200 cursor-default">
                    {item.icon}
                </div>
                <h3 className="font-bold text-lg text-slate-800 leading-tight">
                    {item.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2">
                    {item.description}
                </p>
            </div>

            <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                <Button
                    onClick={() => onBuy(item)}
                    disabled={isOwned || isPurchasing || (!canAfford && !isOwned)}
                    className={`w-full rounded-2xl font-bold text-md shadow-sm transition-all
            ${isOwned
                            ? 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-default hover:bg-gray-100'
                            : canAfford
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white border-b-4 border-orange-600 active:border-b-0 active:translate-y-1'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }
          `}
                >
                    {isPurchasing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isOwned ? (
                        "Đã sở hữu"
                    ) : (
                        <>
                            <span className="mr-1">💰</span>
                            {item.price}
                        </>
                    )}
                </Button>

                {!canAfford && !isOwned && (
                    <p className="text-[10px] text-red-400 text-center mt-2 font-medium">
                        Thiếu {item.price - userZCoin} ZCoin
                    </p>
                )}
            </div>
        </motion.div>
    );
}
