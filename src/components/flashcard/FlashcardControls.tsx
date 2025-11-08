import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FlashcardControlsProps } from "@/types/flashcard";
import "./flashcard.css";

export const FlashcardControls: React.FC<FlashcardControlsProps> = ({
  currentIndex,
  totalCards,
}) => {
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
        <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
          {Array.from({ length: totalCards }, (_, index) => {
            const isCurrent = index === currentIndex;
            const stateClasses = isCurrent
              ? "border-[#B5CC89] text-[#B5CC89] bg-[#B5CC89]/10 hover:bg-[#B5CC89]/20"
              : "border-border text-muted-foreground hover:bg-accent";

            return (
              <Button
                key={`nav-${index}`}
                type="button"
                variant="outline"
                size="icon"
                className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-colors duration-300 ${stateClasses}`}
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
                title={`Thẻ ${index + 1}: ${
                  isCurrent ? "Đang xem" : "Chưa xem"
                }`}>
                <span className="relative z-10 text-xs sm:text-sm">
                  {index + 1}
                </span>
                {isCurrent && (
                  <span className="pointer-events-none absolute -right-1 -top-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-white text-[#B5CC89] border border-[#B5CC89] text-[10px] font-bold">
                    •
                  </span>
                )}
              </Button>
            );
          })}
        </div>

        {/* Help text - Giống QuizContent */}
        <p className="text-center text-xs text-muted-foreground">
          Nhấp để đi tới thẻ tương ứng. Thẻ đang xem có màu xanh.
        </p>
      </div>

      {/* Keyboard Shortcuts - Chỉ hiển thị trên desktop */}
      <div className="hidden lg:block text-center text-xs text-muted-foreground">
        ← → để điều hướng • Space để lật thẻ
      </div>
    </div>
  );
};

export default FlashcardControls;
