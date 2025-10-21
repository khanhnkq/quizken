import { useState, useEffect, useCallback } from 'react';

interface UseScrollToSectionOptions {
  sectionId: string;
  sectionsBelow?: string[]; // Sections that are below the target section
  offset?: number;
  debounceDelay?: number;
}

interface UseScrollToSectionReturn {
  isInSectionsBelow: boolean;
  scrollToSection: () => void;
}

export const useScrollToSection = ({
  sectionId,
  sectionsBelow = [],
  offset = 100,
  debounceDelay = 100,
}: UseScrollToSectionOptions): UseScrollToSectionReturn => {
  const [isInSectionsBelow, setIsInSectionsBelow] = useState(false);

  const scrollToSection = useCallback(() => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -100; // Offset for navbar/header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth',
      });
    }
  }, [sectionId]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    let rafId: number | undefined;

    const checkSections = () => {
      const targetElement = document.getElementById(sectionId);
      if (!targetElement) return;

      const targetRect = targetElement.getBoundingClientRect();
      const targetBottom = targetRect.bottom;
      const viewportHeight = window.innerHeight;

      // Check if we're in any of the sections below the target section
      let inSectionBelow = false;

      // First check if we've scrolled past the target section
      if (targetBottom < -offset) {
        // Now check if we're currently viewing any of the sections below
        for (const belowSectionId of sectionsBelow) {
          const belowElement = document.getElementById(belowSectionId);
          if (belowElement) {
            const belowRect = belowElement.getBoundingClientRect();
            // Check if this section is currently visible in viewport
            if (belowRect.top < viewportHeight && belowRect.bottom > 0) {
              inSectionBelow = true;
              break;
            }
          }
        }
      }

      setIsInSectionsBelow(inSectionBelow);
    };

    const handleScroll = () => {
      // If no debounce, use requestAnimationFrame for better performance
      if (debounceDelay === 0) {
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        rafId = requestAnimationFrame(checkSections);
      } else {
        // Use debounce for better performance with delay
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(checkSections, debounceDelay);
      }
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    checkSections();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [sectionId, sectionsBelow, offset, debounceDelay]);

  return {
    isInSectionsBelow,
    scrollToSection,
  };
};
