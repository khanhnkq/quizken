import { useLayoutEffect, useEffect, lazy, Suspense } from "react";
import { Toaster as HotToaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import EnglishHub from "./pages/EnglishHub";
import Phase1View from "./components/english/phases/Phase1View";
import Phase2View from "./components/english/phases/Phase2View";
import MyNotebook from "./components/english/MyNotebook";
import { gsap } from "gsap";
import { toast } from "@/hooks/use-toast";
import { shouldDisableScrollSmoother } from "@/utils/deviceDetection";
import { PageSkeleton } from "@/components/ui/loading-skeleton";
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const NotFound = lazy(() => import("./pages/NotFound"));
const QuizLibrary = lazy(() => import("./components/library/QuizLibrary"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const QuizDetailPage = lazy(() => import("./pages/QuizDetailPage"));
const PlayQuizPage = lazy(() => import("./pages/PlayQuizPage"));

// Preload functions for faster navigation
const preloadRoutes = () => {
  // Preload main routes after initial render
  import("./pages/Index");
  import("./pages/About");
  import("./components/library/QuizLibrary");
  import("./pages/Dashboard");
};

import { SoundProvider } from "@/contexts/SoundContext";
import { ChillMusicProvider } from "@/contexts/ChillMusicContext";
import { Analytics } from "@vercel/analytics/react";
import "@/i18n"; // Initialize i18n
import { GlobalLevelNotification } from "@/components/common/GlobalLevelNotification";
import { GlobalResumeButton } from "@/components/common/GlobalResumeButton";
import { GlobalCreateButton } from "@/components/common/GlobalCreateButton";
import { GlobalQuizListener } from "@/components/common/GlobalQuizListener";
import { CustomCursor } from "@/components/ui/CustomCursor";

// GSAP plugins are loaded dynamically in useLayoutEffect to reduce initial bundle size

// Cross-page toast notification receiver
const ToastBroadcastReceiver = () => {
  useEffect(() => {
    const channel = new BroadcastChannel("quiz-notifications");

    channel.onmessage = (event) => {
      const { type, title, description, variant } = event.data;

      // Only handle specific notification types
      if (type === "quiz-complete" || type === "quiz-failed") {
        toast({
          title,
          description,
          variant,
        });
      }
    };

    return () => channel.close();
  }, []);

  return null; // Invisible component
};

// Simple routes component without heavy transitions
const AppRoutes = () => {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        {/* Static Pages */}
        <Route path="/" element={<Index />} />
        <Route path="/english" element={<EnglishHub />} />
        <Route path="/english/phase/1/vocab" element={<Phase1View />} />
        <Route path="/english/phase/2/grammar" element={<Phase2View />} />
        <Route path="/english/notebook" element={<MyNotebook />} />


        <Route path="/about" element={<About />} />

        {/* Quiz Domain */}
        <Route path="/quiz/library" element={<QuizLibrary />} />
        <Route path="/quiz/play/:quizId" element={<PlayQuizPage />} />
        <Route path="/quiz/result/:attemptId" element={<QuizDetailPage />} />

        {/* User Domain */}
        <Route path="/user/dashboard" element={<Dashboard />} />

        {/* Legacy redirects (optional - can remove later) */}
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const queryClient = new QueryClient();

const App = () => {
  // Preload routes after initial render for faster navigation
  useEffect(() => {
    // Delay preload to not block initial render
    const timer = setTimeout(preloadRoutes, 1000);
    return () => clearTimeout(timer);
  }, []);

  useLayoutEffect(() => {
    // Skip ScrollSmoother on mobile devices for better performance
    if (shouldDisableScrollSmoother()) {
      console.log("ScrollSmoother disabled on mobile device");
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const [{ default: ScrollSmoother }, { ScrollTrigger }] =
          await Promise.all([
            import("gsap/ScrollSmoother"),
            import("gsap/ScrollTrigger"),
          ]);
        if (!isMounted) return;
        gsap.registerPlugin(ScrollSmoother, ScrollTrigger);

        const timer = setTimeout(() => {
          if (
            document.querySelector("#smooth-wrapper") &&
            document.querySelector("#smooth-content")
          ) {
            ScrollSmoother.create({
              wrapper: "#smooth-wrapper",
              content: "#smooth-content",
              smooth: 0.5,
              effects: false,
              smoothTouch: 0.1,
              normalizeScroll: true,
            });
          } else {
            console.log(
              "ScrollSmoother elements not found, skipping initialization"
            );
          }
        }, 1);

        if (!isMounted) {
          clearTimeout(timer);
        }
      } catch (e) {
        console.error("Failed to load GSAP plugins:", e);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    // Skip toast positioning logic on mobile (uses native scroll)
    if (shouldDisableScrollSmoother()) {
      return;
    }

    let isMounted = true;
    type SmootherLike = { scrollTop: () => number };
    let getSmoother: null | (() => SmootherLike | null) = null;

    (async () => {
      try {
        const { default: ScrollSmoother } = await import("gsap/ScrollSmoother");
        if (!isMounted) return;
        getSmoother = () => ScrollSmoother.get();
      } catch {
        getSmoother = null;
      }
    })();

    const updateToastPosition = () => {
      const smoother = getSmoother ? getSmoother() : null;
      if (!smoother) return;

      const toastContainer = document.querySelector(
        "[data-hot-toast]"
      ) as HTMLElement | null;

      if (!toastContainer) return;

      const virtualScrollTop = smoother.scrollTop();

      toastContainer.style.position = "absolute";
      toastContainer.style.transform = "none";
      toastContainer.style.top = `${virtualScrollTop + 16}px`;
      toastContainer.style.right = "16px";
      toastContainer.style.zIndex = "9999";
    };

    const tickerFn = () => updateToastPosition();

    updateToastPosition();
    gsap.ticker.add(tickerFn);

    return () => {
      isMounted = false;
      gsap.ticker.remove(tickerFn);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SoundProvider>
        <TooltipProvider>
          <ChillMusicProvider>
            {/* 👇 Toaster nằm ngoài ScrollSmoother */}
            <HotToaster />
            <GlobalLevelNotification />
            <ToastBroadcastReceiver />
            <BrowserRouter
              future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <AppRoutes />
              <GlobalResumeButton />
              <GlobalCreateButton />
              <GlobalQuizListener />
            </BrowserRouter>
            <Analytics />
          </ChillMusicProvider>
        </TooltipProvider>
      </SoundProvider>
    </QueryClientProvider>
  );
};

export default App;
