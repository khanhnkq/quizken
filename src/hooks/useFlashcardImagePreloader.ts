import { useEffect, useState, useRef } from "react";

interface PreloadResult {
  isLoaded: boolean;
  error: boolean;
}

interface UseFlashcardImagePreloaderProps {
  currentIndex: number;
  totalCards: number;
  preloadCount?: number; // Số lượng ảnh preload thêm (mặc định 2)
}

/**
 * Custom hook để preload ảnh background của flashcard
 * Đảm bảo ảnh hiển thị ngay lập tức khi được truy cập
 */
export function useFlashcardImagePreloader({
  currentIndex,
  totalCards,
  preloadCount = 2,
}: UseFlashcardImagePreloaderProps) {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [errorImages, setErrorImages] = useState<Set<number>>(new Set());
  // Flag để đảm bảo full preload chỉ bắt đầu một lần duy nhất
  const allPreloadStartedRef = useRef(false);

  // Tính toán index của ảnh cần preload
  const getImageIndexes = (currentIdx: number): number[] => {
    const indexes: number[] = [];

    // Luôn bao gồm ảnh hiện tại
    indexes.push(currentIdx);

    // Thêm các ảnh tiếp theo
    for (let i = 1; i <= preloadCount; i++) {
      const nextIdx = (currentIdx + i) % totalCards;
      indexes.push(nextIdx);
    }

    // Thêm ảnh trước đó (cho trường hợp người dùng quay lại)
    if (currentIdx > 0) {
      indexes.push(currentIdx - 1);
    } else if (totalCards > 1) {
      indexes.push(totalCards - 1);
    }

    return [...new Set(indexes)]; // Loại bỏ duplicate
  };

  // Preload một ảnh đơn lẻ
  const preloadImage = (index: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      const backgroundImageIndex = (index % 30) + 1;
      const backBackgroundImageIndex = (index % 30) + 1;

      const frontImagePath = `/image/flashcard-background/${backgroundImageIndex}.jpg`;
      const backImagePath = `/image/flashcard-back-background/${backBackgroundImageIndex}.jpg`;

      let loadedCount = 0;
      let hasError = false;

      const checkComplete = () => {
        if (loadedCount === 2) {
          if (hasError) {
            reject();
          } else {
            resolve();
          }
        }
      };

      // Preload ảnh mặt trước
      const frontImg = new Image();
      frontImg.onload = () => {
        // Log for debugging preload timing
        // eslint-disable-next-line no-console
        console.log("preloader: front image loaded", {
          index,
          path: frontImagePath,
        });
        loadedCount++;
        checkComplete();
      };
      frontImg.onerror = () => {
        // eslint-disable-next-line no-console
        console.log("preloader: front image error", {
          index,
          path: frontImagePath,
        });
        hasError = true;
        loadedCount++;
        checkComplete();
      };
      frontImg.src = frontImagePath;

      // Preload ảnh mặt sau
      const backImg = new Image();
      backImg.onload = () => {
        // Log for debugging preload timing
        // eslint-disable-next-line no-console
        console.log("preloader: back image loaded", {
          index,
          path: backImagePath,
        });
        loadedCount++;
        checkComplete();
      };
      backImg.onerror = () => {
        // eslint-disable-next-line no-console
        console.log("preloader: back image error", {
          index,
          path: backImagePath,
        });
        hasError = true;
        loadedCount++;
        checkComplete();
      };
      backImg.src = backImagePath;
    });
  };

  // Per-index preload removed — relying on the single full preload pass (started below) to
  // load all flashcard images once. This avoids redundant per-navigation preload work.

  // Preload toàn bộ ảnh dựa trên số câu hỏi của quiz (theo batch để tránh quá tải mạng)
  useEffect(() => {
    if (totalCards <= 0) return;
    if (allPreloadStartedRef.current) return;
    allPreloadStartedRef.current = true;

    let cancelled = false;
    const concurrency = 10; // tăng concurrency để preload nhanh hơn
    const throttleMs = 50; // giảm throttle để bắt batch tiếp theo nhanh hơn

    const preloadAll = async () => {
      const maxToPreload = totalCards;
      for (let i = 0; i < maxToPreload; i += concurrency) {
        if (cancelled) break;
        const batch = Array.from(
          { length: Math.min(concurrency, maxToPreload - i) },
          (_, k) => i + k
        );

        await Promise.all(
          batch.map((idx) => {
            if (loadedImages.has(idx) || errorImages.has(idx)) {
              return Promise.resolve();
            }
            return preloadImage(idx)
              .then(() => {
                setLoadedImages((prev) => new Set(prev).add(idx));
                // eslint-disable-next-line no-console
                console.log("preloader: batch loaded", idx);
              })
              .catch(() => {
                setErrorImages((prev) => new Set(prev).add(idx));
                // eslint-disable-next-line no-console
                console.log("preloader: batch error", idx);
              });
          })
        );

        // throttle between batches
        await new Promise((res) => setTimeout(res, throttleMs));
      }
    };

    preloadAll().catch(() => {
      /* silent */
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalCards]);

  // Check xem ảnh hiện tại đã load chưa
  const isCurrentImageLoaded = loadedImages.has(currentIndex);
  const hasCurrentImageError = errorImages.has(currentIndex);

  return {
    isCurrentImageLoaded,
    hasCurrentImageError,
    loadedImages,
    errorImages,
  };
}
