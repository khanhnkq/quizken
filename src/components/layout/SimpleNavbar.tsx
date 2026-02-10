import React from 'react';
import { useNavbarActions } from "@/contexts/NavbarActionContext";
import { cn } from "@/lib/utils";

export const SimpleNavbar = () => {
  const { actions } = useNavbarActions();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
      <div className="container mx-auto px-4 h-full flex items-center">
        {actions}
      </div>
    </nav>
  );
};
