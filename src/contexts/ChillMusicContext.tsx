import * as React from "react";
import { 
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
 } from "react";
import lofi2 from "@/assets/audio/lofi-2.mp3";

type ChillStatus = "idle" | "playing" | "paused" | "stopped" | "error";

type ChillMusicContextValue = {
  isPlaying: boolean;
  status: ChillStatus;
  volume: number;
  toggle: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  setVolume: (v: number) => void;
};

export const ChillMusicContext = createContext<ChillMusicContextValue | null>(
  null
);

export function ChillMusicProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState<ChillStatus>("idle");
  const [volume, setVolumeState] = useState(0.35);

  // Khởi tạo 1 lần
  useEffect(() => {
    const audio = new Audio(lofi2);
    audio.preload = "auto";
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    const onPlay = () => {
      setIsPlaying(true);
      setStatus("playing");
    };
    const onPause = () => {
      setIsPlaying(false);
      setStatus(audio.currentTime > 0 ? "paused" : "stopped");
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    // Tự động tạm dừng khi có media khác phát
    const handleOtherAudioPlay = (e: Event) => {
      const target = e.target as HTMLMediaElement | null;
      if (
        target &&
        audioRef.current &&
        target !== audioRef.current &&
        !target.muted &&
        !target.paused
      ) {
        try {
          audioRef.current.pause();
        } catch {
          // no-op
        }
        setIsPlaying(false);
        setStatus("paused");
      }
    };
    document.addEventListener("play", handleOtherAudioPlay, true);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      document.removeEventListener("play", handleOtherAudioPlay, true);
      try {
        audio.pause();
      } catch {
        // ignore
      }
      audioRef.current = null;
    };
  }, []);

  // Đồng bộ thay đổi volume lên phần tử audio khi volume state đổi sau khi init
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const play = useCallback(async () => {
    try {
      if (!audioRef.current) return;
      await audioRef.current.play();
      setIsPlaying(true);
      setStatus("playing");
    } catch (err) {
      console.error("ChillMusicProvider.play() failed:", err);
      setIsPlaying(false);
      setStatus("error");
      throw err;
    }
  }, []);

  const pause = useCallback(() => {
    try {
      if (!audioRef.current) return;
      audioRef.current.pause();
      setIsPlaying(false);
      setStatus("paused");
    } catch (err) {
      console.error("ChillMusicProvider.pause() failed:", err);
    }
  }, []);

  const toggle = useCallback(async () => {
    if (isPlaying) {
      pause();
      return;
    }
    await play();
  }, [isPlaying, pause, play]);

  const stop = useCallback(() => {
    try {
      if (!audioRef.current) return;
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setStatus("stopped");
    } catch (err) {
      console.error("ChillMusicProvider.stop() failed:", err);
    }
  }, []);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
  }, []);

  const value = useMemo<ChillMusicContextValue>(
    () => ({
      isPlaying,
      status,
      volume,
      toggle,
      pause,
      stop,
      setVolume,
    }),
    [isPlaying, status, volume, toggle, pause, stop, setVolume]
  );

  return (
    <ChillMusicContext.Provider value={value}>
      {children}
    </ChillMusicContext.Provider>
  );
}

export default ChillMusicProvider;
