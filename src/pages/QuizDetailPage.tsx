import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuizAttemptDetail } from "@/hooks/useQuizAttemptDetail";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrophyIcon,
  CalendarIcon,
  Sparkles,
  Target,
  Zap,
  BookOpen,
  Share as ShareIcon,
  DownloadIcon
} from "lucide-react";
import { ShareDialog } from "@/components/common/ShareDialog";
import { gsap } from "gsap";
import { shouldReduceAnimations } from "@/utils/deviceDetection";
import type { MouseEvent } from "react";
import { BackgroundDecorations } from "@/components/ui/BackgroundDecorations";
import confetti from "canvas-confetti";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

export default function QuizDetailPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const [authLoading, setAuthLoading] = useState(true);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  const { attemptDetail, attemptSummary, isLoading, error } =
    useQuizAttemptDetail(attemptId);

  // Check authentication
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) navigate("/");
      } catch (error) {
        navigate("/");
      } finally {
        setAuthLoading(false);
      }
    };
    getUser();
  }, [navigate]);

  // Trigger Confetti on Load
  useEffect(() => {
    if (attemptDetail && !isLoading) {
      const score = attemptDetail.score;
      if (score >= 50) {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
      }
    }
  }, [attemptDetail, isLoading]);


  // GSAP Hover (Playful Bounce)
  const handleHoverEnter = (e: MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    if (shouldReduceAnimations()) return;
    gsap.to(e.currentTarget, {
      y: -4,
      scale: 1.02,
      duration: 0.2,
      ease: "back.out(1.5)",
    });
  };

  const handleHoverLeave = (e: MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      y: 0,
      scale: 1,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remSeconds = seconds % 60;
    return `${minutes}:${remSeconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(t("language") === "English" ? "en-US" : "vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading State
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-8">
        <div className="container mx-auto space-y-8">
          <Skeleton className="h-12 w-64 rounded-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="h-96 w-full rounded-[2.5rem] lg:col-span-2" />
            <Skeleton className="h-96 w-full rounded-[2.5rem]" />
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !attemptDetail || !attemptSummary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <BackgroundDecorations />
        <Card className="rounded-[2rem] shadow-xl border-dashed border-4 border-gray-200 p-8 text-center max-w-md bg-white/80 backdrop-blur">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircleIcon className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-heading font-bold text-gray-800 mb-2">{t('quizDetail.notFound.title')}</h2>
          <p className="text-gray-500 mb-6">{t('quizDetail.notFound.description')}</p>
          <Button onClick={() => navigate("/user/dashboard")} className="rounded-full">
            {t('quizDetail.backToDashboard')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <BackgroundDecorations />

      <div className="container mx-auto py-8 px-4 md:px-6 relative z-10">

        {/* Navigation & Actions */}
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/user/dashboard")}
            className="rounded-full bg-white/80 hover:bg-white shadow-sm hover:shadow-md transition-all group px-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform text-gray-500" />
            <span className="font-bold text-gray-600">{t('quizDetail.backToDashboard')}</span>
          </Button>

          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              className="rounded-full bg-white/80 hover:scale-110 transition-transform"
              onClick={() => setIsShareDialogOpen(true)}
            >
              <ShareIcon className="w-4 h-4 text-gray-600" />
            </Button>
            <Button size="icon" variant="outline" className="rounded-full bg-white/80 hover:scale-110 transition-transform">
              <DownloadIcon className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
        </div>

        {/* Title Section - Richer Gradient */}
        <div className="mb-8 relative overflow-hidden rounded-[2.5rem] shadow-2xl group transition-all duration-300 hover:shadow-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-200 via-pink-200 to-orange-100 opacity-90 backdrop-blur-md" />
          <div className="absolute inset-0 bg-white/30" />

          <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
            <div className="shrink-0 w-24 h-24 bg-gradient-to-br from-yellow-300 to-orange-500 rounded-3xl flex items-center justify-center shadow-lg transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
              <TrophyIcon className="w-12 h-12 text-white drop-shadow-md" />
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur text-purple-700 text-sm font-black uppercase tracking-wider shadow-sm">
                <Sparkles className="w-4 h-4 fill-purple-700 text-purple-700" />
                {t('quizDetail.quizResult')}
                <Sparkles className="w-4 h-4 fill-purple-700 text-purple-700" />
              </div>
              <h1 className="text-3xl md:text-5xl font-heading font-black text-gray-900 leading-tight drop-shadow-sm">
                {attemptDetail.quiz_title}
              </h1>
              <p className="text-gray-700 font-bold flex items-center justify-center md:justify-start gap-2 text-lg">
                <CalendarIcon className="w-5 h-5" /> {formatDate(attemptDetail.completed_at)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT: Questions Review */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-3 px-2">
              <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-gray-800">{t('quizDetail.answerDetail')}</h2>
            </div>

            <ScrollArea className="h-[800px] rounded-[2.5rem] bg-white/30 border-2 border-white/50 backdrop-blur-sm shadow-inner p-2 pr-4">
              <div className="space-y-6 p-2">
                {attemptSummary.answers?.map((answer, index) => {
                  const isCorrect = answer.isCorrect;
                  return (
                    <div
                      key={index}
                      className={`group relative overflow-hidden rounded-[2.5rem] p-0 shadow-sm border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isCorrect
                        ? "bg-white border-green-100"
                        : "bg-white border-red-100"
                        }`}
                      onMouseEnter={handleHoverEnter as any}
                      onMouseLeave={handleHoverLeave as any}
                    >
                      {/* Header of Card */}
                      <div className={`px-8 py-4 flex items-center justify-between ${isCorrect ? "bg-gradient-to-r from-green-50 to-emerald-50" : "bg-gradient-to-r from-red-50 to-pink-50"
                        }`}>
                        <span className={`font-heading font-black text-xl ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                          {t('quizContent.question')} {index + 1}
                        </span>
                        <div className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase flex items-center gap-2 shadow-sm ${isCorrect ? "bg-white text-green-700" : "bg-white text-red-700"
                          }`}>
                          {isCorrect ? (
                            <>{t('quizDetail.correct')} <CheckCircleIcon className="w-4 h-4 fill-green-700 text-white" /></>
                          ) : (
                            <>Wrong <XCircleIcon className="w-4 h-4 fill-red-700 text-white" /></>
                          )}
                        </div>
                      </div>

                      <div className="p-8 space-y-6">
                        <h3 className="text-xl md:text-2xl font-bold text-gray-800 leading-snug">
                          {answer.question}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className={`relative p-5 rounded-[1.5rem] border-2 transition-all ${isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                            }`}>
                            <span className="absolute -top-3 left-4 px-2 bg-white text-xs font-bold uppercase rounded border shadow-sm text-gray-500">
                              {t('quizDetail.yourAnswer')}
                            </span>
                            <p className="font-bold text-gray-800 text-lg">
                              {String.fromCharCode(65 + answer.userAnswer)}. {answer.options[answer.userAnswer]}
                            </p>
                          </div>

                          {!isCorrect && (
                            <div className="relative p-5 rounded-[1.5rem] border-2 bg-green-50 border-green-200 border-dashed">
                              <span className="absolute -top-3 left-4 px-2 bg-white text-xs font-bold uppercase rounded border shadow-sm text-green-600">
                                {t('quizDetail.correctAnswer')}
                              </span>
                              <p className="font-bold text-gray-800 text-lg">
                                {String.fromCharCode(65 + answer.correctAnswer)}. {answer.options[answer.correctAnswer]}
                              </p>
                            </div>
                          )}
                        </div>

                        {answer.explanation && (
                          <div className="bg-blue-50/50 p-5 rounded-[1.5rem] border border-blue-100 flex gap-3">
                            <span className="text-xl">💡</span>
                            <div className="text-sm text-gray-700 leading-relaxed">
                              <span className="font-bold block mb-1 text-blue-700 uppercase text-xs">{t('quizDetail.explanation')}</span>
                              {answer.explanation}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* RIGHT: Stats Sidebar */}
          <div className="space-y-6">

            {/* Score Card - Hero Style */}
            <div className="rounded-[3rem] p-1 bg-gradient-to-b from-yellow-300 via-orange-300 to-pink-300 shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
              <div className="bg-white rounded-[2.8rem] p-8 text-center h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                <h3 className="text-gray-400 font-bold uppercase tracking-[0.2em] mb-6 text-sm">{t('quizDetail.totalScore')}</h3>

                <div className="relative inline-block mb-6">
                  {/* Circle Background */}
                  <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-gray-50 to-white shadow-[inset_0_4px_10px_rgba(0,0,0,0.05)] flex items-center justify-center border-[12px] border-white ring-4 ring-gray-100">
                    <div className="flex flex-col items-center">
                      <span className={`text-6xl md:text-7xl font-heading font-black tracking-tighter ${attemptDetail.score >= 80 ? 'text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-emerald-600' :
                        attemptDetail.score >= 50 ? 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-500' :
                          'text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-pink-600'
                        }`}>
                        {Math.round(attemptDetail.score)}
                      </span>
                      <span className="text-gray-400 font-bold text-lg mt-1">/ 100</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-2">
                  <div className="bg-green-100 px-5 py-3 rounded-2xl flex-1">
                    <p className="text-green-600 text-[10px] font-black uppercase mb-1">{t('quizDetail.correct')}</p>
                    <p className="text-2xl font-black text-green-800">{attemptDetail.correct_answers}</p>
                  </div>
                  <div className="bg-blue-100 px-5 py-3 rounded-2xl flex-1">
                    <p className="text-blue-600 text-[10px] font-black uppercase mb-1">Total</p>
                    <p className="text-2xl font-black text-blue-800">{attemptDetail.total_questions}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Stats */}
            <Card className="rounded-[2.5rem] border-0 shadow-lg bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full">
                    <ClockIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('quizDetail.duration')}</p>
                    <p className="text-xl font-bold text-gray-800">{formatTime(attemptDetail.time_taken_seconds)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 flex items-center justify-center bg-pink-100 text-pink-600 rounded-full">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('quizDetail.avgSpeed')}</p>
                    <p className="text-xl font-bold text-gray-800">{Math.round(attemptSummary.statistics.timePerQuestion)}s / q</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('quizDetail.difficulty')}</p>
                    <p className="text-xl font-bold text-gray-800 capitalize">{attemptSummary.statistics.difficulty}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        url={attemptDetail ? `${window.location.origin}/quiz/play/${attemptDetail.quiz_id}` : ""}
        title={t('share.title', 'Share Quiz')}
        quizTitle={attemptDetail?.quiz_title}
        questionCount={attemptDetail?.total_questions}
      />
    </div>
  );
}
