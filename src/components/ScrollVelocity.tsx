import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";

interface ScrollVelocityContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ScrollVelocityContainer({
  children,
  className,
}: ScrollVelocityContainerProps) {
  return (
    <div
      className={`relative flex w-full flex-col items-center justify-center overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

interface ScrollVelocityRowProps {
  children: string;
  baseVelocity?: number;
  direction?: number;
  rowIndex?: number;
  paused?: boolean;
}

export function ScrollVelocityRow({
  children,
  baseVelocity = 10, // Faster base velocity
  direction = 1,
  rowIndex = 0,
  paused = false,
}: ScrollVelocityRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  // Auto-play seamless infinite animation using GSAP
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const alternatingDirection = rowIndex % 2 === 0 ? 1 : -1; // Even rows (0,2,4...) right, Odd rows (1,3,5...) left

    // Create seamless infinite scroll using GSAP
    tweenRef.current = gsap.to(element, {
      x: alternatingDirection * (-window.innerWidth / 2),
      duration: baseVelocity / 8, // Fast smooth movement
      ease: "none", // Linear movement for GSAP
      repeat: -1, // Infinite repeat
      yoyo: false, // No back-and-forth, unidirectional flow
    });

    return () => {
      gsap.killTweensOf(element);
      tweenRef.current = null;
    };
  }, [baseVelocity, rowIndex]);

  // Pause / resume animation based on prop
  useEffect(() => {
    const tween = tweenRef.current;
    if (!tween) return;
    if (paused) tween.pause();
    else tween.resume();
  }, [paused]);

  const duplicatedChildren = [...Array(5)].map((_, i) => (
    <span key={i} className="inline-block whitespace-nowrap px-4">
      {children}
    </span>
  ));

  return (
    <div ref={containerRef} className="flex whitespace-nowrap">
      {duplicatedChildren}
    </div>
  );
}
