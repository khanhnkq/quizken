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


const Navbar = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGeneratorDialog, setShowGeneratorDialog] = useState(false);
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
          <div className="flex items-center justify-center flex-1 md:flex-none md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 max-w-2xl mx-auto h-full gap-0.5 sm:gap-1">
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
    </nav>
  );
};

export default Navbar;


