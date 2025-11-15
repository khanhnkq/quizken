import React from "react";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  User as UserIcon,
  Settings,
  Clock,
  Trophy,
  Target,
  BookOpen,
  TrendingUp,
  Award,
  Star,
  Check,
} from "@/lib/icons";
import type { UserProfileProps } from "@/types/user";

/**
 * UserAvatar component - displays user avatar with status indicator
 */
const UserAvatar: React.FC<{
  user: User;
  size?: "sm" | "md" | "lg" | "xl";
  showStatus?: boolean;
  className?: string;
}> = ({ user, size = "lg", showStatus = true, className }) => {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-32 h-32",
  };

  const statusSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
  };

  const userName =
    user.user_metadata?.name ||
    user.user_metadata?.full_name ||
    user.email ||
    "Người dùng";
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <img
          src={
            avatarUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              userName
            )}&background=random&color=fff`
          }
          alt={userName}
          className={cn(
            "rounded-full border-4 border-[#B5CC89]/30 object-cover",
            sizeClasses[size]
          )}
        />
        {showStatus && (
          <div
            className={cn(
              "absolute bottom-0 right-0 bg-[#B5CC89] rounded-full flex items-center justify-center",
              statusSizeClasses[size]
            )}>
            <Check
              className={cn(
                "text-white",
                size === "sm"
                  ? "h-2 w-2"
                  : size === "md"
                  ? "h-3 w-3"
                  : "h-4 w-4"
              )}
            />
          </div>
        )}
      </div>
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-900">{userName}</h3>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>
    </div>
  );
};

/**
 * StatsCard component - displays a single statistic
 */
const StatsCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; isPositive: boolean };
  className?: string;
}> = ({ title, value, icon, color, trend, className }) => (
  <div className={cn("p-4 rounded-xl border-2 bg-white", color, className)}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gray-50">{icon}</div>
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        </div>
      </div>
      {trend && (
        <div
          className={cn(
            "flex items-center gap-1 text-sm font-medium",
            trend.isPositive ? "text-green-600" : "text-red-600"
          )}>
          <TrendingUp
            className={cn("h-4 w-4", !trend.isPositive && "rotate-180")}
          />
          {trend.value}%
        </div>
      )}
    </div>
  </div>
);

/**
 * InfoField component - displays a key-value pair
 */
const InfoField: React.FC<{
  label: string;
  value: string | React.ReactNode;
  className?: string;
}> = ({ label, value, className }) => (
  <div
    className={cn(
      "flex justify-between items-center py-2 border-b border-gray-100",
      className
    )}>
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-medium text-gray-900">{value}</span>
  </div>
);

/**
 * Main UserProfile component
 */
export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  statistics,
  isLoading,
  className,
}) => {
  if (isLoading) {
    return (
      <div
        className={cn(
          "w-full max-w-4xl mx-auto font-sans shadow-2xl rounded-2xl overflow-hidden bg-white flex flex-col",
          className
        )}>
        <div className="animate-pulse">
          <div className="h-20 bg-gray-200"></div>
          <div className="p-6 space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className={cn(
          "w-full max-w-4xl mx-auto font-sans shadow-2xl rounded-2xl overflow-hidden bg-white flex flex-col",
          className
        )}>
        <div className="p-8 text-center">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Chưa đăng nhập
          </h2>
          <p className="text-gray-500">
            Vui lòng đăng nhập để xem hồ sơ của bạn
          </p>
        </div>
      </div>
    );
  }

  const joinDate = new Date(user.created_at).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const lastSignIn = user.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Chưa có";

  const provider = user.user_metadata?.provider || "email";

  return (
    <div
      className={cn(
        "w-full max-w-4xl mx-auto font-sans shadow-2xl rounded-2xl overflow-hidden bg-white flex flex-col",
        className
      )}>
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#B5CC89]/10 to-[#B5CC89]/5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Hồ Sơ Người Dùng</h1>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Cài đặt
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex px-6 py-6 gap-8">
        {/* Left Column - Avatar and Basic Info */}
        <div className="w-1/3 flex-shrink-0">
          <UserAvatar user={user} size="xl" />

          {/* User Info */}
          <div className="mt-6 space-y-1">
            <InfoField label="ID" value={user.id.slice(0, 8) + "..."} />
            <InfoField label="Ngày tham gia" value={joinDate} />
            <InfoField label="Lần đăng nhập cuối" value={lastSignIn} />
            <InfoField
              label="Phương thức đăng nhập"
              value={
                provider === "google"
                  ? "Google"
                  : provider === "github"
                  ? "GitHub"
                  : "Email"
              }
            />
          </div>
        </div>

        {/* Right Column - Statistics and Details */}
        <div className="w-2/3 flex flex-col gap-6">
          {/* Statistics Grid */}
          {statistics && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Thống Kê Học Tập
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <StatsCard
                  title="Quiz đã tạo"
                  value={statistics.total_quizzes_created}
                  icon={<BookOpen className="h-5 w-5 text-blue-600" />}
                  color="border-blue-200"
                />
                <StatsCard
                  title="Quiz đã làm"
                  value={statistics.total_quizzes_taken}
                  icon={<Target className="h-5 w-5 text-green-600" />}
                  color="border-green-200"
                />
                <StatsCard
                  title="Điểm cao nhất"
                  value={`${statistics.highest_score}%`}
                  icon={<Trophy className="h-5 w-5 text-yellow-600" />}
                  color="border-yellow-200"
                />
                <StatsCard
                  title="Điểm trung bình"
                  value={`${statistics.average_score.toFixed(1)}%`}
                  icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
                  color="border-purple-200"
                />
              </div>
            </div>
          )}

          {/* Achievements Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Thành Tích
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <Star className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Người mới</p>
                  <p className="text-xs text-gray-500">
                    Hoàn thành quiz đầu tiên
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Award className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Học chăm chỉ
                  </p>
                  <p className="text-xs text-gray-500">Hoàn thành 10 quiz</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <Trophy className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Điểm cao</p>
                  <p className="text-xs text-gray-500">Đạt 90% trở lên</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Hoạt Động Gần Đây
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="h-4 w-4 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Hoàn thành quiz "Lịch sử Việt Nam"
                  </p>
                  <p className="text-xs text-gray-500">2 giờ trước • Đạt 85%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <BookOpen className="h-4 w-4 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Tạo quiz "Toán học cơ bản"
                  </p>
                  <p className="text-xs text-gray-500">1 ngày trước</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Award className="h-4 w-4 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Mở khóa thành tích "Học chăm chỉ"
                  </p>
                  <p className="text-xs text-gray-500">3 ngày trước</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
