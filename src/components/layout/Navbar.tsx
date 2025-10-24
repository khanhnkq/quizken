import { Button } from "@/components/ui/button";
import { Menu, LogOut, User, Settings } from "@/lib/icons";
import { useState, useEffect } from "react";
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

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const { user, signOut, loading } = useAuth();
  const { play } = useAudio();
  const playClick = () => play("click");

  // Lắng nghe sự kiện toàn cục để mở modal đăng nhập từ bất kỳ nơi nào
  useEffect(() => {
    const handleOpenAuth = (_e: Event) => setShowAuthModal(true);
    window.addEventListener("open-auth-modal", handleOpenAuth);
    return () => {
      window.removeEventListener("open-auth-modal", handleOpenAuth);
    };
  }, []);

  const scrollToGenerator = () => {
    const element = document.getElementById("generator");
    if (element) {
      const headerHeight =
        (document.querySelector("nav") as HTMLElement | null)?.clientHeight ??
        64;
      const yOffset = -(headerHeight + 8); // bù đúng chiều cao navbar + margin
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
    }
    setIsOpen(false);
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <img src={logo} alt="QuizKen logo" className="w-16 h-16" />
            <span className="text-2xl font-bold -ml-3 mt-1.5">
              Quiz<span className="text-primary">Ken</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-foreground hover:text-primary transition-colors"
              onPointerDown={playClick}>
              Trang chủ
            </Link>
            <Link
              to="/library"
              className="text-foreground hover:text-primary transition-colors flex items-center gap-1"
              onPointerDown={playClick}>
              Thư viện
            </Link>
            <Link
              to="/about"
              className="text-foreground hover:text-primary transition-colors"
              onPointerDown={playClick}>
              Giới thiệu
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-0">
                        <User className="h-4 w-4" />
                        {user.email?.split("@")[0] || "Tài khoản"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem disabled>
                        Đã đăng nhập với {user.email}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
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
                        Đăng xuất
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setShowAuthModal(true)}
                    className="hover:bg-primary hover:text-primary-foreground hover:border-foreground transition-colors">
                    Đăng nhập
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
              Trang chủ
            </Link>
            <Link
              to="/library"
              className="block text-foreground hover:text-primary transition-colors flex items-center gap-2"
              onPointerDown={playClick}
              onClick={() => setIsOpen(false)}>
              Thư viện
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
                        Đã đăng nhập với {user.email}
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setShowApiSettings(true)}
                        className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Cài đặt API
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleSignOut}
                        className="w-full text-red-600 border-red-200 hover:bg-red-50 justify-start">
                        <LogOut className="h-4 w-4 mr-2" />
                        Đăng xuất
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setShowAuthModal(true)}
                      className="w-full hover:bg-primary hover:text-primary-foreground hover:border-foreground transition-colors">
                      Đăng nhập
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
