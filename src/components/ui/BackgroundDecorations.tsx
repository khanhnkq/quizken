import React, { useMemo } from "react";
import {
    Cat,
    Dog,
    Rabbit,
    Bird,
    PawPrint,
    Star,
    Cloud,
} from "lucide-react";

interface BackgroundElement {
    Icon: React.ElementType;
    color: string;
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
    rot: string;
    size?: string;
}

export const BackgroundDecorations = () => {
    // Reduced to 12 strategic elements for better performance
    const elements: BackgroundElement[] = useMemo(
        () => [
            // Top Left
            { Icon: Cat, color: "text-orange-300", top: "8%", left: "5%", rot: "-10deg" },
            { Icon: Cloud, color: "text-blue-200", top: "20%", left: "15%", rot: "0deg", size: "w-10 h-10" },

            // Top Right
            { Icon: Dog, color: "text-amber-400", top: "10%", right: "8%", rot: "8deg" },
            { Icon: Star, color: "text-yellow-300", top: "5%", right: "20%", rot: "15deg", size: "w-5 h-5" },

            // Left Side
            { Icon: Bird, color: "text-teal-300", top: "45%", left: "3%", rot: "-12deg" },
            { Icon: PawPrint, color: "text-amber-200", top: "65%", left: "8%", rot: "10deg", size: "w-6 h-6" },

            // Right Side  
            { Icon: Rabbit, color: "text-purple-300", top: "40%", right: "5%", rot: "10deg" },
            { Icon: Cat, color: "text-gray-300", top: "70%", right: "10%", rot: "-8deg" },

            // Bottom Left
            { Icon: Dog, color: "text-amber-300", bottom: "15%", left: "10%", rot: "5deg" },
            { Icon: Star, color: "text-pink-200", bottom: "8%", left: "25%", rot: "20deg", size: "w-4 h-4" },

            // Bottom Right
            { Icon: Bird, color: "text-blue-300", bottom: "20%", right: "15%", rot: "-10deg" },
            { Icon: PawPrint, color: "text-slate-300", bottom: "5%", right: "8%", rot: "15deg" },
        ],
        []
    );

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {/* Dot Pattern Background */}
            <div className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: "radial-gradient(#000000 1px, transparent 1px)",
                    backgroundSize: "32px 32px"
                }}
            />

            {/* Floating Elements - Desktop Only, Reduced Count */}
            <div className="hidden lg:block absolute inset-0">
                {elements.map((item, index) => (
                    <div
                        key={index}
                        className="absolute opacity-60 transition-opacity duration-300"
                        style={{
                            top: item.top,
                            left: item.left,
                            right: item.right,
                            bottom: item.bottom,
                        }}
                    >
                        <div
                            className="bg-white/50 p-2.5 rounded-xl shadow-sm border border-white/30"
                            style={{ transform: `rotate(${item.rot})` }}
                        >
                            <item.Icon className={`${item.size || "w-6 h-6"} ${item.color}`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

