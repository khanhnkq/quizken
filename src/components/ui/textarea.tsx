import * as React from "react";

import { cn } from "@/lib/utils";
import {
  sanitizeVietnameseBadwords,
  maskEntireTextIfContains,
} from "@/lib/vnBadwordsFilter";

export type TextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    /**
     * When true, the component will sanitize bad words on every change
     * by replacing them with the maskChar.
     */
    sanitizeOnChange?: boolean;
    /**
     * Character used to mask matched badwords (default '*')
     */
    maskChar?: string;
    /**
     * When true, if any badword is detected the entire input is masked
     * (every non-whitespace character replaced with maskChar).
     */
    maskWholeIfSensitive?: boolean;
  };

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      sanitizeOnChange = false,
      maskChar = "*",
      maskWholeIfSensitive = true,
      onChange,
      ...props
    },
    ref
  ) => {
    const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
      const val = e.currentTarget.value;

      if (sanitizeOnChange) {
        // If entire-text masking mode is enabled and the input contains any badword,
        // mask the whole input instead of partially sanitizing.
        if (
          maskWholeIfSensitive &&
          maskEntireTextIfContains(val, maskChar) !== val
        ) {
          const fullMask = maskEntireTextIfContains(val, maskChar);
          // update DOM
          e.currentTarget.value = fullMask;
          if (onChange) {
            const syntheticEvent = {
              ...e,
              currentTarget: { ...e.currentTarget, value: fullMask },
              target: { ...e.target, value: fullMask },
            } as unknown as React.ChangeEvent<HTMLTextAreaElement>;
            onChange(syntheticEvent);
            return;
          }
        }

        const sanitized = sanitizeVietnameseBadwords(val, maskChar);
        if (sanitized !== val) {
          // debug: log original vs sanitized to help diagnose multi-word cases
          // eslint-disable-next-line no-console
          console.debug("[Textarea] sanitize", { val, sanitized });
          // For uncontrolled inputs, updating the DOM value is enough.
          e.currentTarget.value = sanitized;
          // For controlled inputs (parent provides `value`), forward a synthetic
          // event with the sanitized value so the parent state receives the cleaned text.
          if (onChange) {
            const syntheticEvent = {
              ...e,
              currentTarget: { ...e.currentTarget, value: sanitized },
              target: { ...e.target, value: sanitized },
            } as unknown as React.ChangeEvent<HTMLTextAreaElement>;
            onChange(syntheticEvent);
            return;
          }
        }
      }

      if (onChange) {
        onChange(e);
      }
    };

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
