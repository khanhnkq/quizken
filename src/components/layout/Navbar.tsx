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
};

export default Navbar;
