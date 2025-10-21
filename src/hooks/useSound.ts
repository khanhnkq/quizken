import { useCallback, useState, useEffect } from 'react';

// Import sound files
import clickSound from '@/assets/sounds/click.wav';
import successSound from '@/assets/sounds/success.wav';
import alertSound from '@/assets/sounds/alert.wav';
import notificationSound from '@/assets/sounds/nofication.wav';
import popSound from '@/assets/sounds/pop.wav';
import toggleSound from '@/assets/sounds/toggle.wav';

export type SoundType = 'click' | 'success' | 'alert' | 'notification' | 'pop' | 'toggle';

interface SoundOptions {
  volume?: number;
  playbackRate?: number;
}

// Sound file mapping
const SOUNDS: Record<SoundType, string> = {
  click: clickSound,
  success: successSound,
  alert: alertSound,
  notification: notificationSound,
  pop: popSound,
  toggle: toggleSound,
};

// Audio pool for better performance - reuse Audio objects
const audioPool = new Map<string, HTMLAudioElement>();

/**
 * Custom hook for playing sound effects
 * Manages sound enabled state and volume with localStorage persistence
 */
export const useSound = () => {
  // Load sound enabled preference from localStorage
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('soundEnabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Load volume preference from localStorage
  const [volume, setVolume] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('soundVolume');
      return saved !== null ? parseFloat(saved) : 0.5;
    } catch {
      return 0.5;
    }
  });

  // Preload all sounds on mount
  useEffect(() => {
    if (soundEnabled) {
      Object.entries(SOUNDS).forEach(([name, src]) => {
        if (!audioPool.has(name)) {
          const audio = new Audio(src);
          audio.preload = 'auto';
          audioPool.set(name, audio);
        }
      });
    }
  }, [soundEnabled]);

  /**
   * Play a sound effect
   * @param soundType - Type of sound to play
   * @param options - Optional volume and playback rate overrides
   */
  const play = useCallback(
    (soundType: SoundType, options?: SoundOptions) => {
      if (!soundEnabled) return;

      try {
        // Get or create audio from pool
        let audio = audioPool.get(soundType);
        
        if (!audio) {
          audio = new Audio(SOUNDS[soundType]);
          audioPool.set(soundType, audio);
        }

        // Reset to start and configure
        audio.currentTime = 0;
        audio.volume = options?.volume ?? volume;
        audio.playbackRate = options?.playbackRate ?? 1;

        // Play the sound
        audio.play().catch((error) => {
          console.warn('Sound play failed:', error);
        });
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    },
    [soundEnabled, volume]
  );

  /**
   * Toggle sound on/off and persist to localStorage
   */
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const newValue = !prev;
      try {
        localStorage.setItem('soundEnabled', JSON.stringify(newValue));
      } catch (error) {
        console.error('Failed to save sound preference:', error);
      }
      return newValue;
    });
  }, []);

  /**
   * Set volume level (0-1) and persist to localStorage
   */
  const setVolumeLevel = useCallback((level: number) => {
    const clampedLevel = Math.max(0, Math.min(1, level));
    setVolume(clampedLevel);
    try {
      localStorage.setItem('soundVolume', clampedLevel.toString());
    } catch (error) {
      console.error('Failed to save volume preference:', error);
    }
  }, []);

  return {
    play,
    soundEnabled,
    toggleSound,
    volume,
    setVolumeLevel,
  };
};
