import React from 'react';
import { ArrowUp, Sparkles } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { useScrollToSection } from '@/hooks/useScrollToSection';

const ScrollToGeneratorButton: React.FC = () => {
  const { isInSectionsBelow, scrollToSection } = useScrollToSection({
    sectionId: 'generator',
    sectionsBelow: ['quiz', 'features', 'footer'], // Show when in Quiz, Features or Footer sections
    offset: 100,
    debounceDelay: 100,
  });

  if (!isInSectionsBelow) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Button
        onClick={scrollToSection}
        size="lg"
        className="group relative overflow-hidden bg-gradient-to-r from-[#B5CC89] to-[#9BB76A] hover:from-[#9BB76A] hover:to-[#8AA659] text-black hover:text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full p-4 h-auto min-w-[60px] md:min-w-auto md:px-6"
        aria-label="Trở về section tạo quiz"
      >
        {/* Background animation */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-full" />
        
        {/* Mobile: Only icons */}
        <div className="flex items-center gap-2 md:hidden">
          <Sparkles className="w-5 h-5" />
          <ArrowUp className="w-4 h-4" />
        </div>
        
        {/* Desktop: Icons + text */}
        <div className="hidden md:flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">Tạo Quiz</span>
          <ArrowUp className="w-4 h-4 group-hover:translate-y-[-2px] transition-transform duration-200" />
        </div>
      </Button>
    </div>
  );
};

export default ScrollToGeneratorButton;
