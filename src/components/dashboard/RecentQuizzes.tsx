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
import type { RecentQuizAttempt } from "@/types/dashboard";
import { ClockIcon, ExternalLinkIcon, CheckCircleIcon } from "lucide-react";
import { gsap } from "gsap";
import { shouldReduceAnimations } from "@/utils/deviceDetection";
import { useNavigate } from "react-router-dom";
import type { MouseEvent } from "react";

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
    );
  }

  if (!recentAttempts || recentAttempts.length === 0) {
    return (
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
    );
  }

  return (
    <Card className="border-2 hover:border-[#B5CC89] transition-colors hover:shadow-lg">
      <CardHeader className="border-b bg-[#B5CC89]/5">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <ClockIcon className="h-5 w-5" />
          Quiz gần đây
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="rounded-xl border-2 border-gray-100 overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader className="bg-[#B5CC89]/10 sticky top-0 z-10">
                <TableRow className="hover:bg-[#B5CC89]/10">
                  <TableHead className="font-bold text-gray-900 whitespace-nowrap">
                    Quiz
                  </TableHead>
                  <TableHead className="text-center font-bold text-gray-900 whitespace-nowrap">
                    Điểm
                  </TableHead>
                  <TableHead className="text-center font-bold text-gray-900 whitespace-nowrap">
                    Kết quả
                  </TableHead>
                  <TableHead className="text-center font-bold text-gray-900 whitespace-nowrap">
                    Thời gian
                  </TableHead>
                  <TableHead className="text-center font-bold text-gray-900 whitespace-nowrap">
                    Ngày làm
                  </TableHead>
                  <TableHead className="text-center font-bold text-gray-900 whitespace-nowrap">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
            </Table>
            <ScrollArea className="h-[400px] md:h-[600px]">
              <Table>
                <TableBody>
                  {recentAttempts.map((attempt, index) => (
                    <TableRow
                      key={attempt.attempt_id}
                      className={`hover:bg-[#B5CC89]/5 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
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
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
