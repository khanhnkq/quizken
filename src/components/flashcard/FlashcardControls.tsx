import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FlashcardControlsProps } from "@/types/flashcard";
import "./flashcard.css";

import { useTranslation } from "react-i18next";

export const FlashcardControls: React.FC<FlashcardControlsProps> = ({
  currentIndex,
  totalCards,
}) => {
  const { t } = useTranslation();
  const progressPercent =
    totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

  return (
    <div className="w-full space-y-3 sm:space-y-4 px-2 sm:px-4">
      {/* Progress Display */}
      <div className="text-center">
        <span className="text-sm sm:text-base font-medium text-muted-foreground">
          {currentIndex + 1}/{totalCards}
        </span>
      </div>

      {/* Question Navigation - Layout giống QuizContent */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: totalCards }, (_, index) => {
            const isCurrent = index === currentIndex;
            const stateClasses = isCurrent
              ? "border-[#B5CC89] text-[#B5CC89] hover:bg-[#B5CC89]/10"
              : "border-border text-muted-foreground hover:bg-accent";

            return (
              <Button
                key={`nav-${index}`}
                type="button"
                variant="outline"
                size="icon"
                className={`relative w-10 h-10 rounded-xl border-2 transition-transform hover:scale-110 duration-200 ${stateClasses}`}
                onClick={() => {
                  // Use the same event but include direction so view can animate slide
                  const direction =
                    index > currentIndex
                      ? "left"
                      : index < currentIndex
                        ? "right"
                        : null;
                  const event = new CustomEvent("goToCard", {
                    detail: index,
                    direction,
                  });
                  window.dispatchEvent(event);
                }}
                title={`${t('quizGenerator.flashcard.card')} ${index + 1}: ${isCurrent ? t('quizGenerator.flashcard.viewing') : t('quizGenerator.flashcard.notViewed')
                  }`}>
                <span className="relative z-10">{index + 1}</span>
                {isCurrent && (
                  <span className="pointer-events-none absolute -right-1 -top-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#B5CC89] text-white text-[10px] font-bold shadow-sm">
                    ✓
                  </span>
                )}
              </Button>
            );
          })}
        </div>

        {/* Help text - Giống QuizContent */}
        <p className="text-center text-xs text-muted-foreground">
          {t('quizGenerator.flashcard.help')}
        </p>
      </div>

      {/* Keyboard Shortcuts - Chỉ hiển thị trên desktop */}
      <div className="hidden lg:block text-center text-xs text-muted-foreground">
        {t('quizGenerator.flashcard.shortcuts')}
      </div>
    </div>
  );
};

export default FlashcardControls;
