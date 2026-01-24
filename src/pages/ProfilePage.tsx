import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Settings, 
  Share2, 
  Facebook, 
  Phone, 
  Info,
  Calendar,
  Shield,
  Star,
  Zap,
  Activity,
  Trophy,
  Target,
  Clock,
  MapPin,
  Sparkles as SparklesIcon
} from 'lucide-react';
import { UserProfile } from '@/components/user-profile/UserProfile';
import { useProfile } from '@/hooks/useProfile';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { SeoMeta } from '@/components/SeoMeta';
import { EditProfileDialog } from '@/components/user-profile/EditProfileDialog';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BackgroundDecorations } from '@/components/ui/BackgroundDecorations';

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color, delay = 0 }: any) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.4 }}
    className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
  >
    <div className={cn("p-3 rounded-xl", color)}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">{label}</p>
      <p className="text-xl font-black text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  </motion.div>
);

export default function ProfilePage() {
    const { t } = useTranslation();
    const { userId: paramId } = useParams();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    
    // Determine the target user ID (param or current user)
    const targetUserId = paramId || currentUser?.id;
    
    const { profileData, isLoading: profileLoading } = useProfile(targetUserId);
    const { statistics, isLoading: statsLoading } = useDashboardStats(targetUserId);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Scroll effect for header
    useEffect(() => {
      const handleScroll = () => setScrolled(window.scrollY > 20);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!targetUserId && !profileLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-4 bg-slate-50 dark:bg-slate-950">
               <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse mx-auto" />
               <h2 className="text-2xl font-bold">{t('userProfile.notLoggedIn')}</h2>
               <p className="text-muted-foreground max-w-md">{t('userProfile.notLoggedInDesc')}</p>
               <Button onClick={() => navigate('/')} size="lg" className="rounded-full px-8">{t('dashboard.goHome')}</Button>
            </div>
        );
    }

    const isOwnProfile = currentUser?.id === targetUserId;

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success(t('userProfile.shareProfile'), {
            description: t('userProfile.shareProfileDesc'),
            icon: <Share2 className="w-4 h-4 text-green-500" />
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-x-hidden font-sans pb-32">
            <SeoMeta 
                title={`${profileData?.display_name || 'Hồ sơ người dùng'} | QuizKen`}
                description={`Khám phá hồ sơ của ${profileData?.display_name} trên QuizKen - Nền tảng trắc nghiệm AI hàng đầu.`}
            />

            <BackgroundDecorations density="low" />

            {/* Immersive Hero Banner */}
            <div className="relative h-80 md:h-96 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 animate-gradient-xy"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent"></div>
                
                {/* Decorative circles in header */}
                <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-10 left-10 w-48 h-48 bg-yellow-400/20 rounded-full blur-2xl" />
            </div>

            {/* Sticky Navigation Header */}
            <header className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-4 md:px-8",
                scrolled ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shadow-sm py-3" : "bg-transparent"
            )}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate(-1)}
                        className={cn(
                            "rounded-full transition-colors flex items-center gap-2 pr-4",
                            scrolled 
                                ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200" 
                                : "bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-sm"
                        )}
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-bold">{t('userProfile.back')}</span>
                    </Button>
                    
                    <div className="flex gap-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={handleShare}
                            className={cn(
                                "rounded-full transition-colors",
                                scrolled 
                                    ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200" 
                                    : "bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-sm"
                            )}
                        >
                            <Share2 className="w-5 h-5" />
                        </Button>
                        
                        {isOwnProfile && (
                             <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setIsEditOpen(true)}
                                className={cn(
                                    "rounded-full transition-colors",
                                    scrolled 
                                        ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200" 
                                        : "bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-sm"
                                )}
                            >
                                <Settings className="w-5 h-5" />
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-5xl mx-auto px-4 -mt-32 md:-mt-44 mb-20 space-y-8">
                {/* Profile Card at Top */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
                    className="w-full relative group"
                >
                    <UserProfile 
                        user={{ id: targetUserId } as any}
                        statistics={statistics}
                        isLoading={profileLoading || statsLoading}
                        isEditable={isOwnProfile}
                        streak={0}
                        hideStats={true}
                        layout="horizontal"
                        className="shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-none border-4 border-white dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl"
                    />
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="space-y-6">
                        <motion.div 
                             initial={{ opacity: 0, scale: 0.8 }}
                             animate={{ opacity: 1, scale: 1 }}
                             transition={{ delay: 0.4 }}
                             className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-[2rem] p-6 text-white text-center shadow-lg relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                <Trophy className="w-16 h-16 rotate-12" />
                            </div>
                            <h3 className="text-lg font-bold uppercase tracking-wider mb-1 opacity-90">{t('userProfile.currentRank')}</h3>
                            <div className="text-3xl font-black flex items-center justify-center gap-2">
                                <Star className="w-8 h-8 fill-white" />
                                <span>{t('userProfile.rankName')}</span>
                            </div>
                            <p className="text-sm mt-2 opacity-90 font-medium">{t('userProfile.rankBadgeDesc')}</p>
                        </motion.div>

                        <div className="grid grid-cols-1 gap-4 text-slate-600 dark:text-slate-300">
                             <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase text-slate-400 mb-1">{t('userProfile.joinedDate')}</p>
                                    <p className="text-sm font-bold flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        {profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString('vi-VN') : t('userProfile.justJoined')}
                                    </p>
                                </div>
                                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
                                    <Clock className="w-5 h-5 text-slate-500" />
                                </div>
                             </div>
                             <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase text-slate-400 mb-1">{t('userProfile.region')}</p>
                                    <p className="text-sm font-bold flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-red-400" />
                                        Vietnam
                                    </p>
                                </div>
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full">
                                    <MapPin className="w-5 h-5 text-red-500" />
                                </div>
                             </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-8 min-w-0">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard 
                                icon={Target} 
                                label={t('userProfile.statsCreated')} 
                                value={statistics?.total_quizzes_created || 0} 
                                color="bg-blue-500" 
                                delay={0.1} 
                            />
                            <StatCard 
                                icon={Activity} 
                                label={t('userProfile.statsAttempted')} 
                                value={statistics?.total_quizzes_taken || 0} 
                                color="bg-indigo-500" 
                                delay={0.2} 
                            />
                            <StatCard 
                                icon={Trophy} 
                                label={t('userProfile.statsHighest')} 
                                value={statistics?.highest_score || 0} 
                                color="bg-amber-500" 
                                delay={0.3} 
                            />
                             <StatCard 
                                icon={Zap} 
                                label={t('userProfile.zcoin')} 
                                value={statistics?.zcoin?.toLocaleString() || 0} 
                                color="bg-yellow-500" 
                                delay={0.4} 
                            />
                        </div>

                        {/* "About Me" Section */}
                        <motion.section 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2rem] p-8 border border-white dark:border-slate-800 shadow-lg relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
                            
                            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-3 relative z-10">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                    <Info className="w-6 h-6" />
                                </div>
                                {t('userProfile.aboutMe')}
                            </h3>
                            
                            <div className="space-y-8 relative z-10">
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Badge variant="outline" className="rounded-full px-3 py-1 border-indigo-200 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300">
                                            {t('userProfile.bioTitle')}
                                        </Badge>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-inner">
                                        {profileData?.bio ? (
                                            <>
                                                <span className="text-2xl text-indigo-300 font-serif mr-2">"</span>
                                                {profileData.bio}
                                                <span className="text-2xl text-indigo-300 font-serif ml-2">"</span>
                                            </>
                                        ) : (
                                            <span className="italic text-slate-400 flex items-center justify-center p-4">
                                                "{t('userProfile.bioEmpty')}"
                                            </span>
                                        )}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Share2 className="w-3 h-3" /> {t('userProfile.connect')}
                                        </h4>
                                        <div className="space-y-3">
                                            {profileData?.facebook_url ? (
                                                <a 
                                                    href={profileData.facebook_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                                                >
                                                     <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
                                                        <Facebook className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-muted-foreground uppercase">Facebook</span>
                                                        <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{t('userProfile.connect')}</span>
                                                    </div>
                                                </a>
                                            ) : (
                                                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border-2 border-transparent border-dashed border-slate-200 dark:border-slate-700 opacity-70">
                                                    <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-400">
                                                        <Facebook className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-500">{t('userProfile.notLinked')}</span>
                                                </div>
                                            )}

                                            {profileData?.zalo_url ? (
                                                <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-cyan-200 dark:hover:border-cyan-900 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all group cursor-default">
                                                    <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-full text-cyan-600 group-hover:scale-110 transition-transform">
                                                        <Phone className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-muted-foreground uppercase">Zalo</span>
                                                        <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400">{profileData.zalo_url}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                 <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border-2 border-transparent border-dashed border-slate-200 dark:border-slate-700 opacity-70">
                                                    <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-400">
                                                        <Phone className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-500">{t('userProfile.notLinked')}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <SparklesIcon className="w-3 h-3" /> {t('userProfile.achievements')}
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-xl flex flex-col items-center justify-center text-center gap-1">
                                                <Shield className="w-6 h-6 text-yellow-500 fill-yellow-500/20" />
                                                <span className="text-[10px] font-black uppercase text-yellow-700 dark:text-yellow-400">{t('userProfile.newbie')}</span>
                                            </div>
                                            <div className="p-3 bg-purple-400/10 border border-purple-400/20 rounded-xl flex flex-col items-center justify-center text-center gap-1">
                                                <Star className="w-6 h-6 text-purple-500 fill-purple-500/20" />
                                                <span className="text-[10px] font-black uppercase text-purple-700 dark:text-purple-400">{t('userProfile.top100')}</span>
                                            </div>
                                            <div className="p-3 bg-green-400/10 border border-green-400/20 rounded-xl flex flex-col items-center justify-center text-center gap-1 opacity-50 grayscale">
                                                <Trophy className="w-6 h-6 text-green-500" />
                                                <span className="text-[10px] font-black uppercase text-slate-500">...</span>
                                            </div>
                                             <div className="p-3 bg-pink-400/10 border border-pink-400/20 rounded-xl flex flex-col items-center justify-center text-center gap-1 opacity-50 grayscale">
                                                <Zap className="w-6 h-6 text-pink-500" />
                                                <span className="text-[10px] font-black uppercase text-slate-500">...</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        </div>
                    </div>
            </main>

            {/* Edit Dialog */}
            {currentUser && targetUserId === currentUser.id && (
                <EditProfileDialog 
                    open={isEditOpen}
                    onOpenChange={setIsEditOpen}
                    user={currentUser}
                />
            )}
        </div>
    );
}
