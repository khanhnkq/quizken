import { useNavigate, useLocation } from "react-router-dom";
import { useQuizProgress } from "@/hooks/useQuizProgress";
import { useAudio } from "@/contexts/SoundContext";
import { PlayCircle, X, Clock } from "lucide-react";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";

export const GlobalResumeButton = () => {
  const { user } = useAuth();
  const { progress, hasProgress, clear } = useQuizProgress();
  const navigate = useNavigate();
  const location = useLocation();
  const { play } = useAudio();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const { profileData } = useProfile(user?.id);
  const isComic = profileData?.equipped_theme === "theme_comic_manga";

  // Timer logic
  useEffect(() => {
    if (!progress?.startTime || progress.startTime === 0) {
      setElapsedSeconds(0);
      return;
    }

    const updateTimer = () => {
      const seconds = Math.floor((Date.now() - progress.startTime!) / 1000); // Assert not-null
      setElapsedSeconds(seconds > 0 ? seconds : 0);
    };

    updateTimer(); // Initial update
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [progress?.startTime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Don't show on play page (we are already playing)
  if (location.pathname.includes("/quiz/play")) return null;

  if (!hasProgress || !progress) return null;

  const answered = progress.userAnswers.filter((a) => a !== -1).length;
  const total = progress.totalQuestions;

  return createPortal(
    <div
      className={cn(
        "fixed bottom-4 left-4 md:bottom-8 md:left-8 z-[100] flex items-center gap-1 p-1 animate-in slide-in-from-bottom-10 fade-in duration-500 hover:scale-105 transition-transform",
        isComic
          ? "bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-full"
          : "bg-white dark:bg-slate-900/90 dark:backdrop-blur-md border-2 border-primary dark:border-primary/50 shadow-lg shadow-primary/20 dark:shadow-slate-900/50 rounded-full hover:shadow-xl hover:shadow-primary/30",
      )}>
      <button
        onClick={() => {
          play("click");
          navigate(`/quiz/play/${progress.quizId}`);
        }}
        className={cn(
          "flex items-center gap-3 pl-4 pr-5 py-2 rounded-full font-bold transition-all",
          isComic
            ? "bg-yellow-400 text-black border-2 border-black hover:scale-105 active:scale-95"
            : "bg-primary text-primary-foreground shadow-sm hover:brightness-110 border border-black/10 dark:border-white/10",
        )}
        title={progress.quizTitle}>
        <div
          className={cn(
            "flex items-center gap-1.5 pr-3 mr-1",
            isComic ? "border-r-2 border-black" : "border-r border-white/30",
          )}>
          <Clock className="w-4 h-4 animate-pulse" />
          <span className="text-xs font-bold font-mono min-w-[3em] text-center">
            {formatTime(elapsedSeconds)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <PlayCircle className="w-4 h-4" />
          <span className="text-xs font-bold font-mono">
            {answered}/{total}
          </span>
        </div>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          clear();
        }}
        className={cn(
          "p-2 rounded-full transition-colors mr-0.5",
          isComic
            ? "text-black hover:bg-black/10"
            : "hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 dark:hover:text-red-400",
        )}
        title="Hủy quiz">
        <X className={cn("w-3.5 h-3.5", isComic && "w-5 h-5 font-bold")} />
      </button>
    </div>,
    document.body,
  );
};
