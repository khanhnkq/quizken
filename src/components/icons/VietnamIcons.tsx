import { cn } from "@/lib/utils";

export const VietnamMapIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 200" className={cn("w-full h-auto", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Stylized S-Shape Map */}
    <path d="M30 10 C 50 10, 70 30, 60 50 C 50 70, 30 80, 40 100 C 50 120, 60 140, 50 160 C 40 180, 20 190, 30 200" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
    <circle cx="70" cy="40" r="5" fill="currentColor" className="text-yellow-400" /> {/* Paracel Islands representation */}
    <circle cx="80" cy="170" r="5" fill="currentColor" className="text-yellow-400" /> {/* Spratly Islands representation */}
  </svg>
);

export const VietnamStarIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-auto", className)} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 0L61.23 34.55H97.55L68.16 55.9L79.39 90.45L50 69.1L20.61 90.45L31.84 55.9L2.45 34.55H38.77L50 0Z" />
  </svg>
);

export const VietnamDrumIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-auto", className)} fill="none" stroke="currentColor" strokeWidth="4" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" />
    <circle cx="50" cy="50" r="10" fill="currentColor" />
    <path d="M50 15 L50 35 M50 65 L50 85 M15 50 L35 50 M65 50 L85 50" strokeWidth="4" />
    <path d="M25 25 L38 38 M62 62 L75 75 M75 25 L62 38 M38 62 L25 75" strokeWidth="4" />
  </svg>
);

export const VietnamLotusIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 80" className={cn("w-full h-auto", className)} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
     <path d="M50 10 C 50 10, 30 40, 10 50 C 30 60, 50 70, 50 70 C 50 70, 70 60, 90 50 C 70 40, 50 10, 50 10 Z" />
     <path d="M40 70 C 40 70, 20 60, 0 50 C 20 40, 40 70, 40 70 Z" opacity="0.7" />
     <path d="M60 70 C 60 70, 80 60, 100 50 C 80 40, 60 70, 60 70 Z" opacity="0.7" />
  </svg>
);
