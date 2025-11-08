import * as React from "react";
import { cn } from "@/lib/utils";
import { Info } from "@/lib/icons";
import type { FlashcardCardProps } from "@/types/flashcard";
import FlipCard from "@/components/ui/FlipCard";
import "./flashcard.css";

/**
 * FlashcardCard (updated per user request):
 * - Loại bỏ phần "Câu hỏi" trên mặt sau.
 * - Luôn tăng chiều cao của thẻ (autoHeight) để hiển thị đầy đủ đáp án và giải thích — không có scroll nội bộ.
 */

export const FlashcardCard: React.FC<FlashcardCardProps> = ({
  flashcard,
  isFlipped,
  onFlip,
  currentIndex,
  totalCards,
}) => {
  // Delegate flip handling to FlipCard while keeping keyboard accessibility
  const handleFlip = () => {
    onFlip?.();
  };

  const frontTitle = flashcard.question;

  const backContent = (
    <div className="relative z-10 p-4 flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center pt-16">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold">
            ✓
          </div>
          <span className="text-lg font-semibold text-foreground">
            Đáp án đúng
          </span>
        </div>

        <div className="w-full max-w-md">
          <div className="bg-card border-2 border-primary/20 rounded-lg p-4 shadow-md">
            <span className="text-foreground text-base font-medium leading-relaxed text-center break-words">
              {flashcard.answer}
            </span>
          </div>
        </div>
      </div>

      {flashcard.explanation && (
        <div className="pt-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Info className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Giải thích
            </span>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 shadow-sm">
            <p className="text-sm text-muted-foreground leading-relaxed text-center break-words">
              {flashcard.explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  // Calculate background image based on current index (1-30 cycling)
  const backgroundImageIndex = (currentIndex % 30) + 1;
  const backgroundImagePath = `/image/flashcard-background/${backgroundImageIndex}.jpg`;

  // Calculate back background image based on current index (1-30 cycling)
  const backBackgroundImageIndex = (currentIndex % 30) + 1;
  const backBackgroundImagePath = `/image/flashcard-back-background/${backBackgroundImageIndex}.jpg`;

  return (
    <div className="relative w-full">
      <FlipCard
        title={frontTitle}
        variant="default"
        isFlipped={isFlipped}
        onFlip={handleFlip}
        image={backgroundImagePath}
        backImage={backBackgroundImagePath}
        backContent={
          <div id={`flashcard-back-${currentIndex}`}>{backContent}</div>
        }
        showSubtitle={false}
        aria-label={`Flashcard ${currentIndex + 1}`}
        className="mx-auto w-full h-full"
        autoHeight={true}
      />
    </div>
  );
};

export default FlashcardCard;
