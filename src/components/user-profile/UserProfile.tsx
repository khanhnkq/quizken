import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { gsap } from "gsap";
import { shouldReduceAnimations } from "@/utils/deviceDetection";
import type { UserProfileProps } from "@/types/user";
import {
  Sparkles,
  Calendar,
  Zap,
  User as UserIcon,
  Pencil,
  CheckCircle2,
  PenTool,
  Flame,
  Facebook,
  Phone,
  Layout,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";
import {
  calculateXP,
  calculateLevel,
  calculateNextLevelXP,
  calculateCurrentLevelBaseXP,
} from "@/utils/levelSystem";
import { EditProfileDialog } from "./EditProfileDialog";
import { useProfile } from "@/hooks/useProfile";
import { FramedAvatar } from "@/components/ui/FramedAvatar";

/**
 * Main UserProfile component - Redesigned for "Playful & Cute" aesthetic
 */
export const UserProfile: React.FC<
  UserProfileProps & { 
    isEditable?: boolean; 
    overrideLevel?: number;
    layout?: 'responsive' | 'horizontal' | 'vertical';
  }
> = ({
  user,
  statistics,
  isLoading,
  className,
  isEditable = true,
  overrideDisplayName,
  overrideAvatarUrl,
  streak = 0,
  disableHoverEffects = false,
  overrideLevel,
  layout = 'responsive',
  actions,
  hideStats = false,
}) => {
  const { t, i18n } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLImageElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // GSAP animations for hover effects (Bounce & Rotate)
  useEffect(() => {
    if (!cardRef.current || shouldReduceAnimations() || disableHoverEffects)
      return;

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
      <div
        className={cn(
          "w-full h-full min-h-[220px] rounded-[2.5rem] bg-gray-100 animate-pulse",
          className,
        )}
      />
    );
  }

  if (!user) {
    return (
      <div
        className={cn(
          "w-full h-full min-h-[220px] rounded-[2.5rem] bg-white dark:bg-slate-900 border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center p-8 text-center",
          className,
        )}>
        <UserIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          {t("library.toasts.loginRequired")}
        </p>
      </div>
    );
  }

  // Fetch custom profile data from profiles table
  const { profileData } = useProfile(user?.id);

  // Use profiles data with fallback to Google metadata, prioritizing overrides
  const userName =
    overrideDisplayName ||
    profileData?.display_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Quizzer";

  const avatarUrl =
    overrideAvatarUrl ||
    profileData?.avatar_url ||
    user?.user_metadata?.avatar_url;

  // Use current date if created_at is missing (e.g. for mock users)
  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(
        i18n.language === "en" ? "en-US" : "vi-VN",
        { month: "long", year: "numeric" },
      )
    : "";

  // Calculate XP and Level using shared utility
  // Prefer XP from database (profileData) if available, otherwise calculate from statistics
  const calculatedXP = profileData?.xp ?? calculateXP(statistics);
  const calculatedLevel = calculateLevel(calculatedXP);

  // Use overrideLevel for display if provided, otherwise use calculatedLevel
  // BUT for progress bar math, we MUST use the level corresponding to the current totalXP 
  // to avoid negative progress (e.g. if overrideLevel is stale but totalXP is fresh).
  // Ideally overrideLevel and totalXP should be consistent. If they diverge, 
  // using calculatedLevel for math is safer.
  const displayLevel = overrideLevel || calculatedLevel;
  
  // Use calculatedLevel for math to ensure the XP range (Base -> Next) contains the TotalXP
  const mathLevel = calculatedLevel;

  const nextLevelXP = calculateNextLevelXP(mathLevel);
  const currentLevelBaseXP = calculateCurrentLevelBaseXP(mathLevel);
  const levelProgressPercent = Math.min(
    100,
    Math.max(
      0,
      ((calculatedXP - currentLevelBaseXP) / (nextLevelXP - currentLevelBaseXP)) *
        100,
    ),
  );

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative w-full h-auto min-h-[220px] rounded-[2.5rem] overflow-hidden transition-all duration-300 cursor-default",
        "bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900",
        "border-4 border-white dark:border-slate-700 shadow-xl",
        className,
      )}>
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-200/30 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-200/30 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />

      <div className={cn(
        "relative z-10 flex items-center h-full p-6 md:p-8 gap-6",
        layout === 'horizontal' ? "flex-row" :
        layout === 'vertical' ? "flex-col" :
        "flex-col md:flex-row"
      )}>
        {/* Avatar Section */}
        <div className="relative shrink-0 group/avatar">
          {/* Blob Background for Avatar */}
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-300 to-purple-300 rounded-full blur-sm opacity-60 transform scale-110" />

          <FramedAvatar 
            avatarUrl={avatarUrl}
            frameId={profileData?.equipped_avatar_frame}
            fallbackName={userName}
            className="z-10"
            size="md"
          />

          {/* Edit Button Overlay */}
          {isEditable && (
            <button
              onClick={() => setShowEditDialog(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer z-20"
              title={t('userProfile.editProfile')}>
              <Pencil className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Edit Icon Badge - Always visible */}
          {isEditable && (
            <button
              onClick={() => setShowEditDialog(true)}
              className="absolute -top-1 -right-1 z-30 bg-white hover:bg-primary hover:text-white text-gray-600 p-1.5 rounded-full shadow-md border-2 border-white transition-colors cursor-pointer"
              title={t('userProfile.editProfile')}>
              <Pencil className="w-3 h-3" />
            </button>
          )}

          {/* Level Badge floating on Avatar */}
          <div
            ref={badgeRef}
            className="absolute -bottom-2 -right-2 z-30 bg-yellow-300 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm border-2 border-white dark:border-slate-700 flex items-center gap-1">
            <Zap className="w-3 h-3 fill-yellow-900" />
            {t("profile.level")} {displayLevel}
          </div>

          {/* New Change Frame Floating Button */}
          {isEditable && (
            <button
              onClick={() => {
                const params = new URLSearchParams(window.location.search);
                params.set("tab", "inventory");
                window.history.pushState({}, "", `${window.location.pathname}?${params.toString()}`);
                // Trigger a re-render if we are in the same component, or use navigation
                window.dispatchEvent(new Event("popstate"));
              }}
              className="absolute -bottom-1 -left-1 z-30 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-lg border-2 border-white transition-all hover:scale-110 active:scale-95 group/frame"
              title={t('userProfile.changeFrame')}
            >
              <Layout className="w-4 h-4" />
              <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover/frame:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                {t('userProfile.changeFrame')}
              </span>
            </button>
          )}
        </div>

        {/* Edit Profile Dialog */}
        {user && (
          <EditProfileDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            user={user}
          />
        )}

        {/* Info Section */}
        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm rounded-full text-blue-600/80 dark:text-blue-400 text-xs font-bold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3 h-3" />
              {t("profile.member")}
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400/20 backdrop-blur-sm rounded-full text-yellow-700 dark:text-yellow-400 text-xs font-bold uppercase tracking-wider shadow-sm border border-yellow-200 dark:border-yellow-400/30">
              <span className="text-sm">🪙</span>
              {statistics?.zcoin || 0} ZCoin
            </div>

            {profileData?.facebook_url && (
              <a 
                href={profileData.facebook_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 text-xs font-bold hover:scale-105 transition-transform shadow-sm"
              >
                <Facebook className="w-3 h-3" />
                Facebook
              </a>
            )}

            {profileData?.zalo_url && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 rounded-full text-cyan-600 dark:text-cyan-400 text-xs font-bold shadow-sm">
                <Phone className="w-3 h-3" />
                Zalo: {profileData.zalo_url}
              </div>
            )}

            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>

          <h2 className="text-3xl md:text-4xl font-heading font-black text-gray-800 dark:text-white tracking-tight leading-none pt-1">
            {userName}
          </h2>

          {profileData?.bio && (
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 max-w-sm italic">
              "{profileData.bio}"
            </p>
          )}

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3 text-sm font-medium text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5 bg-white/50 dark:bg-slate-800/50 px-2 py-1 rounded-lg">
              <Calendar className="w-4 h-4 text-pink-400" />
              <span>
                {t("profile.joined")} {joinDate}
              </span>
            </div>

            {/* Email/ID (Truncated) */}
            <div className="hidden md:flex items-center gap-1.5 bg-white/50 dark:bg-slate-800/50 px-2 py-1 rounded-lg opacity-70">
              <UserIcon className="w-4 h-4 text-blue-400" />
              <span>#{user.id.slice(0, 8)}</span>
            </div>
            </div>

          {/* XP Progress Bar */}
          <div className="w-full max-w-[280px] space-y-1.5 mt-1">
             <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 px-1">
                <span>XP</span>
                <span>
                  {Math.floor(calculatedXP - currentLevelBaseXP)} / {nextLevelXP - currentLevelBaseXP}
                </span>
             </div>
             <Progress value={levelProgressPercent} className="h-2.5 bg-gray-200 dark:bg-slate-700 from-yellow-400 to-orange-500 [&>div]:bg-gradient-to-r" />
             <div className="text-[10px] text-right text-gray-400 font-medium">
                {t("userProfile.toNextLevel", { xp: Math.round(nextLevelXP - calculatedXP) })}
             </div>
          </div>

          {/* Quick Stats Grid */}
          {!hideStats && (
            <div className="flex items-center gap-3 mt-4">
              {/* Quizzes Taken */}
              <div className="flex-1 bg-white/50 dark:bg-slate-800/50 rounded-xl p-2 flex flex-col items-center">
                <CheckCircle2 className="w-4 h-4 text-green-500 mb-1" />
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  {statistics?.total_quizzes_taken || 0}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">
                  {t("userProfile.statsAttempted")}
                </span>
              </div>

              {/* Quizzes Created */}
              <div className="flex-1 bg-white/50 dark:bg-slate-800/50 rounded-xl p-2 flex flex-col items-center">
                <PenTool className="w-4 h-4 text-purple-500 mb-1" />
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  {statistics?.total_quizzes_created || 0}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">
                  {t("userProfile.statsCreated")}
                </span>
              </div>

              {/* Streak */}
              <div className="flex-1 bg-white/50 dark:bg-slate-800/50 rounded-xl p-2 flex flex-col items-center">
                <Flame className="w-4 h-4 text-orange-500 mb-1" />
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{streak}</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">
                  {t("userProfile.performance")}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
