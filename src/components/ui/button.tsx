import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { gsap } from "gsap";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-2 border-foreground bg-transparent text-foreground hover:bg-primary hover:text-primary-foreground hover:border-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-foreground text-background hover:bg-black hover:text-white border-2 border-transparent hover:border-primary shadow-lg font-semibold",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const handleEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      onMouseEnter?.(e);
      const el = e.currentTarget;
      gsap.to(el, {
        y: -2,
        scale: 1.04,
        boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
        duration: 0.18,
        ease: "power3.out",
      });
    };

    const handleLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      onMouseLeave?.(e);
      const el = e.currentTarget;
      gsap.to(el, {
        y: 0,
        scale: 1,
        boxShadow: "0 0 0 rgba(0,0,0,0)",
        duration: 0.22,
        ease: "power3.inOut",
      });
    };

    const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
      onFocus?.(e);
      const el = e.currentTarget;
      gsap.to(el, {
        y: -2,
        scale: 1.04,
        boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
        duration: 0.18,
        ease: "power3.out",
      });
    };

    const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
      onBlur?.(e);
      const el = e.currentTarget;
      gsap.to(el, {
        y: 0,
        scale: 1,
        boxShadow: "0 0 0 rgba(0,0,0,0)",
        duration: 0.22,
        ease: "power3.inOut",
      });
    };


    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
