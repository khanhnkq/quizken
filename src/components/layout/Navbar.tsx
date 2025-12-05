import { Button } from "@/components/ui/button";
import { Menu, LogOut, User, Settings, LayoutDashboard } from "@/lib/icons";
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
              Giới thiệu
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
                        {user.email?.split("@")[0] || "Tài khoản"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem disabled>
                        Đã {t('nav.login')} với {user.email}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          to="/dashboard"
                          className="cursor-pointer"
                          onPointerDown={playClick}>
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          {t('nav.dashboard')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setShowApiSettings(true)}
                        onSelect={playClick}
                        className="cursor-pointer">
                        <Settings className="h-4 w-4 mr-2" />
                        Cài đặt API
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        onSelect={playClick}
                        className="text-red-600">
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
          <div className="md:hidden py-4 space-y-4">
            <Link
              to="/"
              className="block text-foreground hover:text-primary transition-colors"
              onPointerDown={playClick}
              onClick={() => setIsOpen(false)}>
              {t('nav.home')}
            </Link>
            <Link
              to="/library"
              className="block text-foreground hover:text-primary transition-colors flex items-center gap-2"
              onPointerDown={playClick}
              onClick={() => setIsOpen(false)}>
              {t('nav.library')}
            </Link>
            <Link
              to="/about"
              className="block text-foreground hover:text-primary transition-colors"
              onPointerDown={playClick}
              onClick={() => setIsOpen(false)}>
              Giới thiệu
            </Link>
            <div className="pt-4 space-y-2">
              {!loading && (
                <>
                  {user ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Đã {t('nav.login')} với {user.email}
                      </p>
                      <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                        <Button
                          variant="outline"
                          className="w-full justify-start rounded-3xl border-4 border-border hover:border-primary hover:text-primary active:scale-95 transition-all duration-200"
                          onPointerDown={playClick}>
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          {t('nav.dashboard')}
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        onClick={() => setShowApiSettings(true)}
                        className="w-full justify-start rounded-3xl border-4 border-border hover:border-primary hover:text-primary active:scale-95 transition-all duration-200"
                        onPointerDown={playClick}>
                        <Settings className="h-4 w-4 mr-2" />
                        Cài đặt API
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleSignOut}
                        className="w-full text-red-600 border-4 border-red-200 hover:bg-red-50 hover:border-red-400 justify-start rounded-3xl active:scale-95 transition-all duration-200">
                        <LogOut className="h-4 w-4 mr-2" />
                        {t('nav.logout')}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setShowAuthModal(true)}
                      className="w-full hover:bg-primary/10 hover:text-primary hover:border-primary rounded-3xl border-4 border-border transition-all duration-200 active:scale-95">
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
