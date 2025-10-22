import { useContext } from "react";
import { ChillMusicContext } from "@/contexts/ChillMusicContext";

/**
 * useChillMusic()
 * Trả về state và hàm điều khiển từ ChillMusicProvider (toàn cục).
 * Yêu cầu bọc ứng dụng bằng ChillMusicProvider.
 */
export function useChillMusic() {
  const ctx = useContext(ChillMusicContext);
  if (!ctx) {
    throw new Error("useChillMusic must be used within a ChillMusicProvider");
  }
  return ctx;
}

export default useChillMusic;
