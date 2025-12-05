import { Button } from "@/components/ui/button";
import { Menu, LogOut, User, Settings, LayoutDashboard, Home, BookOpen, Info } from "@/lib/icons";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { Link } from "react-router-dom";
import AuthModal from "@/components/AuthModal";
import ApiKeySettings from "@/components/ApiKeySettings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAudio } from "@/contexts/SoundContext";
import logo from "@/assets/logo/logo.png";
import { killActiveScroll, scrollToTarget } from "@/lib/scroll";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const Navbar = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut, loading } = useAuth();
  const { play } = useAudio();
  const playClick = () => play("click");
  const navRef = useRef<HTMLElement | null>(null);

  // Lắng nghe sự kiện toàn cục để mở modal đăng nhập từ bất kỳ nơi nào
  useEffect(() => {
    const handleOpenAuth = (_e: Event) => setShowAuthModal(true);
    window.addEventListener("open-auth-modal", handleOpenAuth);
    return () => {
      window.removeEventListener("open-auth-modal", handleOpenAuth);
    };
  }, []);

  // Theo dõi cuộn để thêm shadow khi trang được cuộn
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
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const scrollToGenerator = () => {
    killActiveScroll();
    scrollToTarget("generator", { align: "top" });
    setIsOpen(false);
  };

  const handleSignOut = () => {
    signOut();
  };

  // Cập nhật CSS var --navbar-height theo chiều cao thực tế của nav (ảnh hưởng mobile menu)
  useEffect(() => {
    const updateVar = () => {
      const h =
        navRef.current?.clientHeight ??
        (document.querySelector("nav") as HTMLElement | null)?.clientHeight ??
        64;
      document.documentElement.style.setProperty("--navbar-height", `${h}px`);
    };
    updateVar();
    window.addEventListener("resize", updateVar);
    return () => {
      window.removeEventListener("resize", updateVar);
    };
  }, [isOpen]);

  return (
    <nav
      ref={navRef}
      className={`sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b transition-shadow ${scrolled ? "shadow-sm" : ""
        }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-x-1.5">
            <img src={logo} alt="QuizKen logo" className="max-w-8 max-h-8" />
            <span className="text-2xl font-bold mt-0.5">
              Quiz<span className="text-primary">Ken</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-foreground hover:text-primary transition-colors"
              onPointerDown={playClick}>
              {t('nav.home')}
            </Link>
            <Link
              to="/library"
              className="text-foreground hover:text-primary transition-colors flex items-center gap-1"
              onPointerDown={playClick}>
              {t('nav.library')}
            </Link>
            <Link
              to="/about"
              className="text-foreground hover:text-primary transition-colors"
              onPointerDown={playClick}>
              {t('nav.about')}
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            {!loading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-0 rounded-3xl border-4 border-border hover:border-primary hover:text-primary active:scale-95 transition-all duration-200">
                        <User className="h-4 w-4" />
                        {user.email?.split("@")[0] || t('nav.account')}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 rounded-3xl border-4 border-primary/20 shadow-xl bg-white/95 backdrop-blur-sm p-2 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2">
                      <DropdownMenuItem disabled className="rounded-xl font-heading py-3 px-4 opacity-70">
                        {t('nav.loggedInWith')} {user.email}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border/50 my-1" />
                      <DropdownMenuItem asChild className="rounded-xl font-heading focus:bg-secondary/50 focus:text-primary cursor-pointer py-3 px-4 transition-colors duration-200">
                        <Link
                          to="/dashboard"
                          className="w-full flex items-center"
                          onPointerDown={playClick}>
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          {t('nav.dashboard')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setShowApiSettings(true)}
                        onSelect={playClick}
                        className="rounded-xl font-heading focus:bg-secondary/50 focus:text-primary cursor-pointer py-3 px-4 transition-colors duration-200">
                        <Settings className="h-4 w-4 mr-2" />
                        {t('nav.apiSettings')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border/50 my-1" />
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        onSelect={playClick}
                        className="rounded-xl font-heading text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer py-3 px-4 transition-colors duration-200">
                        <LogOut className="h-4 w-4 mr-2" />
                        {t('nav.logout')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setShowAuthModal(true)}
                    className="rounded-3xl border-4 border-border hover:border-primary hover:text-primary hover:bg-primary/10 transition-all duration-200 active:scale-95">
                    {t('nav.login')}
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            onPointerDown={playClick}>
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-b-4 border-primary/20 shadow-2xl p-6 space-y-6 animate-in slide-in-from-top-5 z-40 rounded-b-3xl">
            <div className="space-y-2">
              <Link
                to="/"
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-secondary/30 text-lg font-heading font-bold text-foreground transition-colors"
                onPointerDown={playClick}
                onClick={() => setIsOpen(false)}>
                <Home className="w-5 h-5 text-primary" />
                {t('nav.home')}
              </Link>
              <Link
                to="/library"
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-secondary/30 text-lg font-heading font-bold text-foreground transition-colors"
                onPointerDown={playClick}
                onClick={() => setIsOpen(false)}>
                <BookOpen className="w-5 h-5 text-primary" />
                {t('nav.library')}
              </Link>
              <Link
                to="/about"
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-secondary/30 text-lg font-heading font-bold text-foreground transition-colors"
                onPointerDown={playClick}
                onClick={() => setIsOpen(false)}>
                <Info className="w-5 h-5 text-primary" />
                {t('nav.about')}
              </Link>
            </div>

            <div className="border-t-2 border-dashed border-border pt-6 space-y-4">
              <div className="flex items-center justify-between px-2 p-2 rounded-2xl bg-secondary/20">
                <span className="text-base font-heading font-bold text-muted-foreground">{t('nav.language')}</span>
                <LanguageSwitcher />
              </div>

              {!loading && (
                <>
                  {user ? (
                    <div className="space-y-3">
                      <div className="px-2 pb-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          {t('nav.loggedInWith')}
                        </p>
                        <p className="text-base font-bold text-primary truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                        <Button
                          variant="outline"
                          className="w-full justify-start rounded-3xl border-4 border-border hover:border-primary hover:text-primary active:scale-95 transition-all duration-200 h-12 text-base font-heading"
                          onPointerDown={playClick}>
                          <LayoutDashboard className="h-5 w-5 mr-3" />
                          {t('nav.dashboard')}
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        onClick={() => setShowApiSettings(true)}
                        className="w-full justify-start rounded-3xl border-4 border-border hover:border-primary hover:text-primary active:scale-95 transition-all duration-200 h-12 text-base font-heading"
                        onPointerDown={playClick}>
                        <Settings className="h-5 w-5 mr-3" />
                        {t('nav.apiSettings')}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleSignOut}
                        className="w-full text-red-600 border-4 border-red-200 hover:bg-red-50 hover:border-red-400 justify-start rounded-3xl active:scale-95 transition-all duration-200 h-12 text-base font-heading">
                        <LogOut className="h-5 w-5 mr-3" />
                        {t('nav.logout')}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setShowAuthModal(true)}
                      className="w-full hover:bg-primary/10 hover:text-primary hover:border-primary rounded-3xl border-4 border-border transition-all duration-200 active:scale-95 h-12 text-lg font-heading font-bold">
                      {t('nav.login')}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* API Settings Dialog */}
      <Dialog open={showApiSettings} onOpenChange={setShowApiSettings}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cài đặt API</DialogTitle>
          </DialogHeader>
          <ApiKeySettings />
        </DialogContent>
      </Dialog>

      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </nav>
  );
};

export default Navbar;
