import React from 'react';
import { cn } from '@/lib/utils';

interface SpriteAnimatorProps {
  src: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  fps?: number;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}

/**
 * SpriteAnimator Component
 * Dùng để hiển thị Sprite Sheet từ itch.io bằng CSS Animation
 */
export const SpriteAnimator: React.FC<SpriteAnimatorProps> = ({
  src,
  frameWidth,
  frameHeight,
  frameCount,
  fps = 12,
  loop = true,
  autoplay = true,
  className,
}) => {
  const duration = frameCount / fps;
  const animationName = `sprite-anim-${src.replace(/[^a-z0-9]/gi, '')}`;

  return (
    <div
      className={cn("overflow-hidden inline-block", className)}
      style={{
        width: frameWidth,
        height: frameHeight,
      }}
    >
      <style>{`
        @keyframes ${animationName} {
          from { background-position: 0px 0px; }
          to { background-position: -${frameWidth * frameCount}px 0px; }
        }
      `}</style>
      <div
        style={{
          width: frameWidth,
          height: frameHeight,
          backgroundImage: `url(${src})`,
          backgroundSize: `${frameWidth * frameCount}px ${frameHeight}px`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
          animation: autoplay 
            ? `${animationName} ${duration}s steps(${frameCount}) ${loop ? 'infinite' : 'forwards'}` 
            : 'none'
        }}
      />
    </div>
  );
};
