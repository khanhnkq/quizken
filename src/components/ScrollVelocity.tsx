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
}

export function ScrollVelocityRow({
  children,
  baseVelocity = 10, // Faster base velocity
  direction = 1,
  rowIndex = 0,
}: ScrollVelocityRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-play seamless infinite animation using GSAP
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const alternatingDirection = rowIndex % 2 === 0 ? 1 : -1; // Even rows (0,2,4...) right, Odd rows (1,3,5...) left
    const velocity = baseVelocity * 3; // Gradual speed increase per row

    // Create seamless infinite scroll using GSAP
    gsap.to(element, {
      x: alternatingDirection * (-window.innerWidth / 2),
      duration: baseVelocity / 8, // Fast smooth movement
      ease: "none", // Linear movement for GSAP
      repeat: -1, // Infinite repeat
      yoyo: false, // No back-and-forth, unidirectional flow
    });

    return () => {
      gsap.killTweensOf(element);
    };
  }, [baseVelocity, rowIndex]);

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
