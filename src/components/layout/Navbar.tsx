import { Button } from "@/components/ui/button";
import { User, LayoutDashboard, Home, BookOpen, Info, Store, Package, Settings, X } from "@/lib/icons";
import { PlayCircle, PlusCircle, LogIn } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthModal from "@/components/AuthModal";

import { useAudio } from "@/contexts/SoundContext";
import logo from "@/assets/logo/logo.png";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { cn } from "@/lib/utils";
import { QuickGeneratorDialog } from "@/components/quiz/QuickGeneratorDialog";
import { useToast } from "@/hooks/use-toast";
import { useActiveGeneration } from "@/hooks/useActiveGeneration";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


const Navbar = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { isProcessing, cancelGeneration } = useActiveGeneration();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGeneratorDialog, setShowGeneratorDialog] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading } = useAuth();
  const { play } = useAudio();
  const playClick = () => play("click");
  const navRef = useRef<HTMLElement | null>(null);

  // Global event to open auth modal
  useEffect(() => {
    const handleOpenAuth = (_e: Event) => setShowAuthModal(true);
    window.addEventListener("open-auth-modal", handleOpenAuth);
    return () => window.removeEventListener("open-auth-modal", handleOpenAuth);
  }, []);

  // Scroll shadow
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 4);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);



  // Check active route
  const isActive = (path: string) => location.pathname === path;
  const isDashboardActive = location.pathname.startsWith("/user/dashboard");

  // Nav items
  const navItems = [
    { path: "/", label: t('nav.home'), icon: Home },
    { path: "/quiz/library", label: t('nav.library'), icon: BookOpen },
    { path: "/about", label: t('nav.about'), icon: Info },
  ];



  return (
    <nav
      ref={navRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 transition-all duration-300",
        scrolled && "shadow-md"
      )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-x-1.5 shrink-0" onPointerDown={playClick}>
            <img src={logo} alt="QuizKen logo" className="w-8 h-8" />
            <span className="text-xl font-bold hidden sm:inline">
              Quiz<span className="text-primary">Ken</span>
            </span>
          </Link>

          {/* Center: Nav Links */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-full gap-1 sm:gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "h-16 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 sm:px-5 font-bold text-[10px] sm:text-sm transition-all duration-200 border-b-2",
                  isActive(item.path)
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-400 hover:text-primary hover:bg-slate-50/50"
                )}
                onPointerDown={playClick}>
                <item.icon className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
            {/* Dashboard Link (Show when logged in) */}

          </div>



          {/* Right: Auth / User Dropdown */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Global Loading Indicator (Navbar Integration) */}
            {isProcessing && (
              <div className="flex items-center gap-2 md:bg-primary/10 md:border md:border-primary/20 rounded-full md:px-3 md:py-1 animate-in fade-in slide-in-from-right-4 duration-300 pointer-events-none md:pointer-events-auto">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </div>
                <span className="hidden md:inline text-[10px] font-medium text-primary whitespace-nowrap">
                  {t('quizGenerator.status.generating') || "Creating..."}
                </span>

                {/* Cancel Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCancelConfirm(true);
                  }}
                  className="ml-1 hidden md:flex items-center justify-center h-4 w-4 rounded-full hover:bg-red-100 text-primary/50 hover:text-red-500 transition-colors pointer-events-auto"
                  title={t('quizGenerator.actions.cancel') || "Cancel"}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <LanguageSwitcher />
            {!loading && (
              <>
                {user ? (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      playClick();
                      navigate("/user/dashboard");
                    }}
                    className="rounded-3xl border-4 border-border hover:border-primary hover:text-primary hover:bg-primary/10 transition-all duration-200 active:scale-95 w-10 h-10"
                    title={user.email?.split("@")[0] || "Dashboard"}
                  >
                    <User className="w-5 h-5" />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowAuthModal(true)}
                    className="rounded-3xl border-4 border-border hover:border-primary hover:text-primary hover:bg-primary/10 transition-all duration-200 active:scale-95 w-10 h-10"
                    title={t("nav.login", "Đăng nhập")}
                  >
                    <LogIn className="w-5 h-5" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />

      {/* Quick Generator Dialog */}
      <QuickGeneratorDialog open={showGeneratorDialog} onOpenChange={setShowGeneratorDialog} />

      {/* Global Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('quizGenerator.confirmDialog.titleCancel') || "Cancel Generation?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('quizGenerator.confirmDialog.descriptionCancel') || "Are you sure you want to stop generating this quiz? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('quizGenerator.confirmDialog.cancel') || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              cancelGeneration?.();
              setShowCancelConfirm(false);
              toast({
                title: t('quizGenerator.toasts.cancelledTitle') || "Cancelled",
                description: t('quizGenerator.toasts.cancelledDesc') || "Quiz generation has been stopped.",
                variant: "info",
              });
            }}>
              {t('quizGenerator.confirmDialog.confirm') || "Stop Generation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav >
  );
};

export default Navbar;


