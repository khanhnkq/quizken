import React, { useMemo } from "react";
import {
    Cat,
    Dog,
    Rabbit,
    Bird,
    Fish,
    Turtle,
    Snail,
    Squirrel,
    Bug,
    Rat,
    PawPrint,
    Circle,
    Square,
    Triangle,
    Hexagon,
    Star,
    Cloud,
    Moon,
    Sun,
    Zap,
} from "lucide-react";

interface BackgroundElement {
    Icon: React.ElementType;
    color: string;
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
    rot: string;
    delay: string;
    size?: string;
}

export const BackgroundDecorations = ({ density = "high" }: { density?: "high" | "medium" | "low" }) => {
    // Memoize the elements so they don't re-calculate on every render
    const elements: BackgroundElement[] = useMemo(
        () => {
            const allElements = [
                // --- Top Left Area ---
                { Icon: Cat, color: "text-orange-400", top: "5%", left: "5%", rot: "-10deg", delay: "0ms" },
                { Icon: Cloud, color: "text-blue-200", top: "15%", left: "15%", rot: "0deg", delay: "5000ms", size: "w-12 h-12" }, // Object/Cloud
                { Icon: Bug, color: "text-lime-500", top: "2%", left: "20%", rot: "15deg", delay: "2000ms" },
                { Icon: Circle, color: "text-purple-200", top: "25%", left: "8%", rot: "0deg", delay: "3000ms", size: "w-4 h-4" }, // Pattern/Object

                // --- Top Right Area ---
                { Icon: Dog, color: "text-amber-600", top: "8%", right: "15%", rot: "10deg", delay: "2000ms" },
                { Icon: Sun, color: "text-yellow-400", top: "5%", right: "5%", rot: "0deg", delay: "4000ms", size: "w-10 h-10" }, // Object/Sun
                { Icon: Rat, color: "text-gray-500", top: "3%", right: "25%", rot: "-8deg", delay: "1000ms" },
                { Icon: Star, color: "text-yellow-300", top: "15%", right: "20%", rot: "45deg", delay: "1500ms", size: "w-6 h-6" }, // Object

                // --- Left Side (Vertical) ---
                { Icon: Turtle, color: "text-emerald-500", top: "40%", left: "3%", rot: "12deg", delay: "500ms" },
                { Icon: Square, color: "text-pink-200", top: "48%", left: "12%", rot: "15deg", delay: "2500ms", size: "w-5 h-5" }, // Object
                { Icon: Snail, color: "text-rose-400", top: "55%", left: "8%", rot: "-8deg", delay: "2500ms" },
                { Icon: Fish, color: "text-indigo-400", top: "70%", left: "4%", rot: "8deg", delay: "3500ms" },

                // --- Right Side (Vertical) ---
                { Icon: Bird, color: "text-teal-400", top: "35%", right: "6%", rot: "-15deg", delay: "1200ms" },
                { Icon: Triangle, color: "text-blue-300", top: "45%", right: "12%", rot: "30deg", delay: "1800ms", size: "w-6 h-6" }, // Object
                { Icon: Cat, color: "text-yellow-500", top: "60%", right: "10%", rot: "10deg", delay: "2800ms" },
                { Icon: Bug, color: "text-red-400", top: "80%", right: "5%", rot: "-5deg", delay: "800ms" },

                // --- Bottom Left Area ---
                { Icon: Rabbit, color: "text-purple-400", bottom: "15%", left: "10%", rot: "5deg", delay: "4000ms" },
                { Icon: Hexagon, color: "text-orange-200", bottom: "20%", left: "5%", rot: "10deg", delay: "3500ms", size: "w-8 h-8" }, // Object
                { Icon: Rat, color: "text-zinc-500", bottom: "5%", left: "22%", rot: "-10deg", delay: "1500ms" },
                { Icon: PawPrint, color: "text-amber-300", bottom: "2%", left: "5%", rot: "15deg", delay: "500ms" },

                // --- Bottom Right Area ---
                { Icon: Dog, color: "text-amber-700", bottom: "10%", right: "20%", rot: "8deg", delay: "3000ms" },
                { Icon: Moon, color: "text-indigo-300", bottom: "20%", right: "5%", rot: "-15deg", delay: "5000ms", size: "w-8 h-8" }, // Object
                { Icon: Snail, color: "text-orange-300", bottom: "3%", right: "12%", rot: "-12deg", delay: "1800ms" },
                { Icon: Squirrel, color: "text-amber-500", bottom: "20%", right: "8%", rot: "15deg", delay: "4200ms" },

                // --- Extras / Fillers ---
                { Icon: PawPrint, color: "text-slate-400", top: "15%", left: "80%", rot: "20deg", delay: "3000ms" },
                { Icon: Zap, color: "text-yellow-400", top: "85%", left: "50%", rot: "10deg", delay: "200ms", size: "w-6 h-6" }, // Object/Zap
                { Icon: Fish, color: "text-blue-500", bottom: "25%", left: "85%", rot: "-5deg", delay: "3200ms" },

                // --- Dense Fillers (New Batch) ---
                // Top Area Fillers
                { Icon: Circle, color: "text-blue-100", top: "8%", left: "30%", rot: "0deg", delay: "1200ms", size: "w-3 h-3" },
                { Icon: Star, color: "text-yellow-200", top: "12%", left: "45%", rot: "15deg", delay: "4500ms", size: "w-4 h-4" },
                { Icon: Square, color: "text-green-100", top: "5%", left: "65%", rot: "10deg", delay: "2300ms", size: "w-3 h-3" },
                { Icon: Cloud, color: "text-slate-100", top: "18%", left: "75%", rot: "0deg", delay: "3100ms", size: "w-8 h-8" },

                // Middle Area Fillers
                { Icon: Hexagon, color: "text-red-100", top: "35%", left: "15%", rot: "30deg", delay: "1800ms", size: "w-4 h-4" },
                { Icon: Triangle, color: "text-orange-100", top: "42%", left: "88%", rot: "-15deg", delay: "3900ms", size: "w-5 h-5" },
                { Icon: Circle, color: "text-purple-100", top: "50%", left: "5%", rot: "0deg", delay: "2700ms", size: "w-3 h-3" },
                { Icon: Star, color: "text-pink-200", top: "58%", left: "92%", rot: "45deg", delay: "1400ms", size: "w-4 h-4" },

                // Bottom Area Fillers
                { Icon: Square, color: "text-indigo-100", bottom: "28%", left: "35%", rot: "20deg", delay: "3600ms", size: "w-4 h-4" },
                { Icon: Cloud, color: "text-sky-100", bottom: "15%", left: "55%", rot: "0deg", delay: "4200ms", size: "w-8 h-8" },
                { Icon: Triangle, color: "text-teal-100", bottom: "8%", left: "45%", rot: "10deg", delay: "2100ms", size: "w-5 h-5" },
                { Icon: Circle, color: "text-amber-100", bottom: "35%", left: "75%", rot: "0deg", delay: "1600ms", size: "w-3 h-3" },

                // Animal Extras
                { Icon: Cat, color: "text-gray-300", top: "30%", left: "25%", rot: "-5deg", delay: "2900ms", size: "w-6 h-6" },
                { Icon: Dog, color: "text-orange-300", bottom: "40%", right: "30%", rot: "8deg", delay: "1500ms", size: "w-6 h-6" },
                { Icon: Bird, color: "text-blue-300", top: "65%", left: "20%", rot: "-10deg", delay: "3300ms", size: "w-6 h-6" },
                { Icon: Rabbit, color: "text-pink-300", bottom: "45%", left: "10%", rot: "5deg", delay: "2200ms", size: "w-6 h-6" },
            ];

            if (density === "low") {
                // Return ~1/3 of elements
                return allElements.filter((_, i) => i % 3 === 0);
            } else if (density === "medium") {
                // Return ~2/3 of elements
                return allElements.filter((_, i) => i % 3 !== 0);
            }
            // High density: return all
            return allElements;
        },
        [density]
    );

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {/* 1. Dot Pattern Background */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: "radial-gradient(#000000 1.5px, transparent 1.5px)",
                    backgroundSize: "24px 24px"
                }}
            />

            {/* 2. Floating Elements (Icons + Objects) */}
            <div className="hidden lg:block absolute inset-0">
                {elements.map((item, index) => (
                    <div
                        key={index}
                        className={`absolute animate-float transition-transform duration-1000 will-change-transform backface-hidden`}
                        style={{
                            top: item.top,
                            left: item.left,
                            right: item.right,
                            bottom: item.bottom,
                            animationDelay: item.delay,
                            transform: 'translate3d(0,0,0)', // Force GPU layer
                        }}
                    >
                        <div
                            className={`bg-white/60 p-3 rounded-2xl shadow-sm border border-border/20`}
                            style={{ transform: `rotate(${item.rot})` }}
                        >
                            <item.Icon className={`${item.size || "w-8 h-8"} ${item.color}`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
