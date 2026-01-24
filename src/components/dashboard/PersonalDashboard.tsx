import { useState, useEffect, type MouseEvent, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatisticsCards } from "./StatisticsCards";
import { ProgressTrendline } from "./ProgressTrendline";
import { CreatedQuizzes } from "./CreatedQuizzes";
import { RecentQuizzes } from "./RecentQuizzes";
import { UserProfile } from "../user-profile/UserProfile";
import { EnglishStatsCard } from "./EnglishStatsCard";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useProgressTrend } from "@/hooks/useProgressTrend";
import { useRecentQuizzes } from "@/hooks/useRecentQuizzes";
import { useCreatedQuizzes } from "@/hooks/useCreatedQuizzes";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { clearQuizProgress } from "@/hooks/useQuizProgress";
import {
  BarChart3Icon,
  PlusCircleIcon,
  UserIcon,
  Sparkles,
  ChevronLeftIcon,
  LayoutDashboard,
  Store,
  Package,
  Settings,
  LogOut,
  BookOpen,
  BookOpenIcon,
  ArrowRight,
  Gift,
  Facebook,
  Phone,
  Info,
  Calendar,
  Shield,
  Star,
  Zap,
  Trophy,
  MapPin,
  Clock,
} from "lucide-react";
import { BackgroundDecorations } from "@/components/ui/BackgroundDecorations";
import { gsap } from "gsap";
import { shouldReduceAnimations } from "@/utils/deviceDetection";
import { useNavigate, useSearchParams } from "react-router-dom";
import { killActiveScroll, scrollToTarget } from "@/lib/scroll";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import { useLevelNotification } from "@/hooks/useLevelNotification";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExchangeTab } from "@/components/exchange/ExchangeTab";
import { InventoryTab } from "@/components/exchange/InventoryTab";
import { GachaSystem } from "@/components/exchange/gacha/GachaSystem";
import ApiKeySettings from "@/components/ApiKeySettings";

interface PersonalDashboardProps {
  userId?: string;
}

// Stat Card Component for Profile Tab
const ProfileStatCard = ({ icon: Icon, label, value, color, delay = 0 }: any) => (
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

export function PersonalDashboard({ userId }: PersonalDashboardProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(() => window.scrollY > 20);

  // Scroll shadow effect
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 1);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch data using hooks
  const {
    statistics,
    isLoading: statsLoading,
    error: statsError,
  } = useDashboardStats(userId);
  const {
    trendData,
    isLoading: trendLoading,
    error: trendError,
  } = useProgressTrend(userId);
  const {
    recentAttempts,
    isLoading: recentLoading,
    error: recentError,
  } = useRecentQuizzes(userId, 50);
  const {
    createdQuizzes,
    isLoading: createdLoading,
    error: createdError,
    refetch: refetchCreated,
  } = useCreatedQuizzes(userId);

  const { streak } = useUserProgress();
  const { profileData } = useProfile(userId || user?.id);

  // Check for level up events
  useLevelNotification(statistics);

  // Navigate to homepage and scroll to quiz generator
  const handleCreateQuiz = () => {
    navigate("/");
    // Wait for navigation to complete, then scroll
    setTimeout(() => {
      killActiveScroll();
      scrollToTarget("quiz-generator", { align: "top" });
    }, 100);
  };

  // GSAP hover effects like homepage
  const handleHoverEnter = (e: MouseEvent<HTMLButtonElement>) => {
    if (shouldReduceAnimations()) return;
    const target = e.currentTarget as HTMLButtonElement;
    gsap.to(target, {
      y: -2,
      scale: 1.04,
      boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
      duration: 0.1,
      ease: "power3.out",
    });
  };

  const handleHoverLeave = (e: MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget as HTMLButtonElement;
    gsap.to(target, {
      y: 0,
      scale: 1,
      boxShadow: "0 0 0 rgba(0,0,0,0)",
      duration: 0.15,
      ease: "power3.inOut",
    });
  };

  const isLoading =
    statsLoading || trendLoading || recentLoading || createdLoading;
  const hasError = statsError || trendError || recentError || createdError;

  // Check if user has any data
  const hasNoData =
    statistics &&
    statistics.total_quizzes_created === 0 &&
    statistics.total_quizzes_taken === 0;

  if (hasError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert className="max-w-2xl mx-auto">
          <BarChart3Icon className="h-4 w-4" />
          <AlertDescription>{t("dashboard.error")}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50/50 dark:bg-slate-950">
      {/* Playful Background */}
      <BackgroundDecorations />


      <Tabs 
        value={activeTab} 
        onValueChange={(val) => setSearchParams({ tab: val })}
        className="relative z-10"
      >
        {/* Fixed Top Navbar */}
        {/* Fixed Top Navbar */}
        <motion.div 
          initial={{ width: "90%", opacity: 0 }}
          animate={{ 
            width: scrolled ? "75%" : "100%", 
            opacity: 1,
            top: scrolled ? 16 : 0
          }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className={cn(
            "fixed z-50 left-1/2 -translate-x-1/2",
            scrolled 
              ? "rounded-full border border-slate-200/60 dark:border-slate-800/60 shadow-lg dark:shadow-slate-900/50 backdrop-blur-2xl bg-white/90 dark:bg-slate-950/90" 
              : "border-b border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 shadow-sm rounded-none"
          )}
        >
          <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
            {/* Left: Home Button / Brand */}
            <div className="flex items-center shrink-0">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="rounded-full hover:bg-slate-100 text-slate-600 hover:text-primary transition-all duration-300 gap-2 px-3">
                <ChevronLeftIcon className="w-5 h-5" />
                <span className="hidden md:inline font-bold">
                  {t("nav.home")}
                </span>
              </Button>
            </div>

            {/* Center: Tabs Navigation */}
            <TabsList className="flex-1 max-w-2xl mx-auto flex items-center justify-center bg-transparent border-0 p-0 shadow-none gap-1 sm:gap-4 h-full">
              <TabsTrigger
                value="overview"
                className="flex-1 sm:flex-none relative h-16 rounded-none border-b-2 border-transparent px-2 sm:px-6 hover:bg-slate-50 hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-bold text-slate-500 transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm uppercase tracking-wide sm:normal-case sm:tracking-normal">
                <LayoutDashboard className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">
                  {t("dashboard.tabs.overview")}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="flex-1 sm:flex-none relative h-16 rounded-none border-b-2 border-transparent px-2 sm:px-6 hover:bg-slate-50 hover:text-indigo-500 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none font-bold text-slate-500 transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm uppercase tracking-wide sm:normal-case sm:tracking-normal">
                <UserIcon className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">
                  {t("dashboard.tabs.profile", "Hồ sơ")}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="exchange"
                className="flex-1 sm:flex-none relative h-16 rounded-none border-b-2 border-transparent px-2 sm:px-6 hover:bg-slate-50 hover:text-violet-600 data-[state=active]:border-violet-600 data-[state=active]:text-violet-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none font-bold text-slate-500 transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm uppercase tracking-wide sm:normal-case sm:tracking-normal">
                <Store className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">
                  {t("dashboard.tabs.exchange")}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="lucky-draw"
                className="flex-1 sm:flex-none relative h-16 rounded-none border-b-2 border-transparent px-2 sm:px-6 hover:bg-slate-50 hover:text-amber-500 data-[state=active]:border-amber-500 data-[state=active]:text-amber-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none font-bold text-slate-500 transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm uppercase tracking-wide sm:normal-case sm:tracking-normal">
                <Sparkles className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">
                  {t("dashboard.tabs.luckyDraw", "Lucky Draw")}
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="inventory"
                className="flex-1 sm:flex-none relative h-16 rounded-none border-b-2 border-transparent px-2 sm:px-6 hover:bg-slate-50 hover:text-teal-600 data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none font-bold text-slate-500 transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm uppercase tracking-wide sm:normal-case sm:tracking-normal">
                <Package className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t("inventory.title")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="flex-1 sm:flex-none relative h-16 rounded-none border-b-2 border-transparent px-2 sm:px-6 hover:bg-slate-50 hover:text-slate-600 data-[state=active]:border-slate-600 data-[state=active]:text-slate-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none font-bold text-slate-500 transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm uppercase tracking-wide sm:normal-case sm:tracking-normal">
                <Settings className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">
                  {t("dashboard.tabs.settings")}
                </span>
              </TabsTrigger>
              <button
                onClick={async () => {
                  await signOut();
                  clearQuizProgress();
                  navigate("/");
                }}
                className="flex-1 sm:flex-none relative h-16 rounded-none border-b-2 border-transparent px-2 sm:px-6 hover:bg-slate-50 hover:text-slate-600 font-bold text-slate-500 transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm uppercase tracking-wide sm:normal-case sm:tracking-normal">
                <LogOut className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t("nav.logout")}</span>
              </button>
            </TabsList>

            {/* Right: Placeholder for balance */}
            <div className="w-[88px] shrink-0 hidden md:block"></div>
          </div>
        </motion.div>

        {/* Main Content Container */}
        <div className="container mx-auto py-8 px-3 md:px-6 mt-16 space-y-8 min-h-screen">
          {/* OVERVIEW CONTENT */}
          <TabsContent
            value="overview"
            className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 focus-visible:outline-none">
            {/* Playful Header Section (Moved inside Overview) */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pt-6">
              <div className="text-center md:text-left space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border-2 border-primary text-primary font-bold text-sm shadow-sm animate-fade-in">
                  <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>{t("dashboard.welcomeBack")}</span>
                </div>

                <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground drop-shadow-sm">
                  Hello,{" "}
                  <span className="text-primary relative inline-block">
                    {profileData?.display_name ||
                      user?.user_metadata?.full_name ||
                      user?.email?.split("@")[0] ||
                      "Quizzer"}
                    <svg
                      className="absolute -bottom-2 left-0 w-full h-3 text-yellow-300 -z-10 opacity-60"
                      viewBox="0 0 100 10"
                      preserveAspectRatio="none">
                      <path
                        d="M0 5 Q 50 15 100 5"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                      />
                    </svg>
                  </span>
                  <span className="inline-block animate-wave ml-2 origin-[70%_70%]">
                    👋
                  </span>
                </h1>

                <p className="text-base md:text-lg text-muted-foreground font-medium max-w-lg">
                  {t("dashboard.subtitle")}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleCreateQuiz}
                  size="default"
                  variant="hero"
                  className="group rounded-2xl shadow-lg border-2 border-primary dark:border-primary/50 hover:border-primary-foreground/20 bg-primary dark:bg-primary/90 text-white font-bold text-sm px-4 py-2.5 h-auto transition-all duration-200 active:scale-95 hover:-translate-y-0.5"
                  onMouseEnter={handleHoverEnter}
                  onMouseLeave={handleHoverLeave}>
                  <span className="mr-1.5">{t("dashboard.createQuiz")}</span>
                  <PlusCircleIcon className="w-4 h-4 text-white" />
                </Button>

                <Button
                  onClick={() => navigate("/english")}
                  size="default"
                  variant="hero"
                  className="group rounded-2xl shadow-lg border-2 border-blue-400 dark:border-blue-500/50 hover:border-blue-300 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-sm px-4 py-2.5 h-auto transition-all duration-200 active:scale-95 hover:-translate-y-0.5"
                  onMouseEnter={handleHoverEnter}
                  onMouseLeave={handleHoverLeave}>
                  <span className="mr-1.5">English Hub</span>
                  <BookOpenIcon className="w-4 h-4 text-white" />
                </Button>

                <Button
                  onClick={() => navigate("/english/notebook")}
                  size="default"
                  variant="hero"
                  className="group rounded-2xl shadow-lg border-2 border-amber-400 dark:border-amber-500/50 hover:border-amber-300 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm px-4 py-2.5 h-auto transition-all duration-200 active:scale-95 hover:-translate-y-0.5"
                  onMouseEnter={handleHoverEnter}
                  onMouseLeave={handleHoverLeave}>
                  <span className="mr-1.5">
                    {t("dashboard.notebook.title", "Sổ tay")}
                  </span>
                  <BookOpen className="w-4 h-4 text-white" />
                </Button>
              </div>
            </div>

            {/* Welcome message for new users - Playful Style */}
            {hasNoData && (
              <div className="relative group animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-200/20 rounded-[2.5rem] transform rotate-1 transition-transform group-hover:rotate-0"></div>
                <Card className="relative rounded-[2.5rem] border-4 border-white shadow-[0_8px_30px_rgba(0,0,0,0.05)] bg-white/80 backdrop-blur-md overflow-hidden hover:-translate-y-1 transition-transform duration-300">
                  <CardContent className="p-8 md:p-12 text-center relative z-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>

                    <div className="relative z-10">
                      <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
                        <Sparkles className="h-10 w-10 text-primary" />
                      </div>

                      <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-foreground">
                        {t("dashboard.welcome.title")}
                      </h2>
                      <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                        {t("dashboard.welcome.description")}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                          size="lg"
                          onClick={() =>
                            (window.location.href = "/#quiz-generator")
                          }
                          className="rounded-2xl shadow-lg bg-primary text-white font-bold hover:bg-primary/90 hover:-translate-y-0.5 transition-all"
                          onMouseEnter={handleHoverEnter}
                          onMouseLeave={handleHoverLeave}>
                          {t("dashboard.welcome.createButton")}
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={() =>
                            (window.location.href = "/#quiz-library")
                          }
                          className="rounded-2xl border-2 hover:border-primary/50 font-bold hover:bg-secondary transition-all"
                          onMouseEnter={handleHoverEnter}
                          onMouseLeave={handleHoverLeave}>
                          {t("dashboard.welcome.exploreButton")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Bento Grid Layout - Soft & Rounded */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-3">
                <EnglishStatsCard />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-4">
              {/* Statistics Cards */}
              <StatisticsCards
                statistics={statistics}
                isLoading={statsLoading}
              />
            </div>

            {/* Charts & Lists */}
            <div className="space-y-6 lg:space-y-8">
              <div className="w-full transform hover:translate-y-[-4px] transition-transform duration-300">
                <ProgressTrendline
                  trendData={trendData}
                  isLoading={trendLoading}
                />
              </div>

              <div className="w-full">
                <CreatedQuizzes
                  quizzes={createdQuizzes}
                  isLoading={createdLoading}
                  onRefresh={refetchCreated}
                />
              </div>

              <div className="w-full">
                <RecentQuizzes
                  recentAttempts={recentAttempts}
                  isLoading={recentLoading}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="profile"
            className="animate-in fade-in slide-in-from-bottom-4 duration-500 focus-visible:outline-none pt-6 pb-20">
            
            <div className="max-w-5xl mx-auto space-y-8">
               {/* Profile Card at Top */}
               <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
                    className="w-full relative group"
                >
                    <UserProfile 
                        user={user}
                        statistics={statistics}
                        isLoading={statsLoading}
                        isEditable={true}
                        streak={streak}
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
                                    <Info className="w-5 h-5 text-slate-500" />
                                </div>
                             </div>
                             <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase text-slate-400 mb-1">{t('userProfile.performance')}</p>
                                    <p className="text-sm font-bold flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-orange-400" />
                                        {t('userProfile.streakDays', { streak })}
                                    </p>
                                </div>
                                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-full">
                                    <Zap className="w-5 h-5 text-orange-500" />
                                </div>
                             </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-8 min-w-0">
                        <div className="grid grid-cols-2 gap-4">
                            <ProfileStatCard 
                                icon={BookOpen} 
                                label={t('userProfile.statsAttempted')} 
                                value={statistics?.total_quizzes_taken || 0} 
                                color="bg-blue-500" 
                                delay={0.1} 
                            />
                            <ProfileStatCard 
                                icon={PlusCircleIcon} 
                                label={t('userProfile.statsCreated')} 
                                value={statistics?.total_quizzes_created || 0} 
                                color="bg-indigo-500" 
                                delay={0.2} 
                            />
                            <ProfileStatCard 
                                icon={Trophy} 
                                label={t('userProfile.statsHighest')} 
                                value={statistics?.highest_score || 0} 
                                color="bg-amber-500" 
                                delay={0.3} 
                            />
                             <ProfileStatCard 
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
                            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white dark:border-slate-800 shadow-lg relative overflow-hidden"
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
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-inner italic">
                                        {profileData?.bio ? (
                                            <>
                                                <span className="text-2xl text-indigo-300 font-serif mr-2">"</span>
                                                {profileData.bio}
                                                <span className="text-2xl text-indigo-300 font-serif ml-2">"</span>
                                            </>
                                        ) : (
                                            t('userProfile.notUpdatedBio')
                                        )}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">{t('userProfile.connect')}</h4>
                                        <div className="space-y-3">
                                            {profileData?.facebook_url ? (
                                                <a 
                                                    href={profileData.facebook_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                                                >
                                                    <Facebook className="w-5 h-5 text-blue-600" />
                                                    <span className="font-bold text-slate-700 dark:text-slate-200">Facebook</span>
                                                </a>
                                            ) : (
                                                <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 opacity-50 text-sm italic">
                                                    {t('userProfile.notLinked')}
                                                </div>
                                            )}

                                            {profileData?.zalo_url ? (
                                                <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-800">
                                                    <Phone className="w-5 h-5 text-cyan-600" />
                                                    <span className="font-bold text-slate-700 dark:text-slate-200">{profileData.zalo_url}</span>
                                                </div>
                                            ) : (
                                                <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 opacity-50 text-sm italic">
                                                    {t('userProfile.notLinked')}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">{t('userProfile.achievements')}</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-xl flex flex-col items-center justify-center text-center gap-1">
                                                <Shield className="w-6 h-6 text-yellow-500 fill-yellow-500/20" />
                                                <span className="text-[10px] font-black uppercase text-yellow-700 dark:text-yellow-400">{t('userProfile.newbie')}</span>
                                            </div>
                                            <div className="p-3 bg-purple-400/10 border border-purple-400/20 rounded-xl flex flex-col items-center justify-center text-center gap-1">
                                                <Star className="w-6 h-6 text-purple-500 fill-purple-500/20" />
                                                <span className="text-[10px] font-black uppercase text-purple-700 dark:text-purple-400">{t('userProfile.top100')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.section>
                    </div>
                </div>
            </div>
          </TabsContent>

          <TabsContent
            value="exchange"
            className="min-h-[500px] pt-4 focus-visible:outline-none">
            <ExchangeTab />
          </TabsContent>

          <TabsContent
            value="lucky-draw"
            className="min-h-[500px] pt-4 focus-visible:outline-none">
            <GachaSystem />
          </TabsContent>



          <TabsContent
            value="inventory"
            className="min-h-[500px] pt-4 focus-visible:outline-none">
            <InventoryTab />
          </TabsContent>

          <TabsContent
            value="settings"
            className="min-h-[500px] pt-4 focus-visible:outline-none">
            <div className="max-w-4xl mx-auto">
              <ApiKeySettings />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
