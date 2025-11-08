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
    <div className="flex flex-col h-full justify-center">
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
            ✓
          </div>
          <span className="font-semibold text-green-700">Đáp án đúng:</span>
        </div>

        <div className="w-full p-3 bg-green-50 border-2 border-green-200 rounded-lg shadow-sm text-center">
          <span className="text-green-800 text-sm font-medium break-words">
            {flashcard.answer}
          </span>
        </div>

        {flashcard.explanation && (
          <div className="mt-4 w-full">
            <p className="text-xs text-muted-foreground text-center mb-1 flex items-center justify-center gap-1">
              <Info className="w-3 h-3 flex-shrink-0" />
              Giải thích
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed text-center bg-blue-50 p-2 rounded-lg border border-blue-200 px-2 break-words">
              {flashcard.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative w-full">
      <FlipCard
        title={frontTitle}
        variant="default"
        isFlipped={isFlipped}
        onFlip={handleFlip}
        image="/image/Flashcard-1.png"
        backContent={
          <div id={`flashcard-back-${currentIndex}`}>{backContent}</div>
        }
        showSubtitle={false}
        aria-label={`Flashcard ${currentIndex + 1}`}
        className="mx-auto w-full h-full"
      />
    </div>
  );
};

export default FlashcardCard;
