import * as React from "react";
import {  useEffect, useState, useCallback  } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "gsap";
import ScrollSmoother from "gsap/ScrollSmoother";
import { ArrowUp, Sparkles } from '@/lib/icons';
import { Button } from "@/components/ui/button";
import { shouldDisableScrollSmoother } from "@/utils/deviceDetection";

const ScrollToGeneratorButtonWrapper: React.FC = () => {
  const location = useLocation();
  const [position, setPosition] = useState({ top: 0, right: 16 });
  const [isScrolledPast, setIsScrolledPast] = useState(false);

  // Scroll to generator function with improved logic
  const scrollToSection = useCallback(() => {
    const element = document.getElementById("generator");
    if (element) {
      // Try ScrollSmoother first (only on desktop)
      if (!shouldDisableScrollSmoother()) {
        try {
          const { default: ScrollSmoother } = import("gsap/ScrollSmoother");
          const smoother = ScrollSmoother.get();
          
          if (smoother) {
            smoother.scrollTo(element, true, "top 20px");
            return;
          }
        } catch (e) {
          // ScrollSmoother not available, fallback to native scroll
        }
      }
      
      // Fallback to native scroll
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
    }
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
        // This means user has scrolled past the generator section
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
        
        // Show button if scrolled past generator AND currently in a section below
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

  // Update position based on ScrollSmoother
  useEffect(() => {
    const updatePosition = () => {
      const smoother = ScrollSmoother.get();
      if (!smoother) {
        setPosition({ top: window.innerHeight - 80, right: 16 });
        return;
      }

      const virtualScrollTop = smoother.scrollTop();
      const viewportHeight = window.innerHeight;

      setPosition({
        top: virtualScrollTop + viewportHeight - 80, // 80px from bottom
        right: 24, // 24px from right
      });
    };

    if (shouldShow) {
      updatePosition();
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
        className="group relative overflow-hidden bg-gradient-to-r from-[#B5CC89] to-[#9BB76A] hover:from-[#9BB76A] hover:to-[#8AA659] text-black hover:text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full p-4 h-auto min-w-[60px] md:min-w-auto md:px-6 hover:scale-105 active:scale-95"
        aria-label="Trở về section tạo quiz">
        {/* Background animation */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-full" />
        
        {/* Pulse effect for attention */}
        <div className="absolute inset-0 rounded-full bg-[#B5CC89] opacity-20 animate-ping" />
        
        {/* Mobile: Only icons */}
        <div className="flex items-center gap-2 md:hidden relative z-10">
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
          <ArrowUp className="w-4 h-4 group-hover:translate-y-[-2px] transition-transform duration-200" />
        </div>

        {/* Desktop: Icons + text */}
        <div className="hidden md:flex items-center gap-2 relative z-10">
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
          <span className="font-medium">Tạo Quiz</span>
          <ArrowUp className="w-4 h-4 group-hover:translate-y-[-2px] transition-transform duration-200" />
        </div>
      </Button>
    </div>
  );
};

export default ScrollToGeneratorButtonWrapper;
