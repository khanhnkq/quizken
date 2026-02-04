import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useAudio } from "@/contexts/SoundContext";
import { PlusCircle } from "lucide-react";
import { createPortal } from "react-dom";
import { QuickGeneratorDialog } from "@/components/quiz/QuickGeneratorDialog";
import AuthModal from "@/components/AuthModal";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";

export const GlobalCreateButton = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { play } = useAudio();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [showGeneratorDialog, setShowGeneratorDialog] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { profileData } = useProfile(user?.id);
  const isComic = profileData?.equipped_theme === "theme_comic_manga";

  // Let's keep it visible everywhere including PlayPage as requested
  // if (location.pathname.includes("/quiz/play")) return null;

  const handleClick = () => {
    play("click");
    if (!user) {
      toast({
        title: t("library.toasts.loginRequired"),
        description: t("library.toasts.loginDesc"),
        variant: "warning",
      });
      setShowAuthModal(true);
    } else {
      setShowGeneratorDialog(true);
    }
  };

  return createPortal(
    <>
      <div
        className={cn(
          "fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[100] flex items-center gap-1 p-1 transition-all animate-in slide-in-from-bottom-10 fade-in duration-500 hover:scale-105",
          isComic
            ? "bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-full"
            : "bg-white dark:bg-slate-900/90 dark:backdrop-blur-md border-2 border-primary dark:border-primary/50 shadow-lg shadow-primary/20 dark:shadow-slate-900/50 rounded-full hover:shadow-xl hover:shadow-primary/30",
        )}>
        <button
          onClick={handleClick}
          className={cn(
            "flex items-center gap-0 sm:gap-2 p-2 sm:pl-3 sm:pr-4 sm:py-2 rounded-full font-bold transition-all",
            isComic
              ? "bg-yellow-400 text-black border-2 border-black hover:scale-105 active:scale-95"
              : "bg-primary text-primary-foreground shadow-sm hover:brightness-110 border border-black/10 dark:border-white/10",
          )}
          title={t("common.createQuiz", "Tạo Quiz")}>
          <PlusCircle className={cn("w-4 h-4", !isComic && "animate-pulse")} />
          <span className="hidden sm:block text-xs font-bold uppercase tracking-wider">
            {t("common.createQuiz", "Tạo Quiz")}
          </span>
        </button>
      </div>

      <QuickGeneratorDialog
        open={showGeneratorDialog}
        onOpenChange={setShowGeneratorDialog}
      />
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>,
    document.body,
  );
};
