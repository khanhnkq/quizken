import React, { createContext, useContext } from "react";
import { useSound, type SoundType } from "@/hooks/useSound";

export type SoundContextValue = {
  play: (
    soundType: SoundType,
    options?: { volume?: number; playbackRate?: number }
  ) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  volume: number;
  setVolumeLevel: (level: number) => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const sound = useSound();
  return (
    <SoundContext.Provider value={sound}>{children}</SoundContext.Provider>
  );
};

export const useAudio = () => {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    throw new Error("useAudio must be used within a SoundProvider");
  }
  return ctx;
};

export default SoundProvider;
