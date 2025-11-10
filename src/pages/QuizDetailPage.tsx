import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useQuizAttemptDetail } from "@/hooks/useQuizAttemptDetail";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrophyIcon,
  BarChart3Icon,
  UserIcon,
  CalendarIcon,
} from "lucide-react";
import { gsap } from "gsap";
import { shouldReduceAnimations } from "@/utils/deviceDetection";
import type { MouseEvent } from "react";

export default function QuizDetailPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const { attemptDetail, attemptSummary, isLoading, error } =
    useQuizAttemptDetail(attemptId);

  // Debug logging
  console.log("🔍 QuizDetailPage - attemptId:", attemptId);
  console.log("🔍 QuizDetailPage - attemptDetail:", attemptDetail);
  console.log("🔍 QuizDetailPage - attemptSummary:", attemptSummary);
  console.log("🔍 QuizDetailPage - isLoading:", isLoading);
  console.log("🔍 QuizDetailPage - error:", error);

  // Check authentication
  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserId(user.id);
        } else {
          // Redirect to home if not authenticated
          navigate("/");
        }
      } catch (error) {
        console.error("Error getting user:", error);
        navigate("/");
      } finally {
        setAuthLoading(false);
      }
    };

    getUser();
  }, [navigate]);

  // GSAP hover effects
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
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

  // Loading states
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background">
        <div className="container mx-auto py-8 px-4">
          <div className="mb-6">
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-6 w-full" />
                        <div className="grid grid-cols-2 gap-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error states
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto">
          <Alert className="mb-6">
            <BarChart3Icon className="h-4 w-4" />
            <AlertDescription>
              {error === "Quiz attempt not found" || error === "Quiz not found"
                ? "Không tìm thấy kết quả quiz này."
                : "Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau."}
            </AlertDescription>
          </Alert>
          <Button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-[#B5CC89] hover:bg-black hover:text-white text-black font-semibold transition-colors"
            onMouseEnter={handleHoverEnter}
            onMouseLeave={handleHoverLeave}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Quay lại Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!attemptDetail || !attemptSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background flex items-center justify-center px-4">
        <Alert>
          <BarChart3Icon className="h-4 w-4" />
          <AlertDescription>
            Không tìm thấy dữ liệu chi tiết cho quiz này.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="mb-4 border-2 hover:bg-primary hover:text-primary-foreground transition-colors font-semibold"
            onMouseEnter={handleHoverEnter}
            onMouseLeave={handleHoverLeave}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Quay lại Dashboard
          </Button>

          <div className="rounded-2xl bg-[#B5CC89]/10 border-2 border-[#B5CC89]/30 p-6 shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-2xl bg-[#B5CC89]">
                <TrophyIcon className="h-8 w-8 text-black" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {attemptDetail.quiz_title}
                </h1>
                <p className="text-muted-foreground">
                  Chi tiết kết quả quiz của bạn
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Questions and Answers */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 hover:border-[#B5CC89] transition-colors hover:shadow-lg">
              <CardHeader className="border-b bg-[#B5CC89]/5">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <BarChart3Icon className="h-5 w-5" />
                  Chi tiết câu trả lời
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {attemptSummary?.answers?.map((answer, index) => (
                    <div
                      key={index}
                      className={`border-2 rounded-xl p-6 transition-all duration-300 ${
                        answer.isCorrect
                          ? "border-green-200 bg-green-50/50"
                          : "border-red-200 bg-red-50/50"
                      }`}>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {answer.isCorrect ? (
                            <div className="p-2 rounded-full bg-green-100">
                              <CheckCircleIcon className="h-5 w-5 text-green-600" />
                            </div>
                          ) : (
                            <div className="p-2 rounded-full bg-red-100">
                              <XCircleIcon className="h-5 w-5 text-red-600" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">
                              Câu {index + 1}
                            </span>
                            <Badge
                              className={`${
                                answer.isCorrect
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              } font-semibold`}>
                              {answer.isCorrect ? "Đúng" : "Sai"}
                            </Badge>
                          </div>

                          <p className="text-gray-900 font-medium">
                            {answer.question}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-gray-700">
                                Đáp án của bạn:
                              </p>
                              <div
                                className={`p-3 rounded-lg border-2 ${
                                  answer.isCorrect
                                    ? "border-green-300 bg-green-100"
                                    : "border-red-300 bg-red-100"
                                }`}>
                                <span className="font-medium">
                                  {String.fromCharCode(65 + answer.userAnswer)}.
                                </span>{" "}
                                {answer.options[answer.userAnswer] ||
                                  "Không có đáp án"}
                              </div>
                            </div>

                            {!answer.isCorrect && (
                              <div className="space-y-2">
                                <p className="text-sm font-semibold text-gray-700">
                                  Đáp án đúng:
                                </p>
                                <div className="p-3 rounded-lg border-2 border-green-300 bg-green-100">
                                  <span className="font-medium">
                                    {String.fromCharCode(
                                      65 + answer.correctAnswer
                                    )}
                                    .
                                  </span>{" "}
                                  {answer.options[answer.correctAnswer] ||
                                    "Không có đáp án"}
                                </div>
                              </div>
                            )}
                          </div>

                          {answer.explanation && (
                            <div className="pt-3 border-t border-gray-200">
                              <p className="text-sm font-semibold text-gray-700 mb-2">
                                Giải thích:
                              </p>
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                {answer.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Statistics */}
          <div className="space-y-6">
            {/* Score Card */}
            <Card className="border-2 hover:border-[#B5CC89] transition-colors hover:shadow-lg">
              <CardHeader className="border-b bg-[#B5CC89]/5">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <TrophyIcon className="h-5 w-5" />
                  Kết quả
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="text-5xl font-bold text-gray-900">
                    {attemptDetail.score.toFixed(1)}%
                  </div>
                  <Badge
                    className={`${getScoreColor(
                      attemptDetail.score
                    )} font-semibold text-lg px-4 py-2`}>
                    {getScoreLabel(attemptDetail.score)}
                  </Badge>
                  <div className="text-sm text-gray-600">
                    {attemptDetail.correct_answers}/
                    {attemptDetail.total_questions} câu đúng
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics Card */}
            <Card className="border-2 hover:border-[#B5CC89] transition-colors hover:shadow-lg">
              <CardHeader className="border-b bg-[#B5CC89]/5">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <BarChart3Icon className="h-5 w-5" />
                  Thống kê
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <ClockIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Thời gian làm</p>
                    <p className="font-semibold text-gray-900">
                      {formatTime(attemptDetail.time_taken_seconds)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Ngày làm</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(attemptDetail.completed_at)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <BarChart3Icon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">
                      Thời gian trung bình/câu
                    </p>
                    <p className="font-semibold text-gray-900">
                      {Math.round(attemptSummary.statistics.timePerQuestion)}{" "}
                      giây
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <BarChart3Icon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Danh mục</p>
                    <p className="font-semibold text-gray-900">
                      {attemptSummary.statistics.category}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <BarChart3Icon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Độ khó</p>
                    <p className="font-semibold text-gray-900">
                      {attemptSummary.statistics.difficulty}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={() => navigate("/dashboard")}
                className="w-full bg-[#B5CC89] hover:bg-black hover:text-white text-black font-semibold transition-colors"
                onMouseEnter={handleHoverEnter}
                onMouseLeave={handleHoverLeave}>
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Quay lại Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
