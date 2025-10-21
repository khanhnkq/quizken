import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import QuizGenerator from "@/components/quiz/QuizGenerator";
import Features from "@/components/sections/Features";
import Footer from "@/components/layout/Footer";
import { ScrollSmoother } from "gsap/dist/ScrollSmoother";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasScrolled = useRef(false);

  useEffect(() => {
    // Check if we need to scroll to quiz section
    const state = location.state as { scrollToQuiz?: boolean } | null;
    
    if (state?.scrollToQuiz && !hasScrolled.current) {
      hasScrolled.current = true;
      
      let retryCount = 0;
      const maxRetries = 50; // Increase retries
      let timerCleared = false;

      const scrollToQuizSection = () => {
        // Try to find quiz section first (where user does the quiz)
        const quizElement = document.getElementById('quiz');
        
        if (!quizElement && retryCount < maxRetries) {
          // Retry if element not found yet
          retryCount++;
          requestAnimationFrame(scrollToQuizSection);
          return;
        }

        if (!quizElement) {
          return;
        }

        // Try multiple scroll methods for maximum compatibility
        const smoother = ScrollSmoother.get();
        
        if (smoother) {
          try {
            // Smooth scroll with animation (true = smooth, false = instant)
            smoother.scrollTo(quizElement, true, "top 20px");
          } catch (e) {
            fallbackScroll();
          }
        } else {
          fallbackScroll();
        }
        
        function fallbackScroll() {
          // Get element position relative to document
          const rect = quizElement.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const elementTop = rect.top + scrollTop;
          const offset = 100;
          const targetY = elementTop - offset;
          
          // Try both methods
          window.scrollTo({
            top: targetY,
            behavior: 'smooth',
          });
          
          // Also try scrollIntoView as backup
          setTimeout(() => {
            quizElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
            });
          }, 100);
        }
      };

      // Wait for page transition and render to complete
      const timer = setTimeout(() => {
        if (timerCleared) return;
        
        try {
          requestAnimationFrame(scrollToQuizSection);
          // Clear state after scroll completes
          setTimeout(() => {
            navigate(location.pathname, { replace: true, state: {} });
          }, 1500);
        } catch (e) {
          console.error('Error in scroll:', e);
        }
      }, 800);

      return () => {
        timerCleared = true;
        clearTimeout(timer);
      };
    }
  }, [location, navigate]);

  // Reset hasScrolled when leaving the page
  useEffect(() => {
    return () => {
      hasScrolled.current = false;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <QuizGenerator />
      <Features />
      <Footer />
    </div>
  );
};

export default Index;
