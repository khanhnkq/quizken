import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { gsap } from "gsap";
import { shouldReduceAnimations } from "@/utils/deviceDetection";
import type { UserProfileProps } from "@/types/user";
import { Sparkles, Calendar, Zap, User as UserIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Main UserProfile component - Redesigned for "Playful & Cute" aesthetic
 */
export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  statistics,
  isLoading,
  className,
}) => {
  const { t, i18n } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLImageElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  // GSAP animations for hover effects (Bounce & Rotate)
  useEffect(() => {
    if (!cardRef.current || shouldReduceAnimations()) return;

    const card = cardRef.current;

    const handleMouseEnter = () => {
      // Card Lift
      gsap.to(card, {
        y: -5,
        scale: 1.01,
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        duration: 0.3,
        ease: "power2.out",
      });

      // Avatar Wiggle
      if (avatarRef.current) {
        gsap.to(avatarRef.current, {
          rotation: 5,
          scale: 1.05,
          duration: 0.4,
          ease: "elastic.out(1, 0.5)",
        });
      }

      // Badge Pop
      if (badgeRef.current) {
        gsap.to(badgeRef.current, {
          scale: 1.1,
          duration: 0.3,
          ease: "back.out(2)",
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
        duration: 0.3,
        ease: "power2.inOut",
      });

      if (avatarRef.current) {
        gsap.to(avatarRef.current, {
          rotation: 0,
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      }

      if (badgeRef.current) {
        gsap.to(badgeRef.current, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [user]);

  if (isLoading) {
    return (
      <div className={cn("w-full h-full min-h-[220px] rounded-[2.5rem] bg-gray-100 animate-pulse", className)} />
    );
  }

  if (!user) {
    return (
      <div className={cn(
        "w-full h-full min-h-[220px] rounded-[2.5rem] bg-white border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 text-center",
        className
      )}>
        <UserIcon className="w-12 h-12 text-gray-300 mb-2" />
        <p className="text-gray-500 font-medium">{t('library.toasts.loginRequired')}</p>
      </div>
    );
  }

  const userName = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || "Quizzer";
  const avatarUrl = user.user_metadata?.avatar_url;
  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString(i18n.language === 'en' ? "en-US" : "vi-VN", { month: "long", year: "numeric" })
    : "";

  // Calculate Level based on quizzes taken
  const level = statistics ? Math.floor(statistics.total_quizzes_taken / 10) + 1 : 1;

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative w-full h-full min-h-[220px] rounded-[2.5rem] overflow-hidden transition-all duration-300 cursor-default",
        "bg-gradient-to-br from-pink-50 via-white to-blue-50",
        "border-4 border-white shadow-xl",
        className
      )}
    >
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-200/30 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-200/30 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center h-full p-6 md:p-8 gap-6">

        {/* Avatar Section */}
        <div className="relative shrink-0">
          {/* Blob Background for Avatar */}
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-300 to-purple-300 rounded-full blur-sm opacity-60 transform scale-110" />

          <img
            ref={avatarRef}
            src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&color=fff`}
            alt={userName}
            className="relative w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-md z-10"
          />

          {/* Level Badge floating on Avatar */}
          <div
            ref={badgeRef}
            className="absolute -bottom-2 -right-2 z-20 bg-yellow-300 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm border-2 border-white flex items-center gap-1"
          >
            <Zap className="w-3 h-3 fill-yellow-900" />
            {t('profile.level')} {level}
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/60 backdrop-blur-sm rounded-full text-blue-600/80 text-xs font-bold uppercase tracking-wider mb-1 shadow-sm">
            <Sparkles className="w-3 h-3" />
            {t('profile.member')}
          </div>

          <h2 className="text-3xl md:text-4xl font-heading font-black text-gray-800 tracking-tight leading-none">
            {userName}
          </h2>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3 text-sm font-medium text-gray-500">
            <div className="flex items-center gap-1.5 bg-white/50 px-2 py-1 rounded-lg">
              <Calendar className="w-4 h-4 text-pink-400" />
              <span>{t('profile.joined')} {joinDate}</span>
            </div>

            {/* Email/ID (Truncated) */}
            <div className="hidden md:flex items-center gap-1.5 bg-white/50 px-2 py-1 rounded-lg opacity-70">
              <UserIcon className="w-4 h-4 text-blue-400" />
              <span>#{user.id.slice(0, 8)}</span>
            </div>
          </div>

          {/* Experience Bar */}
          <div className="mt-4 max-w-xs mx-auto md:mx-0">
            <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
              <span>{t('profile.exp')}</span>
              <span>{(statistics?.total_quizzes_taken || 0) % 10} / 10</span>
            </div>
            <div className="h-3 w-full bg-white rounded-full overflow-hidden shadow-inner border border-white/50">
              <div
                className="h-full bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${((statistics?.total_quizzes_taken || 0) % 10) * 10}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-shimmer" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
