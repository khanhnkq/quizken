import * as React from "react";
import { cn } from "@/lib/utils";
import type { FlashcardCardProps } from "@/types/flashcard";
import "./flashcard.css";

export const FlashcardCard: React.FC<FlashcardCardProps> = ({
  flashcard,
  isFlipped,
  onFlip,
  currentIndex,
  totalCards,
}) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      onFlip();
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Card Counter */}
      <div className="text-center mb-4 text-sm text-muted-foreground">
        Thẻ {currentIndex + 1} / {totalCards}
      </div>

      {/* Flashcard Container */}
      <div
        className="relative h-96 md:h-[32rem] perspective-1000 cursor-pointer"
        onClick={onFlip}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label="Nhấn để lật thẻ">
        <div
          className={cn(
            "relative w-full h-full transition-transform duration-700 transform-style-preserve-3d",
            isFlipped && "rotate-y-180"
          )}
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}>
          {/* Front of card - Question */}
          <div
            className="absolute inset-0 w-full h-full backface-hidden rounded-xl border-2 border-[#B5CC89] bg-gradient-to-br from-white to-[#F8FAFC] shadow-xl flex flex-col items-center justify-center p-8"
            style={{ backfaceVisibility: "hidden" }}>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#B5CC89]/10 text-[#B5CC89] mb-4">
                <span className="text-lg font-bold">{currentIndex + 1}</span>
              </div>

              <h3 className="text-xl md:text-2xl font-semibold text-foreground leading-relaxed">
                {flashcard.question}
              </h3>

              <p className="text-sm text-muted-foreground mt-6">
                Nhấn để xem đáp án
              </p>
            </div>
          </div>

          {/* Back of card - Answer + Explanation */}
          <div
            className="absolute inset-0 w-full h-full backface-hidden rounded-xl border-2 border-[#B5CC89] bg-gradient-to-br from-[#F0FDF4] to-[#DCFECE] shadow-xl flex flex-col p-8 overflow-y-auto"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}>
            <div className="space-y-6">
              {/* Question reminder */}
              <div className="pb-4 border-b border-[#B5CC89]/20">
                <p className="text-sm text-muted-foreground">Câu hỏi:</p>
                <p className="font-medium">{flashcard.question}</p>
              </div>

              {/* Correct Answer */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
                    ✓
                  </div>
                  <span className="font-semibold text-green-700">
                    Đáp án đúng:
                  </span>
                </div>
                <div className="pl-8">
                  <div className="inline-flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="font-medium text-green-800">
                      {String.fromCharCode(65 + flashcard.correctOptionIndex)}.
                    </span>
                    <span className="text-green-800">{flashcard.answer}</span>
                  </div>
                </div>
              </div>

              {/* All Options */}
              <div className="space-y-3">
                <p className="font-semibold text-muted-foreground">
                  Tất cả lựa chọn:
                </p>
                <div className="space-y-2 pl-4">
                  {flashcard.options.map((option, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-2 p-2 rounded-lg border",
                        index === flashcard.correctOptionIndex
                          ? "bg-green-50 border-green-200"
                          : "bg-gray-50 border-gray-200"
                      )}>
                      <span className="font-medium text-sm">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="text-sm">{option}</span>
                      {index === flashcard.correctOptionIndex && (
                        <span className="ml-auto text-green-600 font-semibold text-sm">
                          ✓ Đúng
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              {flashcard.explanation && (
                <div className="space-y-2 pt-4 border-t border-[#B5CC89]/20">
                  <p className="font-semibold text-muted-foreground">
                    Giải thích:
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed bg-blue-50 p-3 rounded-lg border border-blue-200">
                    {flashcard.explanation}
                  </p>
                </div>
              )}

              {/* Flip hint */}
              <div className="text-center pt-4">
                <p className="text-xs text-muted-foreground">
                  Nhấn để quay lại câu hỏi
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="text-center mt-4 text-xs text-muted-foreground">
        Sử dụng phím mũi tên ← → để điều hướng, Space/Enter để lật thẻ
      </div>
    </div>
  );
};

export default FlashcardCard;
