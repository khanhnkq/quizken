import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "gsap";
import ScrollSmoother from "gsap/ScrollSmoother";
import { ArrowUp, Sparkles } from '@/lib/icons';
import { Button } from "@/components/ui/button";
import { scrollToTarget } from "@/lib/scroll";
import { useTranslation } from "react-i18next";

const ScrollToGeneratorButtonWrapper: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [position, setPosition] = useState({ top: 0, right: 16 });
  const [isScrolledPast, setIsScrolledPast] = useState(false);

  // Scroll to generator function using unified utility
  const scrollToSection = useCallback(() => {
    scrollToTarget("generator", { align: "top", offset: 100 });
  }, []);

  // Check if scrolled past generator section
  useEffect(() => {
    let rafId: number | undefined;

    const checkScrollPosition = () => {
      const generatorElement = document.getElementById("generator");
      if (generatorElement) {
        const rect = generatorElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Show button when bottom of generator section has scrolled past the top of viewport
        const hasScrolledPastGenerator = rect.bottom < 0;

        // Also check if user is currently in any section below generator
        const sectionsBelow = ['quiz', 'features', 'testimonials', 'stats', 'footer'];
        let isInSectionBelow = false;

        for (const sectionId of sectionsBelow) {
          const sectionElement = document.getElementById(sectionId);
          if (sectionElement) {
            const sectionRect = sectionElement.getBoundingClientRect();
            // Check if this section is currently visible in viewport
            if (sectionRect.top < viewportHeight && sectionRect.bottom > 0) {
              isInSectionBelow = true;
              break;
            }
          }
        }

        setIsScrolledPast(hasScrolledPastGenerator && isInSectionBelow);
      }
    };

    const handleScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(checkScrollPosition);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    checkScrollPosition(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  // Only show on Index page and when scrolled past generator
  const shouldShow = location.pathname === "/" && isScrolledPast;

  // Update position based on ScrollSmoother or native scroll
  useEffect(() => {
    const updatePosition = () => {
      // Try to get smoother instance if available
      const smoother = ScrollSmoother && ScrollSmoother.get ? ScrollSmoother.get() : null;

      if (!smoother) {
        // Native scroll positioning (fixed relative to viewport)
        // We use state to force re-render but positioning is handled via style top/right relative to document is wrong for fixed
        // Wait, the original code used absolute positioning with top calculated from virtualScrollTop
        // If no smoother, we should probably use fixed positioning or calculate based on window.scrollY

        // For native scroll, we want fixed position at bottom right
        // But the component uses absolute positioning. 
        // Let's stick to the original logic: absolute positioning for GSAP, but maybe fixed for native?
        // Actually, if smoother is null, original code set top: window.innerHeight - 80. 
        // This puts it at bottom of FIRST viewport page if absolute 0,0 is top-left of document.
        // But if position is absolute, it scrolls WITH the page unless updated constantly.

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        setPosition({
          top: scrollTop + window.innerHeight - 80,
          right: 16
        });
        return;
      }

      const virtualScrollTop = smoother.scrollTop();
      const viewportHeight = window.innerHeight;

      setPosition({
        top: virtualScrollTop + viewportHeight - 80,
        right: 24,
      });
    };

    if (shouldShow) {
      updatePosition();
      // Use GSAP ticker for high performance updates
      gsap.ticker.add(updatePosition);

      return () => {
        gsap.ticker.remove(updatePosition);
      };
    }
  }, [shouldShow]);

  if (!shouldShow) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: `${position.top}px`,
        right: `${position.right}px`,
        zIndex: 50,
      }}
      className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Button
        onClick={scrollToSection}
        size="lg"
        className="group relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-black hover:text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full p-4 h-auto min-w-[60px] md:min-w-auto md:px-6 hover:scale-105 active:scale-95"
        aria-label={t("common.scrollToGenerator", "Cuộn tới trình tạo quiz")}>
        {/* Background animation */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-full" />

        {/* Pulse effect for attention */}
        <div className="absolute inset-0 rounded-full bg-primary opacity-20 animate-ping" />

        {/* Mobile: Only icons */}
        <div className="flex items-center gap-2 md:hidden relative z-10">
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
          <ArrowUp className="w-4 h-4 group-hover:translate-y-[-2px] transition-transform duration-200" />
        </div>

        {/* Desktop: Icons + text */}
        <div className="hidden md:flex items-center gap-2 relative z-10">
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
          <span className="font-medium">{t("common.createQuiz", "Tạo Quiz")}</span>
          <ArrowUp className="w-4 h-4 group-hover:translate-y-[-2px] transition-transform duration-200" />
        </div>
      </Button>
    </div>
  );
};

export default ScrollToGeneratorButtonWrapper;
