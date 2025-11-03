import { useEffect, useRef, lazy, Suspense } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import QuizGenerator from "@/components/quiz/QuizGenerator";
import Footer from "@/components/layout/Footer";
import SeoMeta from "@/components/SeoMeta";
import { shouldDisableScrollSmoother } from "@/utils/deviceDetection";
import { generateHomepageSchema } from "@/lib/seoSchemas";
import { ComponentSkeleton } from "@/components/ui/loading-skeleton";

// Lazy load heavy components
const Features = lazy(() => import("@/components/sections/Features"));

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

      const scrollToQuizSection = async () => {
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

        // Try ScrollSmoother first (only on desktop)
        if (!shouldDisableScrollSmoother()) {
          try {
            const { default: ScrollSmoother } = await import(
              "gsap/ScrollSmoother"
            );
            const smoother = ScrollSmoother.get();

            if (smoother) {
              const headerHeight =
                (document.querySelector("nav") as HTMLElement | null)
                  ?.clientHeight ?? 64;
              const marginCompensation = 8;
              // Use element target + explicit negative offset to account for sticky navbar
              smoother.scrollTo(
                quizElement,
                true,
                -(headerHeight + marginCompensation)
              );
              return; // Success, exit early
            }
          } catch (e) {
            // ScrollSmoother not available, fallback to native scroll
            console.log("ScrollSmoother not available, using native scroll");
          }
        }

        // Fallback to native scroll (mobile or when ScrollSmoother fails)
        fallbackScroll();

        function fallbackScroll() {
          // Get element position relative to document
          const rect = quizElement.getBoundingClientRect();
          const scrollTop =
            window.pageYOffset || document.documentElement.scrollTop;
          const elementTop = rect.top + scrollTop;
          const headerHeight =
            (document.querySelector("nav") as HTMLElement | null)
              ?.clientHeight ?? 64;
          const marginCompensation = 8;
          const offset = headerHeight + marginCompensation;
          const targetY = elementTop - offset;

          // Single method: native smooth scroll with navbar offset
          window.scrollTo({
            top: targetY,
            behavior: "smooth",
          });
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
    <>
      <SeoMeta
        title="Tạo Bài Kiểm Tra AI Miễn Phí - QuizKen"
        description="QuizKen giúp giáo viên và học sinh tạo bài kiểm tra trắc nghiệm với AI trong vài giây. Hỗ trợ 100+ chủ đề, tự động chấm điểm, xuất PDF."
        canonical="/"
        keywords={[
          "tạo bài kiểm tra AI",
          "quiz generator",
          "trắc nghiệm online",
          "generator quiz",
          "bài kiểm tra tự động",
          "học tập trực tuyến",
        ]}
        openGraph={{
          title: "QuizKen - Tạo Bài Kiểm Tra AI Miễn Phí",
          description: "Tạo bài kiểm tra chất lượng cao với AI.",
          url: "/",
          type: "website",
        }}
        twitter={{
          card: "summary_large_image",
          title: "QuizKen - AI Quiz Generator",
          description: "Tạo bài kiểm tra AI miễn phí",
        }}
        structuredData={generateHomepageSchema()}
      />
      {/* Navbar outside ScrollSmoother for proper sticky behavior */}
      <Navbar />
      <div className="min-h-screen" id="smooth-wrapper">
        <div id="smooth-content">
          <Hero />
          <QuizGenerator />

          {/* Lazy load heavy components with Intersection Observer */}
          <Suspense fallback={<ComponentSkeleton className="py-16" />}>
            <Features />
          </Suspense>

          <Footer />
        </div>
      </div>
    </>
  );
};

export default Index;
