import { cn } from "@/lib/utils";

// --- NEON THEME ICONS ---
export const NeonBoltIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={cn("w-full h-auto", className)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

export const NeonCyberSkullIcon = ({ className }: { className?: string }) => (
   <svg viewBox="0 0 100 100" className={cn("w-full h-auto", className)} fill="none" stroke="currentColor" strokeWidth="4">
      <path d="M50 10 C 30 10, 15 25, 15 50 C 15 70, 30 90, 50 90 C 70 90, 85 70, 85 50 C 85 25, 70 10, 50 10" />
      <circle cx="35" cy="40" r="8" fill="currentColor" fillOpacity="0.5" />
      <circle cx="65" cy="40" r="8" fill="currentColor" fillOpacity="0.5" />
      <path d="M40 70 H60" strokeWidth="4" />
      <path d="M45 65 V75 M55 65 V75" strokeWidth="2" />
      <path d="M85 50 H95 M5 50 H15" />
   </svg>
);

// --- PASTEL THEME ICONS ---
export const PastelCloudIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={cn("w-full h-auto", className)} fill="currentColor">
    <path d="M17.5 19C19.9853 19 22 16.9853 22 14.5C22 12.132 20.177 10.244 17.819 10.034C17.657 6.657 14.812 4 11.5 4C8.401 4 5.694 6.321 5.23 9.38C2.866 9.761 1 11.957 1 14.5C1 17.538 3.462 20 6.5 20H17.5V19Z" />
  </svg>
);

export const PastelHeartIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={cn("w-full h-auto", className)} fill="currentColor">
    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" />
  </svg>
);

// --- COMIC THEME ICONS ---
export const ComicPowIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-auto", className)} fill="currentColor">
     {/* Jagged Explosion Shape */}
     <path d="M50 0 L60 25 L85 10 L80 35 L100 50 L75 60 L90 85 L65 75 L50 100 L40 75 L10 85 L30 60 L0 50 L30 40 L10 15 L40 25 Z" />
     <text x="50" y="60" fontSize="20" fontWeight="900" textAnchor="middle" fill="white" stroke="black" strokeWidth="1">POW!</text>
  </svg>
);

export const ComicBoomIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-auto", className)} fill="currentColor">
     {/* Starburst Shape */}
     <path d="M50 10 L60 35 L90 30 L70 55 L90 80 L60 70 L50 95 L40 70 L10 80 L30 55 L10 30 L40 35 Z" />
     <text x="50" y="60" fontSize="18" fontWeight="900" textAnchor="middle" fill="white" stroke="black" strokeWidth="1">BOOM</text>
  </svg>
);
