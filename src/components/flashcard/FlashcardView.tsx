import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, BookOpen } from "@/lib/icons";
import FlashcardCard from "./FlashcardCard";
import FlashcardControls from "./FlashcardControls";
import { useFlashcard } from "@/hooks/useFlashcard";
import { useFlashcardImagePreloader } from "@/hooks/useFlashcardImagePreloader";
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

  // Preload images for better performance
  const { isCurrentImageLoaded } = useFlashcardImagePreloader({
    currentIndex,
    totalCards,
    preloadCount: 2, // Preload 2 ảnh tiếp theo
  });

  // Calculate progress percentage
  const progressPercent =
    totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

  // Handle custom event for quick navigation - goToCard is now stable
  React.useEffect(() => {
    const handleGoToCard = (event: CustomEvent) => {
      goToCard(event.detail);
    };

    window.addEventListener("goToCard", handleGoToCard as EventListener);
    return () => {
      window.removeEventListener("goToCard", handleGoToCard as EventListener);
    };
    // ✅ goToCard is now stable (empty dependencies), so this effect only runs once
  }, [goToCard]);

  if (isLoading) {
    return (
      <div className="text-center space-y-4 py-12">
        <div className="loading-spinner rounded-full h-12 w-12 border-b-2 border-[#B5CC89] mx-auto"></div>
        <p className="text-muted-foreground">Đang tải flashcards...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center space-y-4 max-w-md mx-auto p-6 py-12">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-xl font-semibold text-foreground">Có lỗi xảy ra</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </div>
    );
  }

  if (!currentFlashcard) {
    return (
      <div className="text-center space-y-4 py-12">
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
    );
  }

  return (
    <>
      <Card className="border-2 rounded-none md:rounded-xl shadow-lg bg-card">
        <CardHeader className="pb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#B5CC89]/10 text-[#B5CC89]">
                  Flashcard
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                  {totalCards} thẻ
                </span>
              </div>
              <CardTitle className="text-xl md:text-2xl">
                Chế độ Flashcard
              </CardTitle>
              <CardDescription className="mt-1">{quiz?.title}</CardDescription>
            </div>
            <div className="flex gap-2 w-full lg:w-auto">
              <Button
                onClick={onBack}
                variant="outline"
                size="sm"
                className="flex-1 lg:flex-initial">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="hidden xs:inline">Quay lại Quiz</span>
                <span className="xs:hidden">Quay lại</span>
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
              <span>Tiến độ</span>
              <span>
                {currentIndex + 1}/{totalCards}
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-[#B5CC89] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Flashcard */}
          <FlashcardCard
            flashcard={currentFlashcard}
            isFlipped={isFlipped}
            onFlip={toggleFlip}
            currentIndex={currentIndex}
            totalCards={totalCards}
            isImagePreloaded={isCurrentImageLoaded}
          />
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-2">
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
        </CardFooter>
      </Card>
    </>
  );
};

export default FlashcardView;
