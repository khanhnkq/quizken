import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
  duration?: number;
}

export const Confetti: React.FC<ConfettiProps> = ({ duration = 3000 }) => {
  useEffect(() => {
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();

    return () => {
      confetti.reset();
    };
  }, [duration]);

  return null; // This component doesn't render any DOM elements, it just runs the effect
};
