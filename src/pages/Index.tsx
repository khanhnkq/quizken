import { useEffect, useRef, lazy, Suspense, useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import HomeHero from "@/components/sections/HomeHero";
import QuizGenerator from "@/components/quiz/QuizGenerator";
import Footer from "@/components/layout/Footer";
import SeoMeta from "@/components/SeoMeta";
import { shouldDisableScrollSmoother } from "@/utils/deviceDetection";
import { generateHomepageSchema } from "@/lib/seoSchemas";
import { ComponentSkeleton } from "@/components/ui/loading-skeleton";
import { IntroAnimation } from "@/components/layout/IntroAnimation";
import { gsap } from "gsap";

// Lazy load heavy components
const Features = lazy(() => import("@/components/sections/Features"));

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasScrolled = useRef(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // Entry Animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Navbar (if not already animated globally, but good to reinforce)
      gsap.from("nav", {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.2
      });

      // Hero Section Elements
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-badge", {
        y: 20,
        opacity: 0,
        duration: 0.6,
      })
        .from(".hero-title", {
          y: 50,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
        }, "-=0.4")
        .from(".hero-description", {
          y: 30,
          opacity: 0,
          duration: 0.8,
        }, "-=0.6")
        .from(".hero-input", {
          scale: 0.9,
          opacity: 0,
          duration: 0.6,
          ease: "back.out(1.7)",
        }, "-=0.4")
        .from(".hero-floating-icon", {
          scale: 0,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "elastic.out(1, 0.5)",
        }, "-=0.4");

      // Quiz Generator Section
      gsap.from(".quiz-generator-section", {
        scrollTrigger: {
          trigger: ".quiz-generator-section",
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      // Features Section
      gsap.from(".features-section", {
        scrollTrigger: {
          trigger: ".features-section",
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

    }, mainRef);

    return () => ctx.revert();
  }, []);

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
                `top ${headerHeight + marginCompensation}px`
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
          if (!quizElement) return;
          // Get element position relative to document
          const rect = quizElement.getBoundingClientRect();
          const scrollTop = window.scrollY ?? document.documentElement.scrollTop;
          const elementTop = rect.top + scrollTop;
          const nav = document.querySelector("nav");
          const headerHeight = nav ? nav.clientHeight : 64;
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
      return () => { };
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
      <IntroAnimation />
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
          image: "https://quizken.vercel.app/image/seo.jpg",
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
      <div ref={mainRef} className="min-h-screen pt-0" id="smooth-wrapper">
        <div id="smooth-content">
          <HomeHero />
          <div className="quiz-generator-section">
            <QuizGenerator />
          </div>

          {/* Lazy load heavy components with Intersection Observer */}
          <Suspense fallback={<ComponentSkeleton className="py-16" />}>
            <div className="features-section">
              <Features />
            </div>
          </Suspense>

          <Footer />
        </div>
      </div>
    </>
  );
};

export default Index;
