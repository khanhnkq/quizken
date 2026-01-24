import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UserProfile } from "@/components/user-profile/UserProfile";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Loader2 } from "lucide-react";
import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface UserProfilePopoverProps {
  userId: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  streak?: number;
  level?: number;
  children: ReactNode;
}

export function UserProfilePopover({
  userId,
  displayName,
  avatarUrl,
  streak = 0,
  level,
  children,
}: UserProfilePopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-[550px] p-0 border-none bg-transparent shadow-none">
        {isOpen && (
          <UserProfileContent
            userId={userId}
            displayName={displayName}
            avatarUrl={avatarUrl}
            streak={streak}
            level={level}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

function UserProfileContent({
  userId,
  displayName,
  avatarUrl,
  streak,
  level,
}: Omit<UserProfilePopoverProps, "children">) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { statistics, isLoading } = useDashboardStats(userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-xl">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <UserProfile
      user={{ id: userId } as any}
      statistics={
        statistics || {
          total_quizzes_created: 0,
          total_quizzes_taken: 0,
          highest_score: 0,
          average_score: 0,
          total_time_taken_seconds: 0,
          zcoin: 0,
        }
      }
      isLoading={isLoading}
      isEditable={false}
      className="shadow-2xl"
      overrideDisplayName={displayName}
      overrideAvatarUrl={avatarUrl}
      disableHoverEffects={true}
      streak={streak}
      overrideLevel={level}
      layout="horizontal"
      actions={
        <Button 
          size="sm" 
          variant="hero" 
          onClick={() => navigate(`/profile/${userId}`)}
          className="rounded-full h-7 px-3 text-[10px] font-black uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-md"
        >
          {t('userProfile.viewDetails')} ➜
        </Button>
      }
    />
  );
}
