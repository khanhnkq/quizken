import { useLayoutEffect, useEffect } from "react";
import { Toaster as HotToaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/dist/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import Index from "./pages/Index";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import QuizLibrary from "./components/library/QuizLibrary";
import ScrollToGeneratorButtonWrapper from "./components/ScrollToGeneratorButtonWrapper";
import { SoundProvider } from "@/contexts/SoundContext";
import { ChillMusicProvider } from "@/contexts/ChillMusicContext";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);

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

// Page transitions wrapper component
const AnimatedRoutes = () => {
  const location = useLocation();

  // Page transition variants - ultra-light for performance
  const pageVariants = {
    initial: {
      opacity: 0,
    },
    in: {
      opacity: 1,
    },
    out: {
      opacity: 0,
    },
  };

  const pageTransition = {
    duration: 0.15,
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="min-h-screen">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/library" element={<QuizLibrary />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const queryClient = new QueryClient();

const App = () => {
  useLayoutEffect(() => {
    // Initialize ScrollSmoother with delay
    const timer = setTimeout(() => {
      if (
        document.querySelector("#smooth-wrapper") &&
        document.querySelector("#smooth-content")
      ) {
        ScrollSmoother.create({
          wrapper: "#smooth-wrapper",
          content: "#smooth-content",
          smooth: 0.5, // very reduced for instant feel
          effects: false,
          smoothTouch: 0.1, // minimal smoothing on touch devices
          normalizeScroll: true, // better cross-browser consistency
        });
      } else {
        console.log(
          "ScrollSmoother elements not found, skipping initialization"
        );
      }
    }, 1);

    // Remove section animations to preserve text content appearance
    // Keep only ScrollSmoother for smooth scrolling

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const updateToastPosition = () => {
      const smoother = ScrollSmoother.get();
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

    updateToastPosition();
    gsap.ticker.add(updateToastPosition);

    return () => {
      gsap.ticker.remove(updateToastPosition);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SoundProvider>
        <TooltipProvider>
          <ChillMusicProvider>
            {/* 👇 Toaster nằm ngoài ScrollSmoother */}
            <HotToaster />
            <ToastBroadcastReceiver />
            <BrowserRouter>
              <AnimatedRoutes />
              {/* 👇 ScrollToGeneratorButton renders outside AnimatedRoutes to avoid fixed position issues */}
              <ScrollToGeneratorButtonWrapper />
            </BrowserRouter>
          </ChillMusicProvider>
        </TooltipProvider>
      </SoundProvider>
    </QueryClientProvider>
  );
};

export default App;
