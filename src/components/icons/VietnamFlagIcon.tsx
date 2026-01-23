import { cn } from "@/lib/utils";

export const VietnamFlagIcon = ({ className }: { className?: string }) => {
  // Postage stamp effect using SVG mask
  // Base size 340x240 to hold 300x200 flag + border
  return (
    <svg 
      viewBox="0 0 340 240" 
      className={cn("w-full h-auto drop-shadow-md", className)}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Pattern for the perforation holes */}
        <pattern id="holes-x" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
           <circle cx="10" cy="0" r="6" fill="black" />
           <circle cx="10" cy="20" r="6" fill="black" />
        </pattern>
        <pattern id="holes-y" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
           <circle cx="0" cy="10" r="6" fill="black" />
           <circle cx="20" cy="10" r="6" fill="black" />
        </pattern>
        
        {/* The mask: White rectangle minus black holes */}
        <mask id="stamp-mask">
          <rect x="0" y="0" width="340" height="240" fill="white" />
          
          {/* Top and Bottom edges */}
          <rect x="0" y="0" width="340" height="12" fill="url(#holes-x)" />
          <rect x="0" y="228" width="340" height="12" fill="url(#holes-x)" />
          
          {/* Left and Right edges */}
          <rect x="0" y="0" width="12" height="240" fill="url(#holes-y)" />
          <rect x="328" y="0" width="12" height="240" fill="url(#holes-y)" />
        </mask>
      </defs>

      {/* Main Stamp Body (White background with jagged edges) */}
      <rect x="0" y="0" width="340" height="240" fill="white" mask="url(#stamp-mask)" />
      
      {/* The Flag Content (Inset) */}
      <g transform="translate(20, 20)">
        <rect width="300" height="200" fill="#DA251C"/>
        <path d="M150 40L179.39 130.45L102.45 74.55H197.55L120.61 130.45L150 40Z" fill="#FFFF00"/>
      </g>
      
      {/* Optional: Slight inner shadow or border for realism (opacity overlay) */}
      <rect x="20" y="20" width="300" height="200" stroke="#000" strokeOpacity="0.1" strokeWidth="1" fill="none" />
    </svg>
  );
};
