import * as React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Tiến độ</span>
          <span>
            {currentIndex + 1} / {totalCards}
          </span>
        </div>
        <Progress value={progressPercent} className="h-2 progress-animate" />
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-4">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="lg"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className={cn(
            "flex items-center gap-2 transition-all duration-200 flashcard-button",
            !canGoPrevious && "opacity-50 cursor-not-allowed"
          )}>
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Trước</span>
        </Button>

        {/* Center Controls */}
        <div className="flex items-center gap-2">
          {/* Flip Button */}
          <Button
            variant={isFlipped ? "default" : "outline"}
            size="lg"
            onClick={onFlip}
            className="flex items-center gap-2 min-w-[120px] justify-center flashcard-button">
            <RefreshCw className="w-4 h-4" />
            <span>{isFlipped ? "Câu hỏi" : "Đáp án"}</span>
          </Button>

          {/* Card Number Display */}
          <div className="hidden md:flex items-center justify-center w-16 h-12 rounded-lg border-2 border-[#B5CC89] bg-[#B5CC89]/10">
            <span className="font-bold text-[#B5CC89]">{currentIndex + 1}</span>
          </div>
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="lg"
          onClick={onNext}
          disabled={!canGoNext}
          className={cn(
            "flex items-center gap-2 transition-all duration-200 flashcard-button",
            !canGoNext && "opacity-50 cursor-not-allowed"
          )}>
          <span className="hidden sm:inline">Sau</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick Navigation Dots */}
      <div className="flex flex-wrap justify-center gap-2 mt-6">
        {Array.from({ length: totalCards }, (_, index) => (
          <button
            key={index}
            onClick={() => {
              // This will be handled by parent component
              const event = new CustomEvent("goToCard", { detail: index });
              window.dispatchEvent(event);
            }}
            className={cn(
              "w-8 h-8 rounded-full text-xs font-medium transition-all duration-200 border nav-dot",
              index === currentIndex
                ? "bg-[#B5CC89] text-white border-[#B5CC89] active"
                : "bg-muted text-muted-foreground border-border hover:bg-[#B5CC89]/10 hover:border-[#B5CC89]/50"
            )}
            title={`Đến thẻ ${index + 1}`}>
            {index + 1}
          </button>
        ))}
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="text-center text-xs text-muted-foreground space-y-1">
        <p>Phím tắt: ← Trước | → Sau | Space/Enter Lật thẻ</p>
        <p>Nhấn vào số thẻ để nhảy đến thẻ tương ứng</p>
      </div>
    </div>
  );
};

export default FlashcardControls;
