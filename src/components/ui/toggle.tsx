import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { useAudio } from "@/contexts/SoundContext";

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type BaseToggleProps = React.ComponentPropsWithoutRef<
  typeof TogglePrimitive.Root
> &
  VariantProps<typeof toggleVariants>;
type SoundedToggleProps = BaseToggleProps & {
  sound?: "toggle" | false;
  soundVolume?: number;
};

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  SoundedToggleProps
>(
  (
    {
      className,
      variant,
      size,
      sound = "toggle",
      soundVolume,
      onPointerDown,
      ...props
    },
    ref
  ) => {
    const { play } = useAudio();

    const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
      onPointerDown?.(e);
      if (sound === false) return;
      play(
        "toggle",
        soundVolume !== undefined ? { volume: soundVolume } : undefined
      );
    };

    return (
      <TogglePrimitive.Root
        ref={ref}
        className={cn(toggleVariants({ variant, size, className }))}
        onPointerDown={handlePointerDown}
        {...props}
      />
    );
  }
);

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
