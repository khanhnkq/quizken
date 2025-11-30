import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RecentQuizAttempt } from "@/types/dashboard";
import { ClockIcon, ExternalLinkIcon, CheckCircleIcon } from "lucide-react";
import { gsap } from "gsap";
import { shouldReduceAnimations } from "@/utils/deviceDetection";
import { useNavigate } from "react-router-dom";
import type { MouseEvent } from "react";
import { useTranslation } from "react-i18next";

interface RecentQuizzesProps {
  recentAttempts: RecentQuizAttempt[];
  isLoading: boolean;
}

export function RecentQuizzes({
  recentAttempts,
  isLoading,
}: RecentQuizzesProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const formatTime = (seconds?: number) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return t('dashboard.recentQuizzes.excellent');
    if (score >= 60) return t('dashboard.recentQuizzes.good');
    return t('dashboard.recentQuizzes.needsImprovement');
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

  if (isLoading) {
    return (
      <Card className="border-2 hover:border-[#B5CC89] transition-colors">
        <CardHeader className="border-b bg-[#B5CC89]/5">
          <CardTitle className="flex items-center gap-2 text-gray-900 text-base md:text-lg">
            <ClockIcon className="h-4 w-4 md:h-5 md:w-5" />
            {t('dashboard.recentQuizzes.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 md:pt-6">
          <div className="space-y-3 md:space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 border-2 border-gray-100 rounded-xl">
                <Skeleton className="h-8 w-8 md:h-10 md:w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32 md:h-5 md:w-48" />
                  <Skeleton className="h-3 w-24 md:h-4 md:w-32" />
                </div>
                <Skeleton className="h-6 w-16 md:h-8 md:w-20 rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recentAttempts || recentAttempts.length === 0) {
    return (
      <Card className="border-2 border-dashed hover:border-[#B5CC89] transition-colors">
        <CardHeader className="border-b bg-[#B5CC89]/5">
          <CardTitle className="flex items-center gap-2 text-gray-900 text-base md:text-lg">
            <ClockIcon className="h-4 w-4 md:h-5 md:w-5" />
            {t('dashboard.recentQuizzes.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-48 md:h-64 text-center p-4">
          <div className="p-3 md:p-4 rounded-full bg-[#B5CC89]/20 mb-3 md:mb-4">
            <ClockIcon className="h-10 w-10 md:h-12 md:w-12 text-[#B5CC89]" />
          </div>
          <p className="text-gray-700 font-semibold mb-2 text-sm md:text-base">
            {t('dashboard.recentQuizzes.empty')}
          </p>
          <p className="text-gray-500 text-xs md:text-sm">
            {t('dashboard.recentQuizzes.emptyDescription')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-2 hover:border-[#B5CC89] transition-all hover:shadow-lg">
      <CardHeader className="border-b bg-[#B5CC89]/5">
        <CardTitle className="flex items-center gap-2 text-gray-900 text-base md:text-lg">
          <ClockIcon className="h-4 w-4 md:h-5 md:w-5" />
          {t('dashboard.recentQuizzes.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 md:pt-6">
        {/* Mobile Card View */}
        <div className="block md:hidden space-y-3">
          {recentAttempts.map((attempt, index) => (
            <div
              key={attempt.attempt_id}
              className={`border-2 rounded-xl p-3 transition-colors ${index % 2 === 0
                ? "bg-white border-gray-100"
                : "bg-gray-50/50 border-gray-100"
                }`}>
              <div className="space-y-2">
                <div>
                  <p className="font-bold text-sm text-gray-900 truncate">
                    {attempt.quiz_title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {attempt.correct_answers}/{attempt.total_questions} câu đúng
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-gray-900">
                      {attempt.score.toFixed(1)}%
                    </span>
                    <Badge
                      className={`${getScoreColor(
                        attempt.score
                      )} font-semibold text-xs`}>
                      {getScoreLabel(attempt.score)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <ClockIcon className="h-3 w-3" />
                    {formatTime(attempt.time_taken_seconds)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {formatDate(attempt.completed_at)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/quiz/${attempt.attempt_id}`)}
                    className="border-2 hover:bg-primary hover:text-primary-foreground transition-colors font-semibold text-xs h-7 px-2"
                    onMouseEnter={handleHoverEnter}
                    onMouseLeave={handleHoverLeave}>
                    <ExternalLinkIcon className="h-3 w-3 mr-1" />
                    Xem
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block rounded-xl border-2 border-gray-100 overflow-auto h-[400px] lg:h-[600px]">
          <div className="min-w-[800px]">
            <Table className="table-fixed">
              <TableHeader className="bg-[#B5CC89]/10 sticky top-0 z-10">
                <TableRow className="hover:bg-[#B5CC89]/10">
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap text-left min-w-[240px] w-auto">
                    Quiz
                  </TableHead>
                  <TableHead className="text-center font-bold text-gray-900 whitespace-nowrap w-[96px]">
                    Điểm
                  </TableHead>
                  <TableHead className="text-center font-bold text-gray-900 whitespace-nowrap w-[120px]">
                    Kết quả
                  </TableHead>
                  <TableHead className="text-center font-bold text-gray-900 whitespace-nowrap w-[120px]">
                    Thời gian
                  </TableHead>
                  <TableHead className="text-center font-bold text-gray-900 whitespace-nowrap w-[160px]">
                    Ngày làm
                  </TableHead>
                  <TableHead className="text-center font-bold text-gray-900 whitespace-nowrap w-[100px]">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAttempts.map((attempt, index) => (
                  <TableRow
                    key={attempt.attempt_id}
                    className={`hover:bg-[#B5CC89]/5 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}>
                    <TableCell className="font-medium">
                      <div>
                        <p className="font-bold text-gray-900">
                          {attempt.quiz_title}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {attempt.correct_answers}/{attempt.total_questions}{" "}
                          câu đúng
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="font-bold text-xl text-gray-900">
                          {attempt.score.toFixed(1)}%
                        </span>
                        <Badge
                          className={`${getScoreColor(
                            attempt.score
                          )} font-semibold`}>
                          {getScoreLabel(attempt.score)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <div className="p-2 rounded-full bg-green-100">
                          <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center text-sm font-medium text-gray-700 gap-1.5">
                        <ClockIcon className="h-4 w-4 text-gray-500" />
                        {formatTime(attempt.time_taken_seconds)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-600 font-medium">
                      {formatDate(attempt.completed_at)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Navigate to quiz attempt details
                          navigate(`/quiz/${attempt.attempt_id}`);
                        }}
                        className="border-2 hover:bg-primary hover:text-primary-foreground transition-colors font-semibold"
                        onMouseEnter={handleHoverEnter}
                        onMouseLeave={handleHoverLeave}>
                        <ExternalLinkIcon className="h-4 w-4 mr-1.5" />
                        Xem
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
