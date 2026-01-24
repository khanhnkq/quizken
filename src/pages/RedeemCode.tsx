import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Loader2, Sparkles, Ticket, Zap, Trophy, Crown, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useAuth } from '@/lib/auth';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

interface RedeemCodeProps {
    isEmbedded?: boolean;
}

export default function RedeemCode({ isEmbedded = false }: RedeemCodeProps) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { refetch } = useDashboardStats(user?.id);
    
    // ... state ...
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{success: boolean, message: string} | null>(null);

    const handleRedeem = async (e: React.FormEvent) => {
        // ... (keep logical code same)
        e.preventDefault();
        
        if (!code.trim()) {
            toast.error("Vui lòng nhập mã code");
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            const { data, error } = await (supabase as any).rpc('redeem_voucher', {
                p_code: code.trim().toUpperCase()
            });

            if (error) throw error;

            if (data.success) {
                setResult({ success: true, message: data.message });
                toast.success("Đổi quà thành công!");
                
                // Fire massive confetti
                const duration = 3000;
                const end = Date.now() + duration;

                (function frame() {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#FFD700', '#FFA500', '#FF4500']
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#00FFFF', '#1E90FF', '#4B0082']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
                }());

                // Refresh stats (zcoin)
                refetch();
                setCode('');
            } else {
                setResult({ success: false, message: data.message });
                toast.error(data.message);
            }

        } catch (err: any) {
            console.error(err);
            setResult({ success: false, message: "Có lỗi xảy ra, vui lòng thử lại." });
            toast.error("Lỗi hệ thống");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 dark:bg-slate-950 ${isEmbedded ? 'min-h-[600px] rounded-3xl border border-slate-200 dark:border-slate-800' : 'min-h-screen'}`}>
             
             {/* Background Layers... */}
             <div className="absolute inset-0 w-full h-full">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200/50 dark:bg-purple-600/30 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-200/50 dark:bg-indigo-600/30 rounded-full blur-[100px] animate-pulse delay-1000"></div>
                
                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
             </div>

             {/* Navigation Buttons */}
             {!isEmbedded && (
                 <div className="absolute top-6 left-6 z-50 flex gap-4">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate(-1)}
                        className="group bg-white/50 dark:bg-slate-900/50 backdrop-blur hover:bg-white/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-200 group-hover:-translate-x-1 transition-transform" />
                    </Button>
                 </div>
             )}
             <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
                className="relative z-10 w-full max-w-xl"
            >
                {/* Main Card Container */}
                <div className="relative">
                    {/* Glowing effect behind card */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 via-purple-300 to-indigo-300 dark:from-yellow-400 dark:via-purple-500 dark:to-indigo-500 rounded-[2.5rem] blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                    
                    <div className="relative bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-white/50 dark:border-slate-800 rounded-[2rem] p-8 md:p-12 shadow-2xl overflow-hidden">
                        
                        {/* Decorative Header Elements */}
                        <div className="absolute top-0 left-0 p-4">
                            <Sparkles className="w-8 h-8 text-yellow-400 animate-spin-slow opacity-50" />
                        </div>
                        <div className="absolute top-0 right-0 p-4">
                            <Zap className="w-8 h-8 text-cyan-400 animate-pulse opacity-50" />
                        </div>

                        {/* Content */}
                        <div className="flex flex-col items-center text-center space-y-8">
                            
                            {/* Icon / Mascot Area */}
                            <motion.div 
                                className="relative"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: "spring" }}
                            >
                                <div className="absolute inset-0 bg-indigo-300 dark:bg-indigo-500 blur-2xl opacity-40 rounded-full"></div>
                                <div className="relative w-28 h-28 bg-gradient-to-b from-white to-slate-100 dark:from-indigo-500 dark:to-purple-600 rounded-3xl flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-800 transform -rotate-6">
                                    <Gift className="w-14 h-14 text-indigo-600 dark:text-white drop-shadow-md" />
                                    {/* Floating badges */}
                                    <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 p-2 rounded-full border-4 border-white dark:border-slate-900 shadow-md">
                                        <Crown className="w-5 h-5" />
                                    </div>
                                </div>
                            </motion.div>

                            <div className="space-y-2">
                                <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-indigo-400 tracking-tight">
                                    GIFTCODE
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">
                                    {t('dashboard.tabs.giftcode_desc', 'Nhập mã để nhận thưởng giới hạn')}
                                </p>
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleRedeem} className="w-full space-y-6">
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-400 to-purple-400 dark:from-pink-600 dark:to-purple-600 rounded-2xl opacity-50 group-hover:opacity-100 transition duration-200 blur pointer-events-none"></div>
                                    <Input
                                        placeholder="CODE..."
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="relative z-10 w-full h-20 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-center text-3xl font-black text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:border-purple-500 focus:ring-0 transition-all uppercase tracking-[0.3em] shadow-inner"
                                        disabled={isLoading}
                                    />
                                    {code && !isLoading && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                                            <span className="flex h-3 w-3">
                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <Button 
                                    type="submit"
                                    disabled={isLoading || !code}
                                    className="w-full h-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white font-bold text-xl rounded-xl shadow-[0_4px_0_rgb(60,20,100)] dark:shadow-[0_4px_0_rgb(60,20,100)] active:shadow-none active:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider relative overflow-hidden group/btn"
                                >
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer"></div>
                                    <span className="flex items-center gap-3 relative z-10">
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Ticket className="w-6 h-6" />
                                                {t('actions.redeem', 'Đổi Quà Ngay')}
                                            </>
                                        )}
                                    </span>
                                </Button>
                            </form>
                            
                        </div>
                        
                        {/* Result Overlay / Animation Container */}
                        <AnimatePresence>
                            {result && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className={`absolute inset-0 z-50 flex items-center justify-center p-8 backdrop-blur-md bg-white/50 dark:bg-slate-900/80 rounded-[2rem]`}
                                >
                                    <div className={`
                                        p-6 rounded-3xl border-4 text-center shadow-2xl transform w-full max-w-sm
                                        ${result.success 
                                            ? 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/90 dark:to-emerald-900/90 border-green-200 dark:border-green-400 text-green-800 dark:text-green-100' 
                                            : 'bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/90 dark:to-rose-900/90 border-red-200 dark:border-red-400 text-red-800 dark:text-red-100'}
                                    `}>
                                        <div className="mb-4 flex justify-center">
                                            {result.success ? (
                                                <div className="p-3 bg-green-500 rounded-full animate-bounce">
                                                    <Trophy className="w-8 h-8 text-white" />
                                                </div>
                                            ) : (
                                                <div className="p-3 bg-red-500 rounded-full animate-shake">
                                                    <Zap className="w-8 h-8 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-2xl font-black mb-2 uppercase">
                                            {result.success ? 'Thành Công!' : 'Thất Bại!'}
                                        </h3>
                                        <p className="font-medium opacity-90 break-words">{result.message}</p>
                                        <Button 
                                            onClick={() => setResult(null)}
                                            className="mt-6 w-full bg-slate-900/10 dark:bg-white/20 hover:bg-slate-900/20 dark:hover:bg-white/30 text-current border-0"
                                        >
                                            {result.success ? 'Tuyệt vời' : 'Thử lại'}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </div>
                </div>

                <div className="mt-8 flex justify-center gap-4 text-slate-400 dark:text-slate-500 text-sm font-semibold">
                    <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Exclusive Rewards
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-2">
                        <Zap className="w-4 h-4" /> Instant Delivery
                    </span>
                </div>

             </motion.div>
        </div>
    );
}
