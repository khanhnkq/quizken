import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { RecentQuizAttempt } from "@/types/dashboard";
import { ClockIcon, ExternalLinkIcon, CheckCircleIcon } from "lucide-react";
import { gsap } from "gsap";
import { shouldReduceAnimations } from "@/utils/deviceDetection";
import { useNavigate } from "react-router-dom";
import type { MouseEvent } from "react";

// Responsive styles for single-line display
const tableStyles = `
  @media (max-width: 768px) {
    .recent-quizzes-table {
      font-size: 0.75rem;
    }
    .recent-quizzes-table td,
    .recent-quizzes-table th {
      padding: 0.25rem !important;
    }
    .recent-quizzes-table .badge {
      font-size: 0.625rem !important;
      padding: 0.125rem 0.25rem !important;
    }
  }
  
  @media (min-width: 769px) and (max-width: 1024px) {
    .recent-quizzes-table {
      font-size: 0.875rem;
    }
  }
`;

interface RecentQuizzesProps {
  recentAttempts: RecentQuizAttempt[];
  isLoading: boolean;
}

export function RecentQuizzes({
  recentAttempts,
  isLoading,
}: RecentQuizzesProps) {
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
    if (score >= 80) return "Xuất sắc";
    if (score >= 60) return "Khá tốt";
    return "Cần cải thiện";
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
      <>
        <style>{tableStyles}</style>
        <Card className="border-2 hover:border-[#B5CC89] transition-colors">
          <CardHeader className="border-b bg-[#B5CC89]/5">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <ClockIcon className="h-5 w-5" />
              Quiz gần đây
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 p-4 border-2 border-gray-100 rounded-xl">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded-lg" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  if (!recentAttempts || recentAttempts.length === 0) {
    return (
      <>
        <style>{tableStyles}</style>
        <Card className="border-2 border-dashed hover:border-[#B5CC89] transition-colors">
          <CardHeader className="border-b bg-[#B5CC89]/5">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <ClockIcon className="h-5 w-5" />
              Quiz gần đây
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <div className="p-4 rounded-full bg-[#B5CC89]/20 mb-4">
              <ClockIcon className="h-12 w-12 text-[#B5CC89]" />
            </div>
            <p className="text-gray-700 font-semibold mb-2">
              Bạn chưa làm quiz nào
            </p>
            <p className="text-gray-500 text-sm">
              Hãy bắt đầu với một quiz để xem kết quả của bạn!
            </p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <style>{tableStyles}</style>
      <Card className="border-2 hover:border-[#B5CC89] transition-colors hover:shadow-lg">
        <CardHeader className="border-b bg-[#B5CC89]/5">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <ClockIcon className="h-5 w-5" />
            Quiz gần đây
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-xl border-2 border-gray-100 overflow-hidden">
            <div className="min-w-[850px] overflow-x-auto">
              <ScrollArea className="h-[400px]">
                <Table wrap={false} className="recent-quizzes-table">
                  <colgroup>
                    <col style={{ width: "300px", minWidth: "300px" }} />
                    <col style={{ width: "110px", minWidth: "110px" }} />
                    <col style={{ width: "80px", minWidth: "80px" }} />
                    <col style={{ width: "110px", minWidth: "110px" }} />
                    <col style={{ width: "150px", minWidth: "150px" }} />
                    <col style={{ width: "100px", minWidth: "100px" }} />
                  </colgroup>
                  <TableHeader className="bg-[#B5CC89]/10 sticky top-0 z-10">
                    <TableRow className="hover:bg-[#B5CC89]/10">
                      <TableHead
                        className="font-bold text-gray-900 whitespace-nowrap p-3"
                        style={{ width: "300px", minWidth: "300px" }}>
                        Quiz
                      </TableHead>
                      <TableHead
                        className="text-center font-bold text-gray-900 whitespace-nowrap p-3"
                        style={{ width: "110px", minWidth: "110px" }}>
                        Điểm
                      </TableHead>
                      <TableHead
                        className="text-center font-bold text-gray-900 whitespace-nowrap p-3"
                        style={{ width: "80px", minWidth: "80px" }}>
                        Kết quả
                      </TableHead>
                      <TableHead
                        className="text-center font-bold text-gray-900 whitespace-nowrap p-3"
                        style={{ width: "110px", minWidth: "110px" }}>
                        Thời gian
                      </TableHead>
                      <TableHead
                        className="text-center font-bold text-gray-900 whitespace-nowrap p-3"
                        style={{ width: "150px", minWidth: "150px" }}>
                        Ngày làm
                      </TableHead>
                      <TableHead
                        className="text-center font-bold text-gray-900 whitespace-nowrap p-3"
                        style={{ width: "100px", minWidth: "100px" }}>
                        Hành động
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentAttempts.map((attempt, index) => (
                      <TableRow
                        key={attempt.attempt_id}
                        className={`hover:bg-[#B5CC89]/5 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}>
                        <TableCell
                          className="font-medium p-3"
                          style={{ width: "300px", minWidth: "300px" }}>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="whitespace-nowrap truncate cursor-help">
                                  <p className="font-bold text-gray-900 inline">
                                    {attempt.quiz_title.length > 40
                                      ? `${attempt.quiz_title.substring(
                                          0,
                                          40
                                        )}...`
                                      : attempt.quiz_title}
                                  </p>
                                  <p className="text-sm text-gray-500 ml-2 inline">
                                    ({attempt.correct_answers}/
                                    {attempt.total_questions} câu đúng)
                                  </p>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{attempt.quiz_title}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell
                          className="text-center p-3"
                          style={{ width: "110px", minWidth: "110px" }}>
                          <div className="flex flex-col items-center gap-1 whitespace-nowrap">
                            <span className="font-bold text-lg text-gray-900">
                              {attempt.score.toFixed(1)}%
                            </span>
                            <Badge
                              className={`${getScoreColor(
                                attempt.score
                              )} font-semibold text-xs whitespace-nowrap`}>
                              {getScoreLabel(attempt.score)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell
                          className="text-center p-3"
                          style={{ width: "80px", minWidth: "80px" }}>
                          <div className="flex justify-center">
                            <div className="p-2 rounded-full bg-green-100">
                              <CheckCircleIcon className="h-5 w-5 text-green-600" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell
                          className="text-center p-3"
                          style={{ width: "110px", minWidth: "110px" }}>
                          <div className="flex items-center justify-center text-sm font-medium text-gray-700 gap-1 whitespace-nowrap">
                            <ClockIcon className="h-4 w-4 text-gray-500" />
                            <span>
                              {formatTime(attempt.time_taken_seconds)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell
                          className="text-center p-3 text-sm text-gray-600 font-medium whitespace-nowrap"
                          style={{ width: "150px", minWidth: "150px" }}>
                          {formatDate(attempt.completed_at)}
                        </TableCell>
                        <TableCell
                          className="text-center p-3"
                          style={{ width: "100px", minWidth: "100px" }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Navigate to quiz attempt details
                              navigate(`/quiz/${attempt.attempt_id}`);
                            }}
                            className="border-2 hover:bg-primary hover:text-primary-foreground transition-colors font-semibold text-sm px-3 whitespace-nowrap"
                            onMouseEnter={handleHoverEnter}
                            onMouseLeave={handleHoverLeave}>
                            <ExternalLinkIcon className="h-4 w-4 mr-1" />
                            Xem
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
