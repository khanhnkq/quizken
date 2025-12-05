import { useState, useEffect, type MouseEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatisticsCards } from "./StatisticsCards";
import { ProgressTrendline } from "./ProgressTrendline";
import { RecentQuizzes } from "./RecentQuizzes";
import { UserProfile } from "../user-profile/UserProfile";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useProgressTrend } from "@/hooks/useProgressTrend";
import { useRecentQuizzes } from "@/hooks/useRecentQuizzes";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3Icon, PlusCircleIcon, UserIcon, Sparkles, ChevronLeftIcon } from "lucide-react";
import { BackgroundDecorations } from "@/components/ui/BackgroundDecorations";
import { gsap } from "gsap";
import { shouldReduceAnimations } from "@/utils/deviceDetection";
import { useNavigate } from "react-router-dom";
import { killActiveScroll, scrollToTarget } from "@/lib/scroll";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "react-i18next";

interface PersonalDashboardProps {
  userId?: string;
}

export function PersonalDashboard({ userId }: PersonalDashboardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

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
      duration: 0.18,
      ease: "power3.out",
    });
  };

  const handleHoverLeave = (e: MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget as HTMLButtonElement;
    gsap.to(target, {
      y: 0,
      scale: 1,
      boxShadow: "0 0 0 rgba(0,0,0,0)",
      duration: 0.22,
      ease: "power3.inOut",
    });
  };

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

  const isLoading = statsLoading || trendLoading || recentLoading;
  const hasError = statsError || trendError || recentError;

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
          <AlertDescription>
            {t('dashboard.error')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Playful Background */}
      <BackgroundDecorations />

      <div className="container mx-auto py-8 px-4 md:px-6 relative z-10 space-y-8">

        {/* Navigation */}
        <div className="flex justify-start">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white hover:shadow-md text-gray-600 hover:text-primary transition-all duration-300 group"
          >
            <ChevronLeftIcon className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
            {t('nav.home')}
          </Button>
        </div>

        {/* Playful Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border-2 border-[#B5CC89] text-[#B5CC89] font-bold text-sm shadow-sm animate-fade-in">
              <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span>{t('dashboard.welcomeBack')}</span>
            </div>

            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground drop-shadow-sm">
              Hello, <span className="text-primary relative inline-block">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Quizzer"}
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-yellow-300 -z-10 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="12" fill="none" />
                </svg>
              </span>
              <span className="inline-block animate-wave ml-2 origin-[70%_70%]">👋</span>
            </h1>

            <p className="text-lg text-muted-foreground font-medium max-w-lg">
              {t('dashboard.subtitle')}
            </p>
          </div>

          <Button
            onClick={handleCreateQuiz}
            size="xl"
            variant="hero"
            className="group rounded-3xl shadow-xl border-4 border-primary hover:border-primary-foreground/20 bg-primary text-white font-heading text-lg px-8 py-6 h-auto transition-all duration-200 active:scale-95"
            onMouseEnter={handleHoverEnter}
            onMouseLeave={handleHoverLeave}>
            <span className="mr-2">{t('dashboard.createQuiz')}</span>
            <div className="bg-white/20 p-1.5 rounded-xl group-hover:rotate-12 transition-transform">
              <PlusCircleIcon className="w-6 h-6 text-white" />
            </div>
          </Button>
        </div>

        {/* Welcome message for new users - Playful Style */}
        {hasNoData && (
          <div className="relative group animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-200/20 rounded-[2.5rem] transform rotate-1 transition-transform group-hover:rotate-0"></div>
            <Card className="relative rounded-[2.5rem] border-4 border-white shadow-[0_8px_30px_rgba(0,0,0,0.05)] bg-white/80 backdrop-blur-md overflow-hidden hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="p-8 md:p-12 text-center relative z-10">
                {/* Decoration Circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
                    <Sparkles className="h-10 w-10 text-primary" />
                  </div>

                  <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-foreground">
                    {t('dashboard.welcome.title')}
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                    {t('dashboard.welcome.description')}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      size="lg"
                      onClick={() => (window.location.href = "/#quiz-generator")}
                      className="rounded-2xl shadow-lg bg-primary text-white font-bold hover:bg-primary/90 hover:-translate-y-0.5 transition-all"
                      onMouseEnter={handleHoverEnter}
                      onMouseLeave={handleHoverLeave}>
                      {t('dashboard.welcome.createButton')}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => (window.location.href = "/#quiz-library")}
                      className="rounded-2xl border-2 hover:border-primary/50 font-bold hover:bg-secondary transition-all"
                      onMouseEnter={handleHoverEnter}
                      onMouseLeave={handleHoverLeave}>
                      {t('dashboard.welcome.exploreButton')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bento Grid Layout - Soft & Rounded */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Profile Card */}
          <div className="w-full h-full transform hover:scale-[1.01] transition-transform duration-300">
            <UserProfile
              user={user}
              statistics={statistics}
              isLoading={statsLoading}
              className="w-full h-full rounded-[2rem] shadow-lg border-2 border-white bg-white/60 backdrop-blur-sm"
            />
          </div>

          {/* Statistics Cards */}
          <StatisticsCards statistics={statistics} isLoading={statsLoading} />
        </div>

        {/* Charts & Lists */}
        <div className="space-y-6 lg:space-y-8">
          <div className="w-full transform hover:translate-y-[-4px] transition-transform duration-300">
            <ProgressTrendline trendData={trendData} isLoading={trendLoading} />
          </div>

          <div className="w-full">
            <RecentQuizzes
              recentAttempts={recentAttempts}
              isLoading={recentLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
