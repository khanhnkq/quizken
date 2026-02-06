import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import logo from "@/assets/logo/logo.png";
import { cn } from "@/lib/utils";
import Mascot from "@/components/ui/Mascot";

interface GenerationProgressProps {
  generationStatus: string | null;
  generationProgress: string;
  onCancel: () => void;
}

const progressStepKeys = ["init", "auth", "limit", "generate", "done"] as const;

const progressStepMatches = [
  ["starting", "đang chuẩn bị", "brewing coffee", "quizgenerator.generationprogress.steps.starting", "quizgenerator.generationprogress.steps.init"],
  ["authenticating", "getting visa", "quizgenerator.generationprogress.steps.authenticating", "quizgenerator.generationprogress.steps.auth"],
  ["limit", "checking rate limits", "counting", "quizgenerator.generationprogress.steps.limits", "quizgenerator.generationprogress.steps.limit"],
  ["generating", "brainstorming", "quizgenerator.generationprogress.steps.ai_generating", "quizgenerator.generationprogress.steps.generate"],
  ["completed", "all done", "quizgenerator.generationprogress.steps.done"],
];

const getActiveStep = (progressText: string | undefined): number => {
  if (!progressText) return 0;
  const p = progressText.toLowerCase();
  for (let i = progressStepMatches.length - 1; i >= 0; i--) {
    if (progressStepMatches[i].some((m) => p.includes(m))) return i;
  }
  return 0;
};

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  generationStatus,
  generationProgress,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [mascotActive, setMascotActive] = useState(false);
  const [funFactIndex, setFunFactIndex] = useState(0);

  // Calculate generic progress percentage
  const percent = Math.min(
    Math.max(
      Math.round(
        ((getActiveStep(generationProgress) + 1) / progressStepKeys.length) *
          100,
      ),
      10,
    ),
    95,
  );

  // Auto-rotate fun facts
  useEffect(() => {
    const interval = setInterval(() => {
      setFunFactIndex((prev) => (prev + 1) % 5); // Assuming 5 facts
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Reset mascot active state
  useEffect(() => {
    if (mascotActive) {
      const timeout = setTimeout(() => setMascotActive(false), 800);
      return () => clearTimeout(timeout);
    }
  }, [mascotActive]);

  const handleMascotClick = () => {
    setMascotActive(true);
  };

  const getTitle = () => {
    if (generationStatus === "failed")
      return t("quizGenerator.generationProgress.titleFailed");
    if (generationStatus === "expired")
      return t("quizGenerator.generationProgress.titleExpired");
    return t("quizGenerator.generationProgress.title");
  };

  // Safe access to translated arrays
  const funFacts = t("quizGenerator.generationProgress.funFacts", {
    returnObjects: true,
  }) as string[];
  const currentFact = Array.isArray(funFacts) ? funFacts[funFactIndex] : "";

  return (
    <div className="relative overflow-hidden py-6 md:py-8 flex flex-col items-center justify-center space-y-8">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Mascot Section */}
      <div
        className="relative z-10 flex flex-col items-center cursor-pointer group"
        onClick={handleMascotClick}>
        <div
          className={cn(
            "relative w-24 h-24 md:w-32 md:h-32 transition-transform duration-300",
            mascotActive ? "scale-110 rotate-12" : "animate-bounce",
          )}>
          {/* Glow effect behind mascot */}
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-125 group-hover:scale-150 transition-transform duration-500" />
          {mascotActive ? (
            <Mascot
              emotion="confused"
              className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
            />
          ) : (
            <img
              src={logo}
              alt="Quizken Mascot"
              className={cn(
                "w-full h-full object-contain drop-shadow-2xl relative z-10",
              )}
            />
          )}
          {/* Speech Bubble */}
          <div
            className={cn(
              "absolute -right-24 -top-8 bg-white text-foreground text-sm font-bold py-2 px-4 rounded-2xl shadow-xl border-2 border-primary/20 animate-in fade-in slide-in-from-bottom-2 duration-300 whitespace-nowrap z-20",
              mascotActive
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100",
            )}>
            {mascotActive ? "Meow ??" : "Chọt vào em đi 👉👈"}
            <div className="absolute bottom-0 left-[-6px] translate-y-1/2 w-3 h-3 bg-white rotate-45 border-b-2 border-l-2 border-primary/20"></div>
          </div>
        </div>
      </div>

      {/* Status & Progress */}
      <div className="w-full max-w-lg space-y-4 px-6 relative z-10 text-center">
        <div className="space-y-1">
          <h3 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 animate-pulse">
            {getTitle()}
          </h3>
          <p className="text-base font-medium text-muted-foreground min-h-[1.5em] transition-all">
            {generationProgress
              ? t(generationProgress) === generationProgress
                ? generationProgress
                : t(generationProgress)
              : t("quizGenerator.generationProgress.processing")}
          </p>
        </div>

        {/* Chunky Progress Bar */}
        <div className="relative h-6 w-full bg-secondary/50 rounded-full overflow-hidden border border-black/5 shadow-inner">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-purple-500 to-indigo-500 transition-all duration-700 ease-out rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"
            style={{ width: `${percent}%` }}>
            <div
              className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite] w-full"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
              }}></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white shadow-sm uppercase tracking-widest mix-blend-overlay">
            {percent}%
          </div>
        </div>
      </div>

      {/* Fun Fact Card */}
      <div className="w-full max-w-md px-6 relative z-10">
        <div className="bg-white/60 backdrop-blur-md border-2 border-primary/10 rounded-2xl p-4 shadow-sm min-h-[100px] flex flex-col items-center justify-center text-center space-y-2 transition-all hover:border-primary/30 hover:shadow-md">
          <span className="text-xs font-extrabold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md">
            Fun Fact 💡
          </span>
          <p className="text-sm md:text-base font-medium text-foreground animate-in fade-in slide-in-from-bottom-1 duration-500 key={funFactIndex}">
            {currentFact || "Did you know learning is fun? 🚀"}
          </p>
        </div>
      </div>

      {/* Cancel Button */}
      <div className="relative z-10 pt-2">
        <Button
          onClick={onCancel}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors gap-2">
          <XCircle className="w-4 h-4" />
          {t("quizGenerator.generationProgress.cancelButton")}
        </Button>
      </div>

      {/* Custom Styles for wiggle/bounce if needed */}
      <style>{`
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default GenerationProgress;
