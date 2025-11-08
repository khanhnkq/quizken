import * as React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw, ArrowLeft } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { FlashcardControlsProps } from "@/types/flashcard";
import "./flashcard.css";

export const FlashcardControls: React.FC<FlashcardControlsProps> = ({
  currentIndex,
  totalCards,
  onPrevious,
  onNext,
  onFlip,
  isFlipped,
  canGoPrevious,
  canGoNext,
}) => {
  const progressPercent =
    totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

  return (
    <div className="w-full space-y-3 sm:space-y-4 px-2 sm:px-4">
      {/* Main Controls - Layout giống QuizContent */}
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Navigation Buttons Row */}
        <div className="flex justify-center gap-2 sm:gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className={cn(
              "flex items-center gap-1 transition-all duration-150 flashcard-button",
              !canGoPrevious && "opacity-50 cursor-not-allowed"
            )}>
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Trước</span>
          </Button>
          <Button
            size="sm"
            variant={isFlipped ? "default" : "outline"}
            onClick={onFlip}
            className="flex items-center gap-1 min-w-[100px] sm:min-w-[120px] justify-center flashcard-button">
            <RefreshCw className="w-4 h-4" />
            <span className="ml-1 text-xs sm:text-sm">
              {isFlipped ? "Câu hỏi" : "Đáp án"}
            </span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onNext}
            disabled={!canGoNext}
            className={cn(
              "flex items-center gap-1 transition-all duration-150 flashcard-button",
              !canGoNext && "opacity-50 cursor-not-allowed"
            )}>
            <span className="hidden sm:inline mr-1">Sau</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress Display */}
        <div className="text-center">
          <span className="text-sm sm:text-base font-medium text-muted-foreground">
            {currentIndex + 1}/{totalCards}
          </span>
        </div>
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
                  const event = new CustomEvent("goToCard", { detail: index });
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
