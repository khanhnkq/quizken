import { Button } from "@/components/ui/button";
import { LogOut, User, LayoutDashboard, Home, BookOpen, Info, Store, Package, Settings } from "@/lib/icons";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { Link, useLocation } from "react-router-dom";
import AuthModal from "@/components/AuthModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAudio } from "@/contexts/SoundContext";
import logo from "@/assets/logo/logo.png";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut, loading } = useAuth();
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

  const handleSignOut = () => signOut();

  // Check active route
  const isActive = (path: string) => location.pathname === path;
  const isDashboardActive = location.pathname.startsWith("/dashboard");

  // Nav items
  const navItems = [
    { path: "/", label: t('nav.home'), icon: Home },
    { path: "/library", label: t('nav.library'), icon: BookOpen },
    { path: "/about", label: t('nav.about'), icon: Info },
  ];

  // Dashboard sub-navigation items (for user dropdown)
  const dashboardItems = [
    { path: "/dashboard", query: "?tab=overview", label: "Tổng quan", icon: LayoutDashboard },
    { path: "/dashboard", query: "?tab=exchange", label: "Cửa hàng", icon: Store },
    { path: "/dashboard", query: "?tab=inventory", label: "Kho đồ", icon: Package },
    { path: "/dashboard", query: "?tab=settings", label: "Cài đặt", icon: Settings },
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
          <div className="flex items-center justify-center flex-1 max-w-2xl mx-auto h-full gap-0.5 sm:gap-1">
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
            {user && (
              <Link
                to="/dashboard"
                className={cn(
                  "h-16 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 sm:px-5 font-bold text-[10px] sm:text-sm transition-all duration-200 border-b-2",
                  isDashboardActive
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-400 hover:text-primary hover:bg-slate-50/50"
                )}
                onPointerDown={playClick}>
                <LayoutDashboard className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('nav.dashboard')}</span>
              </Link>
            )}
          </div>

          {/* Right: Auth / User Dropdown */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            {!loading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-1.5 sm:gap-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-primary transition-all duration-200 px-2 sm:px-3">
                        <User className="w-5 h-5" />
                        <span className="hidden sm:inline max-w-20 truncate text-sm font-medium">{user.email?.split("@")[0]}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-2xl border border-slate-200 shadow-xl bg-white/95 backdrop-blur-md p-2 animate-in fade-in-0 zoom-in-95">
                      {/* User Email */}
                      <DropdownMenuItem disabled className="rounded-xl py-2 px-3 opacity-70 text-xs text-slate-400">
                        {user.email}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-100 my-1" />

                      {/* Dashboard Sub-Nav */}
                      {dashboardItems.map((item) => (
                        <DropdownMenuItem key={item.query} asChild className="rounded-xl cursor-pointer py-2.5 px-3 hover:bg-slate-50 hover:text-primary transition-colors duration-200 font-medium">
                          <Link to={`${item.path}${item.query}`} onPointerDown={playClick} className="flex items-center w-full">
                            <item.icon className="h-4 w-4 mr-3 text-slate-400" />
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}

                      <DropdownMenuSeparator className="bg-slate-100 my-1" />
                      {/* Mobile Language Switcher */}
                      <div className="sm:hidden flex items-center justify-between px-3 py-2">
                        <span className="text-xs text-slate-400">{t('nav.language')}</span>
                        <LanguageSwitcher />
                      </div>
                      <DropdownMenuSeparator className="sm:hidden bg-slate-100 my-1" />

                      {/* Logout */}
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        onSelect={playClick}
                        className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 cursor-pointer py-2.5 px-3 transition-colors duration-200 font-medium">
                        <LogOut className="h-4 w-4 mr-3" />
                        {t('nav.logout')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => setShowAuthModal(true)}
                    className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-200 font-bold text-sm px-3 sm:px-4">
                    {t('nav.login')}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </nav>
  );
};

export default Navbar;


