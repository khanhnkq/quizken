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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UserIcon className="h-8 w-8" />
            Dashboard Cá Nhân
          </h1>
          <p className="text-gray-600 mt-2">
            Theo dõi tiến trình học tập và thành tích của bạn
          </p>
        </div>
        <Button
          onClick={handleRefreshAll}
          disabled={isRefreshing || isLoading}
          variant="outline"
          className="flex items-center gap-2">
          <RefreshCwIcon
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Đang tải..." : "Làm mới"}
        </Button>
      </div>

      {/* Welcome message for new users */}
      {hasNoData && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-8 text-center">
            <BarChart3Icon className="h-16 w-16 mx-auto text-blue-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Chào mừng đến với Dashboard!
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Bạn chưa có dữ liệu học tập nào. Hãy bắt đầu bằng cách tạo quiz
              mới hoặc làm các quiz có sẵn để theo dõi tiến trình của bạn.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => (window.location.href = "#quiz-generator")}>
                Tạo Quiz Mới
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "#quiz-library")}>
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
        <Card>
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => (window.location.href = "#quiz-generator")}
                className="w-full">
                Tạo Quiz Mới
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "#quiz-library")}
                className="w-full">
                Xem Quiz Library
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "#about")}
                className="w-full">
                Tìm hiểu thêm
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
