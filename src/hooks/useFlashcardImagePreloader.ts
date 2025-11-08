import { useEffect, useState } from "react";

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
        loadedCount++;
        checkComplete();
      };
      frontImg.onerror = () => {
        hasError = true;
        loadedCount++;
        checkComplete();
      };
      frontImg.src = frontImagePath;

      // Preload ảnh mặt sau
      const backImg = new Image();
      backImg.onload = () => {
        loadedCount++;
        checkComplete();
      };
      backImg.onerror = () => {
        hasError = true;
        loadedCount++;
        checkComplete();
      };
      backImg.src = backImagePath;
    });
  };

  // Effect để preload ảnh khi currentIndex thay đổi
  useEffect(() => {
    const indexesToPreload = getImageIndexes(currentIndex);

    // Preload tất cả ảnh cần thiết
    const preloadPromises = indexesToPreload.map((idx) => {
      // Nếu đã load hoặc có lỗi, bỏ qua
      if (loadedImages.has(idx) || errorImages.has(idx)) {
        return Promise.resolve();
      }

      return preloadImage(idx)
        .then(() => {
          setLoadedImages((prev) => new Set(prev).add(idx));
        })
        .catch(() => {
          setErrorImages((prev) => new Set(prev).add(idx));
        });
    });

    Promise.all(preloadPromises).catch(() => {
      // Silent fail - ảnh sẽ vẫn load từ browser cache
    });
  }, [currentIndex, totalCards]);

  // Preload tất cả ảnh khi component mount (optional, cho UX tốt nhất)
  useEffect(() => {
    // Chỉ preload nếu số lượng card không quá nhiều
    if (totalCards <= 10) {
      const allIndexes = Array.from({ length: totalCards }, (_, i) => i);

      allIndexes.forEach((idx) => {
        if (!loadedImages.has(idx) && !errorImages.has(idx)) {
          preloadImage(idx)
            .then(() => {
              setLoadedImages((prev) => new Set(prev).add(idx));
            })
            .catch(() => {
              setErrorImages((prev) => new Set(prev).add(idx));
            });
        }
      });
    }
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
