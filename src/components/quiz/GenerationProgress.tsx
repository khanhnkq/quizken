import * as React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, XCircle } from '@/lib/icons';
import { useTranslation } from "react-i18next";

interface GenerationProgressProps {
  generationStatus: string | null;
  generationProgress: string;
  onCancel: () => void;
}

const progressStepKeys = ["init", "auth", "limit", "generate", "done"] as const;

const progressStepMatches = [
  ["starting generation", "đang chuẩn bị"],
  ["authenticating"],
  ["checking rate limits", "rate limit"],
  ["generating with ai"],
  ["completed"],
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

  const percent = Math.min(
    Math.max(
      Math.round(((getActiveStep(generationProgress) + 1) / progressStepKeys.length) * 100),
      10
    ),
    95
  );

  const getTitle = () => {
    if (generationStatus === "failed") {
      return t('quizGenerator.generationProgress.titleFailed');
    }
    if (generationStatus === "expired") {
      return t('quizGenerator.generationProgress.titleExpired');
    }
    return t('quizGenerator.generationProgress.title');
  };

  return (
    <div className="space-y-6 py-4 md:py-8">
      <div className="flex justify-center">
        <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-primary animate-spin" />
      </div>

      <div className="space-y-1 text-center px-4">
        <h3 className="text-lg md:text-xl font-semibold">
          {getTitle()}
        </h3>
        <p className="text-sm md:text-base text-muted-foreground" role="status" aria-live="polite">
          {generationProgress || t('quizGenerator.generationProgress.processing')}
        </p>
      </div>

      <div className="max-w-xl mx-auto px-4">
        <div className="grid grid-cols-5 gap-1 md:gap-2">
          {progressStepKeys.map((key, i) => {
            const active = getActiveStep(generationProgress) >= i;
            return (
              <div key={key} className="flex flex-col items-center">
                <div className={`h-2 w-full rounded-full ${active ? "bg-primary animate-pulse" : "bg-secondary"}`} />
                <span
                  className={`mt-1 md:mt-2 text-[10px] md:text-[11px] text-center ${active ? "text-foreground" : "text-muted-foreground"
                    }`}>
                  {t(`quizGenerator.generationProgress.steps.${key}`)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4">
        <Progress value={percent} aria-label={t('quizGenerator.generationProgress.progressLabel')} className="h-2" />
      </div>

      <p className="text-xs md:text-sm text-center text-muted-foreground px-4">
        {t('quizGenerator.generationProgress.backgroundNote')}
      </p>

      <div className="flex justify-center px-4">
        <Button
          onClick={onCancel}
          variant="outline"
          size="lg"
          className="w-full sm:w-auto hover:bg-primary hover:text-primary-foreground hover:border-foreground transition-colors">
          <XCircle className="mr-2 h-4 w-4" />
          {t('quizGenerator.generationProgress.cancelButton')}
        </Button>
      </div>
    </div>
  );
};

export default GenerationProgress;



