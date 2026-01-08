import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, Sparkles } from 'lucide-react';
import { ROADMAP_DATA } from '../lib/constants/roadmapData';
import MapNode from '../components/english/MapNode';
import { BackgroundDecorations } from '../components/ui/BackgroundDecorations';
import { useTranslation } from 'react-i18next';

const EnglishHub = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const [pathHeight, setPathHeight] = useState(1000);

    // ... (keep useEffects and logic) ...

    // Restore the logic for useEffects and generatePath which are seemingly skipped in the prompt by mistake?
    // Actually I should just selectively replace the sections that have text.

    // But wait, replace_file_content is better for blocks.
    // I will just modify the JSX return block primarily.
    // Let's redo this tool call to target specific JSX areas to be safer.

    // Adjust path height based on content
    useEffect(() => {
        if (containerRef.current) {
            setPathHeight(ROADMAP_DATA.length * 200 + 400);
        }
    }, []);

    // Curved Path Logic
    // We start from top center, curve left, then right, then left...
    // M 50 0 -> Move to Top Center (50% x, 0 y)
    // C control_points end_point
    const generatePath = () => {
        let path = "M 50 20 "; // Start top center (relative coordinates 0-100)
        let y = 20;

        ROADMAP_DATA.forEach((_, index) => {
            // Zig-zag pattern: Center -> Left -> Center -> Right -> Center
            // Actually, simpler is: curve to left node, then curve to right node
            // Let's use a simpler sine-wave like curve
            // Node positions: Left (20%), Right (80%)
            const isLeft = index % 2 === 0;
            const targetX = isLeft ? 30 : 70;
            const nextY = y + 150; // Vertical spacing

            // Control points for smooth S-curve
            const cp1y = y + 75;
            const cp2y = y + 75;

            path += `C 50 ${cp1y}, ${targetX} ${cp2y}, ${targetX} ${nextY} `;

            // If there is a next node, curve back towards center then to next target
            // But here we just draw line to next node pos? 
            // Better: Curve from current node to next node
            if (index < ROADMAP_DATA.length - 1) {
                const nextIsLeft = (index + 1) % 2 === 0;
                const nextX = nextIsLeft ? 30 : 70;
                const midY = nextY + 75;
                path += `C ${targetX} ${midY}, ${nextX} ${midY}, ${nextX} ${nextY + 150} `;
                y = nextY + 150;
            }
        });

        return path;
    };

    // Responsive Path using absolute SVG
    // We render nodes using absolute positioning percentages to match the SVG path
    return (
        <div className="h-screen bg-sky-50 relative overflow-hidden flex flex-col">
            <BackgroundDecorations />

            {/* FIXED HEADER AREA: Navbar + Hero Title */}
            <div className="flex-none z-20 relative w-full">
                {/* Navbar */}
                <header className="px-4 py-4 md:py-6">
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <button
                            onClick={() => navigate('/')}
                            className="bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-lg border-2 border-white hover:scale-105 transition-transform text-slate-600 font-bold flex items-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">{t('englishHub.back')}</span>
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg border-2 border-yellow-200 flex items-center gap-2">
                                <span className="text-2xl">🔥</span>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('englishHub.streak')}</p>
                                    <p className="text-sm font-black text-orange-500">3 Days</p>
                                </div>
                            </div>
                            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg border-2 border-blue-200 flex items-center gap-2">
                                <Store className="w-6 h-6 text-blue-500" />
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('englishHub.gems')}</p>
                                    <p className="text-sm font-black text-blue-500">1,250</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Hero / Header Section matched with Landing/Library */}
                <div className="text-center mb-6 relative px-4 pt-2">
                    {/* Background Glows */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg pointer-events-none -z-10">
                        <div className="absolute top-0 left-1/4 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl animate-blob" />
                        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
                    </div>

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 backdrop-blur-md border border-white/50 shadow-sm text-blue-600 font-medium text-sm animate-fade-in mx-auto mb-4">
                        <span className="text-lg">✨</span>
                        <span>{t('englishHub.badge')}</span>
                    </div>

                    <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 drop-shadow-sm mb-4">
                        {t('englishHub.titlePrefix')}{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 relative inline-block">
                            {t('englishHub.titleSuffix')}
                            <svg className="absolute -bottom-2 left-0 w-full h-3 text-yellow-300/80 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                            </svg>
                        </span>
                    </h1>

                    <p className="text-lg text-slate-600 font-medium max-w-lg mx-auto leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: t('englishHub.subtitle') }}
                    />
                </div>
            </div>

            {/* SCROLLABLE MAP AREA */}
            <main
                className="flex-1 overflow-y-auto w-full relative z-10 custom-scrollbar pb-20"
                style={{
                    maskImage: 'linear-gradient(to bottom, transparent 0%, black 40px, black calc(100% - 40px), transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 40px, black calc(100% - 40px), transparent 100%)'
                }}
            >
                <div className="min-h-full flex flex-col items-center pt-10">
                    {/* Map Container - Relative for absolute positioning */}
                    <div className="relative w-full max-w-lg mx-auto" style={{ height: `${ROADMAP_DATA.length * 180 + 200}px` }}>

                        {/* The Path SVG */}
                        <svg
                            className="absolute top-0 left-0 w-full h-full pb-20 pointer-events-none opacity-30"
                            viewBox={`0 0 100 ${ROADMAP_DATA.length * 180 + 100}`}
                            preserveAspectRatio="none" // Stretch to fit container height
                        >
                            <path
                                d={(() => {
                                    // Simple Zig Zag Path Generation (Same logic)
                                    let path = "M 50 0 "; // Start top
                                    ROADMAP_DATA.forEach((_, i) => {
                                        const isLeft = i % 2 === 0;
                                        const x = isLeft ? 25 : 75;
                                        const y = 100 + (i * 180) + 40; // +40 for center of 80px node

                                        // Previous point (or start)
                                        const prevX = i === 0 ? 50 : ((i - 1) % 2 === 0 ? 25 : 75);
                                        const prevY = i === 0 ? 0 : (100 + ((i - 1) * 180) + 40);

                                        const cpY = (y + prevY) / 2;

                                        path += `C ${prevX} ${cpY}, ${x} ${cpY}, ${x} ${y} `;
                                    });
                                    return path;
                                })()}
                                fill="none"
                                stroke="#94a3b8"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                                vectorEffect="non-scaling-stroke" // Keep line width constant despite scaling
                            />
                        </svg>

                        {/* The Nodes */}
                        {ROADMAP_DATA.map((phase, index) => {
                            const isLeft = index % 2 === 0;

                            return (
                                <div
                                    key={phase.id}
                                    className="absolute transform -translate-x-1/2"
                                    style={{
                                        left: isLeft ? '25%' : '75%', // Absolute horizontal positioning
                                        top: `${100 + index * 180}px`,  // Fixed vertical spacing
                                    }}
                                >
                                    <MapNode
                                        phase={phase}
                                        index={index}
                                        position="center" // Reset position prop as we handle layout here
                                        onClick={() => {
                                            if (phase.id === 'phase-1') {
                                                navigate('/english/phase/1/vocab');
                                            }
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    {/* Coming Soon Cloud */}
                    <div className="mt-8 text-center opacity-60 pb-20">
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">{t('englishHub.comingSoon')}</p>
                        <div className="w-16 h-2 bg-slate-200 rounded-full mx-auto" />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EnglishHub;
