import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ThemeTransitionOverlayProps {
    isActive: boolean;
    origin?: { x: number; y: number } | null;
    themeColor?: string; // e.g. "bg-pink-500" or hex
    onComplete?: () => void;
}

export function ThemeTransitionOverlay({ 
    isActive, 
    origin, 
    themeColor = "#8b5cf6", // Default violet
    onComplete 
}: ThemeTransitionOverlayProps) {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isActive) {
            setIsAnimating(true);
        }
    }, [isActive]);

    // Cleanup after animation completes
    const handleAnimationComplete = () => {
        setIsAnimating(false);
        onComplete?.();
    };

    if (!isAnimating && !isActive) return null;

    // Expand logic
    // We want the circle to cover the screen. 150vw/vh should be plenty.
    // Origin comes from the button click event (clientX, clientY)
    
    const x = origin?.x ?? window.innerWidth / 2;
    const y = origin?.y ?? 64; // Default to approx navbar height

    return createPortal(
        <AnimatePresence>
            {isActive && (
                <motion.div
                    key="overlay"
                    initial={{ 
                        clipPath: `circle(0% at ${x}px ${y}px)`,
                    }}
                    animate={{ 
                        clipPath: `circle(150% at ${x}px ${y}px)`,
                    }}
                    exit={{ 
                        clipPath: `circle(0% at ${x}px ${y}px)`,
                        transition: { duration: 1, ease: "easeInOut" }
                    }}
                    transition={{ 
                        clipPath: { duration: 1, ease: [0.16, 1, 0.3, 1] },
                    }}
                    onAnimationComplete={handleAnimationComplete}
                    className="fixed inset-0 z-[100] pointer-events-none"
                    style={{ 
                        // Optical Shockwave: No solid color, just pure light distortion
                        backdropFilter: "brightness(1.5) contrast(1.2) blur(8px)",
                        background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)",
                        mixBlendMode: 'plus-lighter'
                    }}
                />
            )}
            {/* Impact Flash Layer */}
            {isActive && (
                <motion.div
                    key="flash"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.4, delay: 0.2, ease: "easeInOut" }}
                    className="fixed inset-0 z-[101] bg-white pointer-events-none mix-blend-overlay"
                />
            )}
        </AnimatePresence>,
        document.body
    );
}
