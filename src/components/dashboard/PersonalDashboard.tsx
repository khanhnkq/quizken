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
import { BarChart3Icon, PlusCircleIcon, UserIcon } from "lucide-react";
import { gsap } from "gsap";
import { shouldReduceAnimations } from "@/utils/deviceDetection";
import { useNavigate } from "react-router-dom";
import { killActiveScroll, scrollToTarget } from "@/lib/scroll";
import { useAuth } from "@/lib/auth";

interface PersonalDashboardProps {
  userId?: string;
}

export function PersonalDashboard({ userId }: PersonalDashboardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

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
  } = useRecentQuizzes(userId);

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
            Đã có lỗi xảy ra khi tải dữ liệu dashboard. Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 md:py-8 px-3 md:px-4 space-y-6 md:space-y-8">
      {/* Enhanced Header with Brand Color */}
      <div className="rounded-2xl bg-[#B5CC89]/10 border-2 border-[#B5CC89]/30 p-4 md:p-8 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-3 md:p-4 rounded-2xl bg-[#B5CC89]">
              <UserIcon className="h-8 w-8 md:h-10 md:w-10 text-black" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 text-gray-900">
                Dashboard Cá Nhân
              </h1>
              <p className="text-muted-foreground text-xs md:text-sm lg:text-base">
                Theo dõi tiến trình học tập và thành tích của bạn
              </p>
            </div>
          </div>
          <Button
            onClick={handleCreateQuiz}
            size="lg"
            className="bg-[#B5CC89] hover:bg-black hover:text-white text-black border-2 border-transparent hover:border-[#B5CC89] font-semibold shadow-lg transition-colors text-sm md:text-base"
            onMouseEnter={handleHoverEnter}
            onMouseLeave={handleHoverLeave}>
            <PlusCircleIcon className="h-4 w-4 md:h-5 md:w-5 mr-2" />
            <span className="hidden sm:inline">Tạo Quiz Mới</span>
            <span className="sm:hidden">Tạo Quiz</span>
          </Button>
        </div>
      </div>

      {/* Welcome message for new users */}
      {hasNoData && (
        <Card className="border-2 border-[#B5CC89]/30 bg-[#B5CC89]/5 shadow-lg">
          <CardContent className="p-6 md:p-8 lg:p-12 text-center">
            <div className="p-3 md:p-4 rounded-2xl bg-[#B5CC89] w-fit mx-auto mb-4 md:mb-6">
              <BarChart3Icon className="h-12 w-12 md:h-16 md:w-16 text-black" />
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-gray-900">
              Chào mừng đến với Dashboard!
            </h2>
            <p className="text-muted-foreground text-sm md:text-base lg:text-lg mb-6 md:mb-8 max-w-2xl mx-auto">
              Bạn chưa có dữ liệu học tập nào. Hãy bắt đầu bằng cách tạo quiz
              mới hoặc làm các quiz có sẵn để theo dõi tiến trình của bạn.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => (window.location.href = "/#quiz-generator")}
                className="bg-[#B5CC89] hover:bg-black hover:text-white text-black font-semibold transition-colors text-sm md:text-base"
                onMouseEnter={handleHoverEnter}
                onMouseLeave={handleHoverLeave}>
                <span className="hidden sm:inline">Tạo Quiz Mới</span>
                <span className="sm:hidden">Tạo Quiz</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => (window.location.href = "/#quiz-library")}
                className="border-2 hover:bg-primary hover:text-primary-foreground transition-colors font-semibold text-sm md:text-base"
                onMouseEnter={handleHoverEnter}
                onMouseLeave={handleHoverLeave}>
                <span className="hidden sm:inline">Khám Phá Quiz Library</span>
                <span className="sm:hidden">Quiz Library</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Profile Section */}
      <div className="w-full flex justify-center">
        <UserProfile
          user={user}
          statistics={statistics}
          isLoading={statsLoading}
          className="w-full max-w-full md:max-w-lg"
        />
      </div>

      {/* Statistics Cards */}
      <div className="w-full">
        <StatisticsCards statistics={statistics} isLoading={statsLoading} />
      </div>

      {/* Progress Trendline - Full Width */}
      <div className="w-full">
        <ProgressTrendline trendData={trendData} isLoading={trendLoading} />
      </div>

      {/* Recent Quizzes - Full Width */}
      <div className="w-full">
        <RecentQuizzes
          recentAttempts={recentAttempts}
          isLoading={recentLoading}
        />
      </div>
    </div>
  );
}
