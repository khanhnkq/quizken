import { Button } from "@/components/ui/button";
import { Menu, Sparkles, LogOut, User, Settings, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Link } from "react-router-dom";
import AuthModal from "./AuthModal";
import ApiKeySettings from "./ApiKeySettings";
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

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const { user, signOut, loading } = useAuth();

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
      const yOffset = -5; // Khoảng cách từ top (cho header/navbar)
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
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-2xl font-bold">
              Quiz<span className="text-primary">AI</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-foreground hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <Link
              to="/library"
              className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
              Thư viện
            </Link>
            <a
              href="#"
              className="text-foreground hover:text-primary transition-colors">
              Giới thiệu
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {user.email?.split("@")[0] || "Account"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem disabled>
                        Đã đăng nhập với {user.email}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setShowApiSettings(true)}
                        className="cursor-pointer">
                        <Settings className="h-4 w-4 mr-2" />
                        Cài đặt API
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleSignOut}
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
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link
              to="/"
              className="block text-foreground hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}>
              Trang chủ
            </Link>
            <Link
              to="/library"
              className="block text-foreground hover:text-primary transition-colors flex items-center gap-2"
              onClick={() => setIsOpen(false)}>
              Thư viện
            </Link>
            <a
              href="#"
              className="block text-foreground hover:text-primary transition-colors">
              Giới thiệu
            </a>
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
