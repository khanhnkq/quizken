import React from 'react';
import { cn } from "@/lib/utils";
import { useItems } from "@/hooks/useItems";

interface FramedAvatarProps {
    avatarUrl?: string | null;
    frameId?: string | null;
    fallbackName?: string;
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
}

export const FramedAvatar: React.FC<FramedAvatarProps> = ({
    avatarUrl,
    frameId,
    fallbackName = "User",
    className,
    size = "md"
}) => {
    const { data: items } = useItems();
    // Find the frame item details from the ID (using database items now)
    const frameItem = frameId && items ? items.find(item => item.id === frameId && item.type === 'avatar_frame') : null;
    const frameUrl = frameItem?.image_url;

    // Size mappings
    const sizeClasses = {
        sm: "w-10 h-10",
        md: "w-24 h-24 md:w-32 md:h-32",
        lg: "w-32 h-32 md:w-40 md:h-40",
        xl: "w-40 h-40 md:w-48 md:h-48"
    };

    // Frame scale adjustment (frames usually need to be slightly larger than the avatar)
    // We'll use absolute positioning for the frame
    
    return (
        <div className={cn("relative shrink-0 flex items-center justify-center", className)}>
             {/* The Base Avatar */}
            <img
                src={
                    avatarUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=random&color=fff`
                }
                alt={fallbackName}
                className={cn(
                    "rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-md z-10 box-content relative",
                    sizeClasses[size]
                )}
            />

            {/* The Frame Overlay */}
            {frameUrl && (
                <div 
                    className="absolute z-20 pointer-events-none"
                    style={{
                        width: '160%', // Increased frame size relative to avatar
                        height: '160%',
                        top: '-30%',
                        left: '-30%'
                    }}
                >
                    <img 
                        src={frameUrl} 
                        alt="Avatar Frame" 
                        className="w-full h-full object-contain drop-shadow-md"
                    />
                </div>
            )}
        </div>
    );
};
