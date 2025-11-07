import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatisticsCards } from "./StatisticsCards";
import { ProgressTrendline } from "./ProgressTrendline";
import { RecentQuizzes } from "./RecentQuizzes";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useProgressTrend } from "@/hooks/useProgressTrend";
import { useRecentQuizzes } from "@/hooks/useRecentQuizzes";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3Icon, RefreshCwIcon, UserIcon } from "lucide-react";

interface PersonalDashboardProps {
  userId?: string;
}

export function PersonalDashboard({ userId }: PersonalDashboardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch data using hooks
  const {
    statistics,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useDashboardStats(userId);
  const {
    trendData,
    isLoading: trendLoading,
    error: trendError,
    refetch: refetchTrend,
  } = useProgressTrend(userId);
  const {
    recentAttempts,
    isLoading: recentLoading,
    error: recentError,
    refetch: refetchRecent,
  } = useRecentQuizzes(userId);

  const isLoading = statsLoading || trendLoading || recentLoading;
  const hasError = statsError || trendError || recentError;

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchStats(), refetchTrend(), refetchRecent()]);
    } catch (error) {
      console.error("Error refreshing dashboard data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

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
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Enhanced Header with Gradient Background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 shadow-xl">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm">
              <UserIcon className="h-10 w-10 text-white" />
            </div>
            <div className="text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Dashboard Cá Nhân
              </h1>
              <p className="text-white/90 text-sm md:text-base">
                Theo dõi tiến trình học tập và thành tích của bạn
              </p>
            </div>
          </div>
          <Button
            onClick={handleRefreshAll}
            disabled={isRefreshing || isLoading}
            variant="secondary"
            size="lg"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
            <RefreshCwIcon
              className={`h-5 w-5 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Đang tải..." : "Làm mới"}
          </Button>
        </div>
      </div>

      {/* Welcome message for new users */}
      {hasNoData && (
        <Card className="relative overflow-hidden border-0 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 opacity-90" />
          <CardContent className="relative p-8 md:p-12 text-center text-white">
            <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm w-fit mx-auto mb-6">
              <BarChart3Icon className="h-16 w-16" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Chào mừng đến với Dashboard!
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Bạn chưa có dữ liệu học tập nào. Hãy bắt đầu bằng cách tạo quiz
              mới hoặc làm các quiz có sẵn để theo dõi tiến trình của bạn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => (window.location.href = "#quiz-generator")}
                className="bg-white text-indigo-600 hover:bg-white/90 font-semibold">
                Tạo Quiz Mới
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => (window.location.href = "#quiz-library")}
                className="border-white/50 text-white hover:bg-white/20 font-semibold">
                Khám Phá Quiz Library
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <StatisticsCards statistics={statistics} isLoading={statsLoading} />

      {/* Progress Trendline and Recent Quizzes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progress Trendline */}
        <div className="order-2 lg:order-1">
          <ProgressTrendline trendData={trendData} isLoading={trendLoading} />
        </div>

        {/* Recent Quizzes */}
        <div className="order-1 lg:order-2">
          <RecentQuizzes
            recentAttempts={recentAttempts}
            isLoading={recentLoading}
          />
        </div>
      </div>

      {/* Quick Actions */}
      {!hasNoData && (
        <Card className="border-2 border-dashed border-gray-200 hover:border-violet-300 transition-colors">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              🚀 Thao tác nhanh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => (window.location.href = "#quiz-generator")}
                size="lg"
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 font-semibold shadow-md hover:shadow-lg transition-all">
                ✨ Tạo Quiz Mới
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => (window.location.href = "#quiz-library")}
                className="w-full border-2 border-violet-200 hover:border-violet-400 hover:bg-violet-50 font-semibold transition-all">
                📚 Xem Quiz Library
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => (window.location.href = "#about")}
                className="w-full border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 font-semibold transition-all">
                💡 Tìm hiểu thêm
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
