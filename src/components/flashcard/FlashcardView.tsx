import * as React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "@/lib/icons";
import FlashcardCard from "./FlashcardCard";
import FlashcardControls from "./FlashcardControls";
import { useFlashcard } from "@/hooks/useFlashcard";
import type { FlashcardViewProps } from "@/types/flashcard";
import "./flashcard.css";

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  quiz,
  onBack,
}) => {
  const {
    currentFlashcard,
    currentIndex,
    totalCards,
    isFlipped,
    canGoPrevious,
    canGoNext,
    goToPrevious,
    goToNext,
    goToCard,
    toggleFlip,
    isLoading,
    error,
  } = useFlashcard(quiz);

  // Handle custom event for quick navigation
  React.useEffect(() => {
    const handleGoToCard = (event: CustomEvent) => {
      goToCard(event.detail);
    };

    window.addEventListener("goToCard", handleGoToCard as EventListener);
    return () => {
      window.removeEventListener("goToCard", handleGoToCard as EventListener);
    };
  }, [goToCard]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="loading-spinner rounded-full h-12 w-12 border-b-2 border-[#B5CC89] mx-auto"></div>
          <p className="text-muted-foreground">Đang tải flashcards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Có lỗi xảy ra
          </h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  if (!currentFlashcard) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <BookOpen className="w-16 h-16 text-[#B5CC89] mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">
            Không có flashcard
          </h2>
          <p className="text-muted-foreground">
            Quiz này không có câu hỏi để hiển thị flashcard.
          </p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Quay lại Quiz</span>
            <span className="sm:hidden">Quay lại</span>
          </Button>
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Chế độ Flashcard
            </h1>
            <p className="text-muted-foreground mt-1">{quiz?.title}</p>
          </div>
          <div className="w-[100px] sm:w-[120px]"></div>{" "}
          {/* Spacer for centering */}
        </div>
      </div>

      {/* Flashcard Content */}
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Flashcard */}
        <FlashcardCard
          flashcard={currentFlashcard}
          isFlipped={isFlipped}
          onFlip={toggleFlip}
          currentIndex={currentIndex}
          totalCards={totalCards}
        />

        {/* Controls */}
        <FlashcardControls
          currentIndex={currentIndex}
          totalCards={totalCards}
          onPrevious={goToPrevious}
          onNext={goToNext}
          onFlip={toggleFlip}
          isFlipped={isFlipped}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
        />
      </div>

      {/* Footer Instructions */}
      <div className="max-w-4xl mx-auto mt-12 text-center">
        <div className="inline-flex items-center gap-4 px-4 py-2 bg-muted/50 rounded-lg border">
          <span className="text-sm text-muted-foreground">Mẹo:</span>
          <span className="text-sm font-medium">
            Click thẻ hoặc nhấn Space để lật • Dùng mũi tên để điều hướng
          </span>
        </div>
      </div>
    </section>
  );
};

export default FlashcardView;
