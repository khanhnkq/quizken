import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ExchangeItem } from '@/lib/exchangeItems';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Coins, Check, Lock } from 'lucide-react';

interface ExchangeItemCardProps {
    item: ExchangeItem;
    userZCoin: number;
    isOwned: boolean;
    isPurchasing: boolean;
    onBuy: (item: ExchangeItem) => void;
}

export function ExchangeItemCard({ item, userZCoin, isOwned, isPurchasing, onBuy }: ExchangeItemCardProps) {
    const { t } = useTranslation();
    const canAfford = userZCoin >= item.price;
    const isAffordable = !isOwned && canAfford;

    return (
        <motion.div
            layout
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`
                group relative flex flex-col p-1 rounded-[2rem] transition-all h-full
                ${isOwned ? 'opacity-80' : ''}
            `}
        >
            {/* Claymorphism Card Body */}
            <div className={`
                relative flex flex-col h-full rounded-[1.8rem] p-5
                bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800
                shadow-[0_10px_20px_rgba(0,0,0,0.05),inset_0_-5px_0_rgba(0,0,0,0.02)]
                hover:shadow-[0_20px_40px_rgba(0,0,0,0.1),inset_0_-5px_0_rgba(0,0,0,0.02)]
                hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-300
            `}>

                {/* Type Badge */}
                <div className="absolute top-4 left-4 z-10">
                    <div className={`
                        px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm
                        ${item.type === 'avatar' ? 'bg-blue-100 text-blue-600' :
                            item.type === 'theme' ? 'bg-pink-100 text-pink-600' :
                                item.type === 'powerup' ? 'bg-amber-100 text-amber-600' :
                                    'bg-emerald-100 text-emerald-600'}
                   `}>
                        {t(`exchange.filter.${item.type}`)}
                    </div>
                </div>

                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-10">
                    {isOwned ? (
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-sm">
                            <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                    ) : !canAfford ? (
                        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-sm" title={t('exchange.noZCoin')}>
                            <Lock className="w-4 h-4 stroke-[3]" />
                        </div>
                    ) : null}
                </div>

                {/* Item Icon/Image */}
                <div className="flex-1 flex flex-col items-center justify-center py-6">
                    <div className="relative group-hover:scale-110 transition-transform duration-300 ease-out">
                        {/* Glow effect behind */}
                        <div className={`absolute inset-0 bg-gradient-to-tr ${item.color.replace('border-', 'from-').replace('bg-', 'to-')} opacity-20 blur-xl rounded-full`}></div>

                        {item.image_url ? (
                            <img
                                src={item.image_url}
                                alt={item.name}
                                className="relative w-24 h-24 object-cover rounded-2xl shadow-lg border-4 border-white dark:border-slate-700 transform rotate-3 hover:rotate-6 transition-all"
                            />
                        ) : (
                            <div className="relative text-7xl filter drop-shadow-xl transform -rotate-3 hover:rotate-0 transition-all cursor-default">
                                {item.icon}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="text-center space-y-3 mb-4">
                    <h3 className="font-extrabold text-xl text-slate-800 dark:text-white leading-tight">
                        {item.name}
                    </h3>
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500 line-clamp-2 min-h-[2.5em] px-2">
                        {item.description}
                    </p>
                </div>

                {/* Action Button */}
                <div className="mt-auto">
                    <Button
                        onClick={() => onBuy(item)}
                        disabled={isOwned || isPurchasing || (!canAfford && !isOwned)}
                        className={`
                            relative w-full rounded-2xl h-12 font-bold text-sm tracking-wide shadow-md transition-all duration-200
                            ${isOwned
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-none border border-slate-200 dark:border-slate-700'
                                : canAfford
                                    ? 'bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white shadow-violet-200 hover:shadow-violet-300 hover:-translate-y-1 active:translate-y-0'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 opacity-70 hover:bg-slate-200 dark:hover:bg-slate-800'
                            }
                        `}
                    >
                        {isPurchasing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isOwned ? (
                            t('exchange.owned')
                        ) : (
                            <div className="flex items-center gap-1.5">
                                <span className={canAfford ? 'text-violet-100' : 'text-slate-500 dark:text-slate-400'}>{t('exchange.buyWith')}</span>
                                <span className="text-lg">{item.price}</span>
                                <Coins className={`w-4 h-4 ${canAfford ? 'text-yellow-300 fill-yellow-300' : 'text-slate-500 dark:text-slate-400'}`} />
                            </div>
                        )}
                    </Button>
                </div>
            </div>

            {/* Background Layer for depth */}
            <div className={`absolute inset-0 rounded-[2rem] transform translate-y-2 translate-x-0 bg-slate-200 dark:bg-slate-800 -z-10`}></div>
        </motion.div>
    );
}
