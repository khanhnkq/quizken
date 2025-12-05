import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { RecentQuizAttempt } from "@/types/dashboard";
import {
  ClockIcon,
  ArrowRightIcon,
  CalendarIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  TrophyIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface RecentQuizzesProps {
  recentAttempts: RecentQuizAttempt[];
  isLoading: boolean;
}

const ITEMS_PER_PAGE = 5;

export function RecentQuizzes({
  recentAttempts,
  isLoading,
}: RecentQuizzesProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  // Pagination Logic
  const totalPages = Math.ceil((recentAttempts?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = recentAttempts?.slice(startIndex, startIndex + ITEMS_PER_PAGE) || [];

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(i18n.language === 'en' ? "en-US" : "vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return {
      color: "bg-green-100 text-green-700",
      label: t('dashboard.recentQuizzes.excellent', "Excellent"),
      icon: TrophyIcon
    };
    if (score >= 50) return {
      color: "bg-yellow-100 text-yellow-700",
      label: t('dashboard.recentQuizzes.good', "Good"),
      icon: CheckCircleIcon
    };
    return {
      color: "bg-red-100 text-red-700",
      label: t('dashboard.recentQuizzes.needsImprovement', "Keep Trying"),
      icon: AlertCircleIcon
    };
  };

  const formatQuizTitle = (title?: string) => {
    return title || t('common.untitledQuiz');
  };

  if (isLoading) {
    return (
      <Card className="rounded-[2.5rem] border-0 shadow-sm bg-white/50">
        <CardContent className="p-6 md:p-8 space-y-4">
          <Skeleton className="h-8 w-48 rounded-lg" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!recentAttempts || recentAttempts.length === 0) {
    return (
      <Card className="rounded-[2.5rem] border-0 shadow-sm bg-white/50 text-center py-12">
        <CardContent>
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
            <ClockIcon className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">
            {t('dashboard.recentQuizzes.empty')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <h3 className="text-2xl font-heading font-bold flex items-center gap-3 text-gray-800 group select-none">
          <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
            <ClockIcon className="h-6 w-6" />
          </div>
          {t('dashboard.recentQuizzes.title')}
          <Badge variant="secondary" className="ml-2 rounded-lg">
            {recentAttempts.length}
          </Badge>
          <div className={`ml-2 p-1 rounded-full text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-gray-100' : ''}`}>
            <ChevronLeftIcon className="w-5 h-5 -rotate-90" />
          </div>
        </h3>

        {isExpanded && recentAttempts.length > ITEMS_PER_PAGE && (
          <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
            {t('common.page')} {currentPage} / {totalPages}
          </span>
        )}
      </div>

      <div className={`grid gap-4 transition-all duration-300 ease-in-out origin-top ${isExpanded ? 'opacity-100 max-h-[5000px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
        {currentItems.map((attempt) => {
          const { color, label, icon: BadgeIcon } = getScoreBadge(attempt.score);

          return (
            <div
              key={attempt.attempt_id}
              onClick={() => navigate(`/quiz/${attempt.attempt_id}`)}
              className="group bg-white rounded-[1.25rem] p-3 md:p-4 shadow-md border-2 border-gray-100/60 hover:border-primary/50 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Background Highlight on Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="flex flex-col md:flex-row items-start md:items-center gap-3 relative z-10">
                {/* Score Circle - Smaller */}
                <div className={`
                    w-12 h-12 md:w-14 md:h-14 rounded-xl flex flex-col items-center justify-center shrink-0
                    ${attempt.score >= 80 ? 'bg-green-100 text-green-700' :
                    attempt.score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'}
                  `}>
                  <span className="text-lg md:text-xl font-heading font-bold">{attempt.score}</span>
                  <span className="text-[9px] md:text-[10px] font-bold uppercase opacity-80">%</span>
                </div>

                {/* Content - Compact */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <h4 className="font-bold text-base md:text-lg truncate pr-4 text-gray-900 group-hover:text-primary transition-colors">
                    {formatQuizTitle(attempt.quiz_title)}
                  </h4>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md">
                      <CalendarIcon className="w-3 h-3" />
                      {formatDate(attempt.completed_at)}
                    </span>
                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md">
                      <ClockIcon className="w-3 h-3" />
                      {formatTime(attempt.time_taken_seconds)}
                    </span>
                  </div>
                </div>

                {/* Action Button & Badge - Compact */}
                <div className="flex items-center justify-between w-full md:w-auto md:flex-col md:items-end gap-2 mt-2 md:mt-0">
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${color}`}>
                    <BadgeIcon className="w-3 h-3" />
                    {label}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-lg text-primary font-bold hover:bg-primary/10 hover:text-primary group-hover:scale-105 transition-all text-xs h-7 px-2"
                  >
                    {t('common.view')} <ArrowRightIcon className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Pagination Controls */}
        {recentAttempts.length > ITEMS_PER_PAGE && (
          <div className="flex justify-center items-center gap-4 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="rounded-xl border-2 hover:bg-white hover:text-primary hover:border-primary disabled:opacity-50 transition-all"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-1" />
              {t('common.previous')}
            </Button>

            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${currentPage === i + 1
                    ? "bg-primary w-8 shadow-sm"
                    : "bg-gray-200 w-2.5 hover:bg-primary hover:scale-125"
                    }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="rounded-xl border-2 hover:bg-white hover:text-primary hover:border-primary disabled:opacity-50 transition-all"
            >
              {t('common.next')}
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
