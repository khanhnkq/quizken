import { useEffect, useRef } from "react";
import gsap from "gsap";

interface UseCountUpOptions {
  duration?: number;
  ease?: string;
  delay?: number;
}

/**
 * Custom hook for animating number counting up with GSAP
 * @param value - Target value to count up to
 * @param options - Animation options (duration, ease, delay)
 * @returns ref to attach to the element displaying the number
 */
export const useCountUp = (value: number, options: UseCountUpOptions = {}) => {
  const { duration = 1.5, ease = "power2.out", delay = 0 } = options;

  const elementRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef({ value: 0 });
  const previousValueRef = useRef(0);

  useEffect(() => {
    if (!elementRef.current) return;

    // Start from previous value instead of 0
    const startValue = previousValueRef.current;
    counterRef.current.value = startValue;

    // Animate counter from current value to target value
    gsap.to(counterRef.current, {
      value: value,
      duration,
      ease,
      delay,
      onUpdate: () => {
        if (elementRef.current) {
          // Format number with commas
          const formatted = Math.round(counterRef.current.value).toLocaleString(
            "vi-VN"
          );
          elementRef.current.textContent = formatted;
        }
      },
      onComplete: () => {
        // Store final value for next animation
        previousValueRef.current = value;
      },
    });
  }, [value, duration, ease, delay]);

  return elementRef;
};
