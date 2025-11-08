import { useState } from "react";
import { Heart, Tag, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export interface FlightDestination {
  city: string;
  flightClass: string;
  price: number;
  airport: string;
  image: string;
  isDark?: boolean;
}

interface FlightCardProps {
  front: FlightDestination;
  back: FlightDestination;
}

export const FlightCard = ({ front, back }: FlightCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const renderSide = (destination: FlightDestination, isBack: boolean) => (
    <div
      className={cn(
        "absolute w-full h-full backface-hidden rounded-[2rem] overflow-hidden shadow-card transition-shadow duration-300 hover:shadow-card-hover",
        isBack && "rotate-y-180"
      )}
    >
      <div className="relative w-full h-full">
        <img
          src={destination.image}
          alt={destination.city}
          className="w-full h-full object-cover"
        />
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-b",
            destination.isDark
              ? "from-overlay-dark/40 via-overlay-dark/50 to-overlay-dark/90"
              : "from-transparent via-overlay-light/5 to-overlay-light/60"
          )}
        />
        
        <button
          onClick={handleFavorite}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110 z-10"
        >
          <Heart
            className={cn(
              "w-5 h-5 transition-all duration-300",
              isFavorite
                ? "fill-favorite text-favorite"
                : "text-card-foreground/60"
            )}
          />
        </button>

        <div className="absolute inset-x-0 bottom-0 p-6 space-y-4">
          <div>
            <h2
              className={cn(
                "text-4xl font-bold mb-2",
                destination.isDark ? "text-overlay-light" : "text-overlay-dark"
              )}
            >
              {destination.city}
            </h2>
            <p
              className={cn(
                "text-sm",
                destination.isDark
                  ? "text-overlay-light/70"
                  : "text-overlay-dark/60"
              )}
            >
              {destination.flightClass}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Tag
                className={cn(
                  "w-4 h-4",
                  destination.isDark
                    ? "text-overlay-light/70"
                    : "text-overlay-dark/60"
                )}
              />
              <span
                className={cn(
                  "font-semibold",
                  destination.isDark
                    ? "text-overlay-light"
                    : "text-overlay-dark"
                )}
              >
                from ${destination.price}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin
                className={cn(
                  "w-4 h-4",
                  destination.isDark
                    ? "text-overlay-light/70"
                    : "text-overlay-dark/60"
                )}
              />
              <span
                className={cn(
                  "font-medium",
                  destination.isDark
                    ? "text-overlay-light/70"
                    : "text-overlay-dark/60"
                )}
              >
                {destination.airport}
              </span>
            </div>
          </div>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              console.log("Search flight to", destination.city);
            }}
            variant={destination.isDark ? "default" : "secondary"}
            className="w-full h-12 rounded-full text-base font-medium"
          >
            Search flight
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div
      onClick={handleFlip}
      className="relative w-full max-w-sm h-[600px] cursor-pointer perspective-1000"
      style={{ perspective: "1000px" }}
    >
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-700 preserve-3d",
          isFlipped && "rotate-y-180"
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        {renderSide(front, false)}
        {renderSide(back, true)}
      </div>
    </div>
  );
};
