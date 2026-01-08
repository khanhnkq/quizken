import React from 'react';
import { Lock, Check, Star } from 'lucide-react';
import { RoadmapPhase } from '../../lib/constants/roadmapData';
import { useTranslation } from 'react-i18next';

interface MapNodeProps {
    phase: RoadmapPhase;
    index: number;
    onClick: () => void;
    position: 'left' | 'right' | 'center';
}

const MapNode = ({ phase, index, onClick, position }: MapNodeProps) => {
    const { t } = useTranslation();
    const isLocked = phase.isLocked;
    const isActive = !isLocked;

    // Island Colors based on phase color
    const getColors = (color: string) => {
        const maps: Record<string, string> = {
            blue: 'bg-blue-500 border-blue-600 shadow-blue-200',
            emerald: 'bg-emerald-500 border-emerald-600 shadow-emerald-200',
            violet: 'bg-violet-500 border-violet-600 shadow-violet-200',
            amber: 'bg-amber-500 border-amber-600 shadow-amber-200',
            rose: 'bg-rose-500 border-rose-600 shadow-rose-200',
        };
        return maps[color] || maps['blue'];
    };

    const colorClasses = getColors(phase.color);
    const Icon = phase.icon;

    return (
        <div
            className={`relative group cursor-pointer transition-transform duration-300 hover:scale-110 z-10`}
            onClick={!isLocked ? onClick : undefined}
        >
            {/* The Island (3D Button) */}
            <div className={`
                w-28 h-28 rounded-[2rem] flex items-center justify-center
                border-b-8 transition-all duration-200 active:border-b-0 active:translate-y-2
                ${isLocked
                    ? 'bg-gray-200 border-gray-300 text-gray-400'
                    : `${colorClasses} text-white shadow-xl hover:shadow-2xl`
                }
            `}>
                <div className="relative">
                    {isLocked ? (
                        <Lock className="w-10 h-10 opacity-50" />
                    ) : (
                        <Icon className="w-12 h-12 drop-shadow-md animate-bounce-slow" />
                    )}

                    {/* Level Number Badge */}
                    <div className={`absolute -top-4 -right-4 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white
                        ${isLocked ? 'bg-gray-400 text-white' : 'bg-yellow-400 text-yellow-900'}
                    `}>
                        {index + 1}
                    </div>
                </div>
            </div>

            {/* Label / Tooltip */}
            <div className={`
                absolute top-full left-1/2 -translate-x-1/2 mt-4 
                bg-white px-4 py-2 rounded-xl shadow-lg border-2 border-gray-100
                text-center w-48 transition-opacity duration-300
                ${isLocked ? 'opacity-60 grayscale' : 'opacity-100'}
            `}>
                <h3 className="font-bold text-gray-800 text-sm">{t(phase.title)}</h3>
                <p className="text-xs text-gray-500 line-clamp-1">{t(phase.subtitle)}</p>
            </div>

            {/* Connector Dot (Visual Anchor for Path) */}
            <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 opacity-0 pointer-events-none" />
        </div>
    );
};

export default MapNode;
