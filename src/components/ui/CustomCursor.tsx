import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
}

export const CustomCursor = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [particles, setParticles] = useState<Particle[]>([]);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const requestRef = useRef<number>();
    const particleIdCounter = useRef(0);

    useEffect(() => {
        // Disable on touch devices
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isMobile = window.innerWidth <= 768;
        if (isTouchDevice || isMobile) return;

        setIsVisible(true);

        const handleMouseMove = (e: MouseEvent) => {
            lastMousePos.current = { x: e.clientX, y: e.clientY };

            // Spawn a particle
            const newParticle: Particle = {
                id: particleIdCounter.current++,
                x: e.clientX,
                y: e.clientY,
                size: Math.random() * 4 + 2, // Random size 2-6px
                // Mix of Amber, Orange, and White for "Magical Light"
                color: Math.random() > 0.5 ? '#fbbf24' : (Math.random() > 0.5 ? '#f59e0b' : '#ffffff')
            };

            setParticles(prev => [...prev.slice(-20), newParticle]); // Keep last 20-30 particles
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Cleanup loop to remove old particles
        const cleanupLoop = () => {
            setParticles(prev => {
                if (prev.length === 0) return prev;
                // Actually, AnimatePresence handles the visual removal, 
                // we just need to shift them out of state?
                // Better: Just clear state periodically or let them be valid for X ms?
                // Let's rely on a timeout-based removal or just limit array size as done above.
                // Limiting array size in mousemove is efficient for "trail".
                // But if mouse stops, trail should disappear?
                // Yes, so we need to shift out old particles if no movement?

                // Let's use a timestamp approach ideally, but for simplicity:
                // We'll just slice the array on an interval if user wants "disappearing" trail.
                return prev.length > 0 ? prev.slice(1) : prev;
            });
            requestRef.current = requestAnimationFrame(cleanupLoop);
        };

        // Slower cleanup to let particles linger a bit
        // Using setInterval for cleanup instead of RAF to control fade speed
        const intervalId = setInterval(() => {
            setParticles(prev => prev.length > 0 ? prev.slice(1) : []);
        }, 50); // Remove one particle every 50ms (trail fades out when stopped)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearInterval(intervalId);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed top-0 left-0 pointer-events-none z-[9999] overflow-visible inset-0 h-screen w-screen">
            <AnimatePresence mode='popLayout'>
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        initial={{ opacity: 0.8, scale: 1 }}
                        animate={{ opacity: 0, scale: 0 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute rounded-full blur-[1px]"
                        style={{
                            left: particle.x,
                            top: particle.y,
                            width: particle.size,
                            height: particle.size,
                            backgroundColor: particle.color,
                            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                            transform: 'translate(-50%, -50%)', // Center on cursor
                        }}
                    />
                ))}
            </AnimatePresence>

            {/* Optional: Add a subtle main glow following cursor directly if needed, but particles might be enough */}
        </div>
    );
};
