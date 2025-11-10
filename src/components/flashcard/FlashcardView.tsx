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
  const { isCurrentImageLoaded, loadedImages } = useFlashcardImagePreloader({
    currentIndex,
    totalCards,
    preloadCount: 10, // Preload 2 ảnh tiếp theo
  });

  // Calculate progress percentage
  const progressPercent =
    totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

  // Sliding state while waiting for preload
  const [slideDirection, setSlideDirection] = React.useState<
    "left" | "right" | null
  >(null);
  const [isSliding, setIsSliding] = React.useState(false);
  // Track which card is leaving so we can apply exitClass only to the outgoing card
  const [outgoingIndex, setOutgoingIndex] = React.useState<number | null>(null);

  // Navigation helpers: wait for target background image to be loaded before navigating.
  const waitForImageAndNavigate = React.useCallback(
    (
      targetIndex: number,
      navigateFn: () => void,
      direction: "left" | "right" | null = null
    ) => {
      // mark outgoing card so only it gets exit animation
      setOutgoingIndex(currentIndex);
      // Start sliding animation immediately while we wait
      if (direction) {
        setSlideDirection(direction);
        setIsSliding(true);
      }

      if (loadedImages.has(targetIndex)) {
        navigateFn();
        // allow card switch animation to finish — match CSS animation duration (2500ms) plus buffer
        window.setTimeout(() => {
          setIsSliding(false);
          setSlideDirection(null);
          setOutgoingIndex(null);
        }, 1000);
        return;
      }

      // Debug log
      // eslint-disable-next-line no-console
      console.log("flashcard: waiting for image before navigate", {
        targetIndex,
      });

      let elapsed = 0;
      const maxWait = 1000; // ms
      const intervalMs = 100;

      const interval = window.setInterval(() => {
        elapsed += intervalMs;
        if (loadedImages.has(targetIndex) || elapsed >= maxWait) {
          window.clearInterval(interval);
          // eslint-disable-next-line no-console
          console.log("flashcard: proceeding navigation", {
            targetIndex,
            elapsed,
          });
          navigateFn();
          // sliding state is intentionally left set — it will be cleared by the consumer or another lifecycle action
        }
      }, intervalMs);
    },
    [loadedImages, currentIndex]
  );

  const handleNext = () => {
    const target = Math.min(totalCards - 1, currentIndex + 1);
    waitForImageAndNavigate(target, goToNext, "left");
  };

  const handlePrevious = () => {
    const target = Math.max(0, currentIndex - 1);
    waitForImageAndNavigate(target, goToPrevious, "right");
  };

  // Handle custom event for quick navigation - use waitForImageAndNavigate so slide effect runs
  React.useEffect(() => {
    const handleGoToCard = (event: CustomEvent) => {
      const target = Number(event.detail);
      if (Number.isNaN(target)) return;
      // decide slide direction based on currentIndex
      const direction =
        target > currentIndex ? "left" : target < currentIndex ? "right" : null;
      waitForImageAndNavigate(target, () => goToCard(target), direction);
    };

    window.addEventListener("goToCard", handleGoToCard as EventListener);
    return () => {
      window.removeEventListener("goToCard", handleGoToCard as EventListener);
    };
    // Depend on goToCard, waitForImageAndNavigate and currentIndex
  }, [goToCard, waitForImageAndNavigate, currentIndex]);

  // Keyboard navigation: intercept and use sliding+preload-aware navigation
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore when focused on input/textarea
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
      ) {
        return;
      }
      if (event.altKey) return;

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          // Prevent other listeners from running to avoid double navigation
          // stopImmediatePropagation exists on Event
          (event as Event).stopImmediatePropagation();
          handlePrevious();
          break;
        case "ArrowRight":
          event.preventDefault();
          (event as Event).stopImmediatePropagation();
          handleNext();
          break;
        case " ":
        case "Enter":
          event.preventDefault();
          (event as Event).stopImmediatePropagation();
          toggleFlip();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [handleNext, handlePrevious, toggleFlip]);

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
            // exitClass applies to the outgoing card (only when outgoingIndex === index)
            exitClass={
              isSliding && outgoingIndex === currentIndex
                ? slideDirection === "left"
                  ? "flashcard-slide-out-left"
                  : "flashcard-slide-out-right"
                : undefined
            }
            // entryClass applies to the incoming card (when sliding and not the outgoing index)
            entryClass={
              isSliding && outgoingIndex !== currentIndex
                ? slideDirection === "left"
                  ? "flashcard-slide-in-left"
                  : "flashcard-slide-in-right"
                : undefined
            }
          />
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-2">
          {/* Controls */}
          <FlashcardControls
            currentIndex={currentIndex}
            totalCards={totalCards}
            onPrevious={handlePrevious}
            onNext={handleNext}
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
