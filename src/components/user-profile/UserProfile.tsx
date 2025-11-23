import React, { useRef, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { gsap } from "gsap";
import { shouldReduceAnimations } from "@/utils/deviceDetection";
import type { UserProfileProps } from "@/types/user";

/**
 * InfoField component - displays a key-value pair exactly like IdentityCard
 */
const InfoField: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="w-full">
    <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
    <p className="text-sm md:text-lg font-medium text-black -mt-1 truncate">
      {value}
    </p>
    <div className="border-b border-gray-300 w-full mt-1"></div>
  </div>
);

/**
 * Signature component - simple signature line
 */
const Signature: React.FC = () => (
  <div className="w-24 md:w-32 h-10 md:h-12 -ml-2 border-b-2 border-gray-400 relative">
    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-600"></div>
  </div>
);

/**
 * Barcode component - simple barcode representation
 */
const Barcode: React.FC = () => (
  <div className="flex space-x-0.5 md:space-x-1">
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        className={cn(
          "w-0.5 h-5 md:h-6",
          i % 3 === 0 ? "bg-black" : i % 3 === 1 ? "bg-gray-600" : "bg-gray-400"
        )}
      />
    ))}
  </div>
);

/**
 * Watermark component - Quizken logo watermark
 */
const Watermark = React.forwardRef<HTMLDivElement, { className?: string }>(
  ({ className }, ref) => (
    <div ref={ref} className={cn("text-4xl md:text-6xl font-bold opacity-10", className)}>
      QK
    </div>
  )
);
Watermark.displayName = "Watermark";

/**
 * Main UserProfile component - IdentityCard layout with Quizken branding
 */
export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  statistics,
  isLoading,
  className,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);

  // GSAP animations for hover effects
  useEffect(() => {
    if (!cardRef.current || shouldReduceAnimations()) return;

    const card = cardRef.current;
    const photo = photoRef.current;
    const watermark = watermarkRef.current;

    // Create timeline for hover animations
    const tl = gsap.timeline({ paused: true });

    // Card hover effect - slight lift and enhanced shadow
    tl.to(
      card,
      {
        y: -8,
        scale: 1.02,
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        duration: 0.3,
        ease: "power2.out",
      },
      0
    );

    // Photo hover effect - slight rotation and scale
    if (photo) {
      tl.to(
        photo,
        {
          rotation: 2,
          scale: 1.05,
          duration: 0.4,
          ease: "back.out(1.7)",
        },
        0.1
      );
    }

    // Watermark hover effect - fade in and move
    if (watermark) {
      tl.fromTo(
        watermark,
        { opacity: 0.1, x: 0, y: 0 },
        { opacity: 0.3, x: 10, y: -10, duration: 0.5, ease: "power2.out" },
        0.2
      );
    }

    // Mouse enter/leave handlers
    const handleMouseEnter = () => tl.play();
    const handleMouseLeave = () => tl.reverse();

    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);

    // Cleanup
    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [user]); // Re-run when user changes

  if (isLoading) {
    return (
      <div
        className={cn(
          "w-full mx-auto font-sans shadow-2xl rounded-2xl overflow-hidden bg-stone-50 flex flex-col min-h-[200px]",
          className
        )}>
        <div className="animate-pulse flex flex-col h-full">
          {/* Header skeleton */}
          <div className="h-10 bg-gray-200 border-b border-gray-300"></div>
          {/* Horizontal content skeleton */}
          <div className="flex-1 flex flex-row">
            <div className="w-[35%] p-3 md:p-4">
              <div className="w-full h-full max-h-[140px] bg-gray-300 rounded-lg"></div>
            </div>
            <div className="flex-1 p-3 md:p-4 space-y-2">
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
          {/* Footer skeleton */}
          <div className="h-8 md:h-10 bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className={cn(
          "w-full mx-auto font-sans shadow-2xl rounded-2xl overflow-hidden bg-stone-50 flex flex-col min-h-[200px]",
          className
        )}>
        <div className="flex items-center justify-center h-full p-4 md:p-8">
          <div className="text-center">
            <p className="text-sm md:text-lg font-semibold text-gray-700 mb-2">
              Chưa đăng nhập
            </p>
            <p className="text-xs md:text-sm text-gray-500">
              Vui lòng đăng nhập để xem hồ sơ
            </p>
          </div>
        </div>
      </div>
    );
  }

  const userName =
    user.user_metadata?.name ||
    user.user_metadata?.full_name ||
    user.email ||
    "Người dùng";
  const avatarUrl = user.user_metadata?.avatar_url;
  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    : "N/A";

  const userId = user.id.slice(-6).toUpperCase();
  const provider = user.user_metadata?.provider || "email";

  // Quizken theme colors
  const theme = {
    gradient: "from-[#B5CC89] to-[#8FA65F]",
    photoBorder: "border-[#B5CC89]/50",
    classBorder: "border-[#B5CC89]",
    watermarkText: "text-[#B5CC89]/20",
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "w-full mx-auto font-sans shadow-2xl rounded-2xl overflow-hidden bg-stone-50 flex flex-col transition-all duration-300 cursor-pointer",
        // Remove fixed aspect ratio, use min-height for flexible landscape layout
        "min-h-[200px]",
        className
      )}>
      {/* Header */}
      <header className="px-3 py-2 md:px-4 md:py-2.5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h1 className="text-sm md:text-base font-bold text-gray-700">
            QUIZKEN
          </h1>
          <h2 className="text-[10px] md:text-xs font-semibold text-gray-500 tracking-[0.15em]">
            MEMBER CARD
          </h2>
        </div>
      </header>

      {/* Main Content - HORIZONTAL LAYOUT */}
      <main className="flex flex-row flex-1 relative">
        {/* Photo Section - Left 35% */}
        <div className="w-[35%] flex-shrink-0 p-3 md:p-4 flex items-center justify-center">
          <img
            ref={photoRef}
            src={
              avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                userName
              )}&background=random&color=fff`
            }
            alt={userName}
            className={cn(
              "w-full h-full max-h-[120px] md:max-h-[140px] object-cover rounded-lg border-2 md:border-3 transition-transform duration-300",
              theme.photoBorder
            )}
          />
        </div>

        {/* Info Section - Right 65% */}
        <div className="flex-1 flex flex-col justify-between p-3 md:p-4 relative">
          {/* Level Badge */}
          <div className="mb-2 md:mb-3">
            <div
              className={cn(
                "inline-block border-2 rounded-full px-2 py-0.5 md:px-3 md:py-1",
                theme.classBorder
              )}>
              <span
                className={cn(
                  "font-bold text-[10px] md:text-xs",
                  theme.classBorder.replace("border-", "text-")
                )}>
                LEVEL{" "}
                {statistics
                  ? Math.floor(statistics.total_quizzes_taken / 10) + 1
                  : 1}
              </span>
            </div>
          </div>

          {/* User Info Fields - 2 Column Grid */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 md:gap-x-4 md:gap-y-2 flex-1">
            <InfoField label="Name" value={userName} />
            <InfoField label="Member ID" value={userId} />
            <InfoField
              label="Provider"
              value={
                provider === "google"
                  ? "Google"
                  : provider === "github"
                    ? "GitHub"
                    : "Email"
              }
            />
            <InfoField label="Joined" value={joinDate} />
          </div>

          {/* Watermark */}
          <Watermark
            ref={watermarkRef}
            className={cn(
              "absolute bottom-2 right-2 w-10 h-10 md:w-14 md:h-14 transition-all duration-500",
              theme.watermarkText
            )}
          />
        </div>
      </main>

      {/* Footer - Green Bar */}
      <footer
        className={cn(
          "h-8 md:h-10 flex-shrink-0 bg-gradient-to-r flex items-center justify-between px-3 md:px-4",
          theme.gradient
        )}>
        <div className="flex items-center gap-2">
          <Barcode />
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-white text-[9px] md:text-[10px] font-mono uppercase truncate max-w-[100px] md:max-w-[140px]">
            {userName}
          </span>
          <span className="text-white text-[9px] md:text-[10px] font-mono font-semibold">
            {userId}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default UserProfile;
