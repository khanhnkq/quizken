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
const Watermark: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("text-4xl md:text-6xl font-bold opacity-10", className)}>
    QK
  </div>
);

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
          "w-full max-w-lg mx-auto font-sans shadow-2xl rounded-2xl overflow-hidden bg-stone-50 flex flex-col",
          // Desktop: fixed aspect ratio
          "md:aspect-[85.6/54]",
          className
        )}>
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200"></div>
          <div className="flex-grow flex p-4 md:p-5 gap-3 md:gap-4">
            <div className="w-1/3 h-full bg-gray-200 rounded-lg"></div>
            <div className="w-2/3 space-y-2">
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
          <div className="h-14 md:h-16 bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className={cn(
          "w-full max-w-lg mx-auto font-sans shadow-2xl rounded-2xl overflow-hidden bg-stone-50 flex flex-col",
          // Desktop: fixed aspect ratio
          "md:aspect-[85.6/54]",
          className
        )}>
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center">
            <p className="text-base md:text-lg font-semibold text-gray-700 mb-2">
              Chưa đăng nhập
            </p>
            <p className="text-sm text-gray-500">
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
        "w-full max-w-lg mx-auto font-sans shadow-2xl rounded-2xl overflow-hidden bg-stone-50 flex flex-col transition-all duration-300 cursor-pointer",
        // Desktop: fixed aspect ratio like ID card
        "md:aspect-[85.6/54]",
        // Mobile: auto height for better responsive layout
        className
      )}>
      {/* Header */}
      <header className="px-4 py-3 md:px-5">
        <div className="flex justify-between items-center">
          <h1 className="text-base md:text-lg font-bold text-gray-700">
            QUIZKEN
          </h1>
          <h2 className="text-xs md:text-sm font-semibold text-gray-500 tracking-[0.1em] md:tracking-[0.2em]">
            MEMBER CARD
          </h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex px-4 pb-3 md:px-5 md:pb-3 gap-3 md:gap-4 relative">
        {/* Photo Section */}
        <div className="w-1/3 flex-shrink-0 md:w-1/3">
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
              "w-full h-full object-cover rounded-lg border-2 md:border-4 transition-transform duration-300",
              theme.photoBorder
            )}
          />
        </div>

        {/* Info Section */}
        <div className="w-2/3 flex flex-col justify-between relative md:w-2/3">
          <div className="flex flex-col items-start space-y-2">
            {/* Class Badge */}
            <div
              className={cn(
                "border-2 rounded-full px-3 py-0.5 md:px-4 md:py-0.5",
                theme.classBorder
              )}>
              <span
                className={cn(
                  "font-bold text-xs md:text-sm",
                  theme.classBorder.replace("border-", "text-")
                )}>
                LEVEL{" "}
                {statistics
                  ? Math.floor(statistics.total_quizzes_taken / 10) + 1
                  : 1}
              </span>
            </div>

            {/* User Info Fields */}
            <div className="w-full flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
              <div className="flex-1 flex flex-col space-y-2">
                <InfoField label="Name" value={userName} />
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
              </div>
              <div className="flex-1 flex flex-col space-y-2">
                <InfoField label="Member ID" value={userId} />
                <InfoField label="Joined" value={joinDate} />
              </div>
            </div>

            {/* Signature */}
            <div className="w-full">
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Signature
              </p>
              <Signature />
              <div className="border-b border-gray-300 w-full mt-1"></div>
            </div>
          </div>

          {/* Watermark */}
          <Watermark
            ref={watermarkRef}
            className={cn(
              "absolute bottom-0 right-0 w-16 h-16 md:w-20 md:h-20 transition-all duration-500",
              theme.watermarkText
            )}
          />
        </div>
      </main>

      {/* Footer */}
      <footer
        className={cn(
          "h-14 md:h-16 flex-shrink-0 bg-gradient-to-r flex items-center justify-end px-4 md:px-5",
          theme.gradient
        )}>
        <div className="flex flex-col items-center">
          <Barcode />
          <div className="flex justify-between w-full mt-1">
            <span className="text-white text-[8px] md:text-[10px] font-mono truncate max-w-[40%]">
              {userName.toUpperCase()}
            </span>
            <span className="text-white text-[8px] md:text-[10px] font-mono">
              {userId}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserProfile;
