import { Button } from "@/components/ui/button";
import {
  User,
  LayoutDashboard,
  Home,
  BookOpen,
  Info,
  Store,
  Package,
  Settings,
  X,
} from "@/lib/icons";
import { PlayCircle, PlusCircle, LogIn } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthModal from "@/components/AuthModal";

import { useAudio } from "@/contexts/SoundContext";
import logo from "@/assets/logo/logo.png";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Megaphone, Loader2, Gift } from "lucide-react";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useProfile } from "@/hooks/useProfile";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import { NavbarThemeSelector } from "./NavbarThemeSelector";

const Navbar = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { isProcessing, cancelGeneration } = useActiveGeneration();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGeneratorDialog, setShowGeneratorDialog] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [scrolled, setScrolled] = useState(() => window.scrollY > 20);
  const { user, loading, signOut } = useAuth();
  const { profileData } = useProfile(user?.id);
  const { announcements, isLoading: isLoadingAnnouncements } =
    useAnnouncements();
  const { play } = useAudio();
  const playClick = () => play("click");
  const navRef = useRef<HTMLElement | null>(null);
  const { i18n } = useTranslation();
  const dateLocale = i18n.language === 'en' ? enUS : vi;

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
        setScrolled(window.scrollY > 1);
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
    { path: "/", label: t("nav.home"), icon: Home },
    { path: "/quiz/library", label: t("nav.library"), icon: BookOpen },
    { path: "/english", label: t("nav.englishHub"), icon: Store },
    // { path: "/about", label: t('nav.about'), icon: Info },
  ];

  return (
    <motion.nav
      key={location.pathname}
      initial={{ width: "90%", opacity: 0 }}
      animate={{ 
        width: scrolled ? "75%" : "100%", 
        opacity: 1,
        top: scrolled ? 16 : 0 // 16px is top-4
      }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      ref={navRef}
      className={cn(
        "fixed z-50 left-1/2 -translate-x-1/2",
        scrolled
          ? "rounded-full border border-slate-200/60 dark:border-slate-800/60 shadow-lg dark:shadow-slate-900/50 backdrop-blur-2xl bg-white/70 dark:bg-slate-950/70"
          : "border-b border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 rounded-none",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <Link
            to="/"
            className="flex items-center gap-x-1.5 shrink-0"
            onPointerDown={playClick}
          >
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
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-50/50 dark:hover:bg-slate-800/50",
                )}
                onPointerDown={playClick}
              >
                <item.icon className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
            {/* Dashboard Link (Show when logged in) */}
          </div>

          {/* Right: Auth / User Dropdown */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Announcements Bell */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-10 h-10 relative bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 border-2 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-foreground hidden sm:flex transition-all duration-300 hidden sm:flex"
                >
                  <Bell className="w-5 h-5" />
                  {announcements.length > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-3 border-b bg-muted/30 dark:bg-slate-900/50">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-primary" />
                    {t('nav.notifications')}
                    <span className="ml-auto text-xs font-normal text-muted-foreground">
                      {announcements.length} {t('nav.newNotifications')}
                    </span>
                  </h3>
                </div>
                <ScrollArea className="h-[300px]">
                  {isLoadingAnnouncements ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : announcements.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground text-sm">
                      {t('nav.noNotifications')}
                    </div>
                  ) : (
                    <div className="p-2 space-y-2">
                      {announcements.map((item) => (
                        <div
                          key={item.id}
                          className={cn(
                            "p-3 rounded-lg border text-left",
                            item.type === "event"
                              ? "bg-purple-50/50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/50"
                              : "bg-muted/30 dark:bg-slate-800/50 border-border/50 dark:border-slate-700/50",
                          )}
                        >
                          <p className="text-sm font-medium leading-none mb-1.5">
                            {item.title}
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {item.content}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-2 opacity-70">
                            {formatDistanceToNow(new Date(item.created_at), {
                              addSuffix: true,
                              locale: dateLocale,
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>

            {/* Global Loading Indicator (Navbar Integration) */}
            {isProcessing && (
              <div className="flex items-center gap-2 md:bg-primary/10 md:border md:border-primary/20 rounded-full md:px-3 md:py-1 animate-in fade-in slide-in-from-right-4 duration-300 pointer-events-none md:pointer-events-auto">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </div>
                <span className="hidden md:inline text-[10px] font-medium text-primary whitespace-nowrap">
                  {t("quizGenerator.status.generating") || "Creating..."}
                </span>

                {/* Cancel Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCancelConfirm(true);
                  }}
                  className="ml-1 hidden md:flex items-center justify-center h-4 w-4 rounded-full hover:bg-red-100 text-primary/50 hover:text-red-500 transition-colors pointer-events-auto"
                  title={t("quizGenerator.actions.cancel") || "Cancel"}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <NavbarThemeSelector />
            <ModeToggle />
            <LanguageSwitcher />
            {!loading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-10 w-10 rounded-full ml-1"
                      >
                        <Avatar className="h-10 w-10 border-2 border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:ring-2 hover:ring-primary/50">
                          <AvatarImage
                            src={
                              profileData?.avatar_url ||
                              user.user_metadata?.avatar_url
                            }
                            alt={user.email || ""}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-white font-bold">
                            {user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {profileData?.display_name ||
                              user.email?.split("@")[0]}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => navigate("/user/dashboard")}
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>{t("nav.dashboard") || "Dashboard"}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          navigate("/user/dashboard?tab=inventory")
                        }
                      >
                        <Package className="mr-2 h-4 w-4" />
                        <span>{t("inventory.title", "Kho đồ")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          navigate("/user/dashboard?tab=exchange")
                        }
                      >
                        <Store className="mr-2 h-4 w-4" />
                        <span>{t("dashboard.tabs.exchange", "Cửa hàng")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate("/redeem")}
                      >
                        <Gift className="mr-2 h-4 w-4 text-indigo-500" />
                        <span>{t("nav.redeem")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate("/profile")}
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>{t("nav.profile")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          signOut();
                        }}
                        className="text-red-600 focus:text-red-600"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{t("nav.logout") || "Đăng xuất"}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
      <QuickGeneratorDialog
        open={showGeneratorDialog}
        onOpenChange={setShowGeneratorDialog}
      />

      {/* Global Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("quizGenerator.confirmDialog.titleCancel") ||
                "Cancel Generation?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("quizGenerator.confirmDialog.descriptionCancel") ||
                "Are you sure you want to stop generating this quiz? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("quizGenerator.confirmDialog.cancel") || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                cancelGeneration?.();
                setShowCancelConfirm(false);
                toast({
                  title:
                    t("quizGenerator.toasts.cancelledTitle") || "Cancelled",
                  description:
                    t("quizGenerator.toasts.cancelledDesc") ||
                    "Quiz generation has been stopped.",
                  variant: "info",
                });
              }}
            >
              {t("quizGenerator.confirmDialog.confirm") || "Stop Generation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.nav>
  );
};

export default Navbar;
