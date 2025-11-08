import React from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FlipCardProps {
  title?: string;
  subtitle?: string;
  image?: string;
  price?: number | string;
  tags?: string[];
  isDark?: boolean;
  variant?: "default" | "compact" | "image-only";
  isFlipped?: boolean;
  onFlip?: () => void;
  onFavorite?: (fav: boolean) => void;
  className?: string;
  frontContent?: React.ReactNode;
  backContent?: React.ReactNode;
  /**
   * showSubtitle controls rendering of the subtitle area on the front.
   * Set to false when the caller wants to hide contextual counters like "Thẻ 1 / 10".
   */
  showSubtitle?: boolean;
  /**
   * When autoHeight is true, the card will not use fixed height utilities
   * and will grow/shrink to fit its content (used for expandable flashcard back).
   */
  autoHeight?: boolean;
  "aria-label"?: string;
}

/**
 * Reusable FlipCard component inspired by sample-ui FlightCard.
 * - Supports front/back (3D flip), favorite toggle, variants.
 * - Accessible: clickable + keyboard (Enter/Space).
 */
export const FlipCard: React.FC<FlipCardProps> = ({
  title,
  subtitle,
  image,
  price,
  tags = [],
  isDark = false,
  variant = "default",
  isFlipped,
  onFlip,
  onFavorite,
  className,
  frontContent,
  backContent,
  showSubtitle = true,
  autoHeight = false,
  ...rest
}) => {
  const [localFlip, setLocalFlip] = React.useState(false);
  const [favorite, setFavorite] = React.useState(false);

  const flipped = typeof isFlipped === "boolean" ? isFlipped : localFlip;

  const handleToggleFlip = (e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    const next = !flipped;
    if (typeof isFlipped !== "boolean") setLocalFlip(next);
    onFlip?.();
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !favorite;
    setFavorite(next);
    onFavorite?.(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggleFlip();
    }
  };

  const baseCardClasses = cn(
    "relative w-full perspective-800 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent/30",
    !autoHeight && !image && "h-72 sm:h-80 md:h-96",
    /* Fixed height when autoHeight is false to avoid layout break */
    autoHeight === false && !image && "h-80 sm:h-96 md:h-[28rem]",
    /* When image is provided, use aspect ratio to maintain image proportions */
    image && "aspect-[591/1004] max-w-xs mx-auto w-full"
  );

  return (
    <div
      className={cn(baseCardClasses, className)}
      onClick={handleToggleFlip}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={rest["aria-label"] ?? title ?? "Flip card"}>
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-700 transform-style-preserve-3d",
          flipped && "rotate-y-180"
        )}
        style={{ transformStyle: "preserve-3d" }}>
        {/* Front */}
        <div
          className={cn(
            "absolute inset-0 rounded-lg overflow-hidden backface-hidden flex flex-col border-4 border-solid border-gray-300 shadow-xl",
            variant === "image-only"
              ? "bg-transparent"
              : isDark
              ? "bg-gradient-to-br from-black/45 via-black/35 to-black/65 border-card text-card-foreground"
              : "bg-gradient-to-br from-white/95 to-[#ECF2F7] text-foreground border-border"
          )}
          style={
            image
              ? {
                  backgroundImage: `url(${image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }
              : undefined
          }>
          {image && <div className={cn("absolute inset-0")} />}

          <div className="p-4 flex-1 flex flex-col justify-between relative z-10">
            <div className="mb-8">
              {title && (
                <h3
                  className={cn(
                    "text-base font-semibold mb-1 mt-20 whitespace-pre-line break-words",
                    isDark ? "text-white" : "text-foreground"
                  )}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p
                  className={cn(
                    "text-sm",
                    isDark ? "text-white/70" : "text-muted-foreground"
                  )}>
                  {subtitle}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 mt-3">
              <div className="flex items-center gap-2">
                {price != null && (
                  <span
                    className={cn(
                      "font-semibold",
                      isDark ? "text-white" : "text-foreground"
                    )}>
                    {typeof price === "number" ? `$${price}` : price}
                  </span>
                )}
                <div className="flex gap-2 flex-wrap">
                  {tags.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className={cn(
                        "text-xs px-2 py-1 rounded-full border",
                        isDark
                          ? "bg-white/6 text-white/90 border-white/10"
                          : "bg-muted/5 text-muted-foreground border-muted/20"
                      )}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className={cn(
            "absolute inset-0 rounded-lg overflow-hidden backface-hidden rotate-y-180 p-4 flex flex-col border-4 border-gray-300 shadow-xl",
            isDark
              ? "bg-gradient-to-br from-black/45 via-black/35 to-black/65 border-card/40 text-card-foreground"
              : "bg-gradient-to-br from-white/95 to-[#ECF2F7] text-foreground border-border/60"
          )}>
          <div className="flex-1">
            {backContent ? (
              backContent
            ) : (
              <>
                {title && (
                  <h4 className="text-base font-semibold mb-2">{title}</h4>
                )}
                <div className="text-sm text-muted-foreground mb-3">
                  {subtitle}
                </div>
                <div className="text-sm leading-relaxed">
                  {/* place for rich answer/explanation */}
                </div>
              </>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">More details</div>
            <div className="flex items-center gap-2">
              <Button
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleToggleFlip();
                }}
                variant="ghost"
                className="h-8 px-3 text-sm">
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
