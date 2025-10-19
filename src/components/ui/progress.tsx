import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  const isIndeterminate = value === undefined || value === null;

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary/80",
        "shadow-inner",
        className
      )}
      data-state={isIndeterminate ? "indeterminate" : "determinate"}
      {...props}>
      {isIndeterminate ? (
        <div className="absolute inset-0">
          <div
            className={cn(
              "absolute left-0 top-0 h-full w-1/3 rounded-full",
              // Smooth green gradient + glow
              "bg-[linear-gradient(to_right,#B5CC89,#98b66e)]",
              "animate-progress-indeterminate",
              "shadow-[0_0_12px_rgba(181,204,137,0.55)]"
            )}>
            {/* Subtle diagonal stripes overlay */}
            <div className="absolute inset-0 rounded-full progress-stripes" />
          </div>
        </div>
      ) : (
        <ProgressPrimitive.Indicator
          className={cn(
            "relative h-full w-full flex-1 rounded-full",
            "bg-[linear-gradient(to_right,#B5CC89,#98b66e)]",
            "transition-all duration-500 ease-out",
            "shadow-[0_0_10px_rgba(181,204,137,0.45)]"
          )}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}>
          {/* Shimmer highlight */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full opacity-40 [background:radial-gradient(ellipse_at_top,rgba(255,255,255,0.35),transparent_60%)]"
          />
        </ProgressPrimitive.Indicator>
      )}
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
