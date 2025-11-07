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

interface RecentQuizzesProps {
  recentAttempts: RecentQuizAttempt[];
  isLoading: boolean;
}

export function RecentQuizzes({
  recentAttempts,
  isLoading,
}: RecentQuizzesProps) {
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16 rounded" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recentAttempts || recentAttempts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz gần đây</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500 text-center">
            Bạn chưa làm quiz nào.
            <br />
            Hãy bắt đầu với một quiz để xem kết quả của bạn!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quiz</TableHead>
                <TableHead className="text-center">Điểm</TableHead>
                <TableHead className="text-center">Kết quả</TableHead>
                <TableHead className="text-center">Thời gian</TableHead>
                <TableHead className="text-center">Ngày làm</TableHead>
                <TableHead className="text-center">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentAttempts.map((attempt) => (
                <TableRow key={attempt.attempt_id}>
                  <TableCell className="font-medium">
                    <div>
                      <p className="font-semibold">{attempt.quiz_title}</p>
                      <p className="text-sm text-gray-500">
                        {attempt.correct_answers}/{attempt.total_questions} câu
                        đúng
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-lg">
                        {attempt.score.toFixed(1)}%
                      </span>
                      <Badge className={`mt-1 ${getScoreColor(attempt.score)}`}>
                        {getScoreLabel(attempt.score)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mx-auto" />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {formatTime(attempt.time_taken_seconds)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-600">
                    {formatDate(attempt.completed_at)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // TODO: Navigate to quiz details
                        console.log("Navigate to quiz:", attempt.quiz_id);
                      }}>
                      <ExternalLinkIcon className="h-4 w-4 mr-1" />
                      Xem
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
