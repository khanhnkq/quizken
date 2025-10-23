import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import QuizGenerator from "@/components/quiz/QuizGenerator";
import Features from "@/components/sections/Features";
import Footer from "@/components/layout/Footer";
import ScrollSmoother from "gsap/ScrollSmoother";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasScrolled = useRef(false);

  useEffect(() => {
    // Check if we need to scroll to quiz section
    const state = location.state as { scrollToQuiz?: boolean } | null;
    const params = new URLSearchParams(location.search);
    const hash = location.hash?.replace("#", "");
    const shouldScroll =
      !!state?.scrollToQuiz ||
      hash === "generator" ||
      hash === "quiz" ||
      params.get("scrollTo") === "generator" ||
      params.get("scrollTo") === "quiz";

    if (shouldScroll && !hasScrolled.current) {
      hasScrolled.current = true;

      let retryCount = 0;
      const maxRetries = 50; // Increase retries

      const scrollToQuizSection = () => {
        // Try to find quiz section first (where user does the quiz)
        const quizElement =
          document.getElementById("quiz") ||
          document.getElementById("generator");

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
            // ignore, will fallback below
          }
        }
        // Always run fallback for consistency across environments
        fallbackScroll();

        function fallbackScroll() {
          // Get element position relative to document
          const rect = quizElement.getBoundingClientRect();
          const scrollTop =
            window.pageYOffset || document.documentElement.scrollTop;
          const elementTop = rect.top + scrollTop;
          const offset = 100;
          const targetY = elementTop - offset;

          // Try both methods
          window.scrollTo({
            top: targetY,
            behavior: "smooth",
          });

          // Also try scrollIntoView as backup
          setTimeout(() => {
            quizElement.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }, 100);
        }
      };

      // Start immediately without additional delay
      try {
        requestAnimationFrame(scrollToQuizSection);
        // Clear state after scroll starts
        setTimeout(() => {
          navigate(location.pathname, { replace: true, state: {} });
        }, 1500);
      } catch (e) {
        console.error("Error in scroll:", e);
      }
      return () => {};
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
