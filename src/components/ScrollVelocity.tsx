import React, { useRef, useEffect } from "react";
import {
  motion,
  useMotionValue,
  animate,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";

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
  const x = useMotionValue(0);

  // Auto-play animation with alternating directions per row (even rows right, odd rows left)
  useEffect(() => {
    const alternatingDirection = rowIndex % 2 === 0 ? 1 : -1; // Even rows (0,2,4...) right, Odd rows (1,3,5...) left
    const velocity = baseVelocity * 3; // Gradual speed increase per row

    animate(x, alternatingDirection * (-window.innerWidth / 2), {
      duration: baseVelocity / 8, // Fast smooth movement
      repeat: Infinity,
      ease: "linear",
      repeatType: "loop", // No reverse, continuous unidirectional flow
    });

    return () => {
      x.stop();
    };
  }, [x, baseVelocity, rowIndex]);

  const duplicatedChildren = [...Array(5)].map((_, i) => (
    <span key={i} className="inline-block whitespace-nowrap px-4">
      {children}
    </span>
  ));

  return (
    <motion.div style={{ x: x }} className="flex whitespace-nowrap">
      {duplicatedChildren}
    </motion.div>
  );
}
