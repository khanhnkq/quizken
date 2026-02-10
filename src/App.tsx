import { useLayoutEffect, useEffect, lazy, Suspense } from "react";
import { ThemeManager } from "@/components/ThemeManager";
import { Toaster as HotToaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { gsap } from "gsap";
import { toast } from "@/hooks/use-toast";
import { shouldDisableScrollSmoother } from "@/utils/deviceDetection";
import { PageSkeleton } from "@/components/ui/loading-skeleton";

// Lazy-loaded pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const NotFound = lazy(() => import("./pages/NotFound"));
const QuizLibrary = lazy(() => import("./components/library/QuizLibrary"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const QuizDetailPage = lazy(() => import("./pages/QuizDetailPage"));
const PlayQuizPage = lazy(() => import("./pages/PlayQuizPage"));
const EnglishHub = lazy(() => import("./pages/EnglishHub"));
const Phase1View = lazy(() => import("./components/english/phases/Phase1View"));
const Phase2View = lazy(() => import("./components/english/phases/Phase2View"));
const MyNotebook = lazy(() => import("./components/english/MyNotebook"));
const QuizCreatePage = lazy(() => import("./pages/QuizCreatePage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const RedeemCode = lazy(() => import("./pages/RedeemCode"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const GameLobbyPage = lazy(() => import("./pages/GameLobbyPage"));
const GameHostPage = lazy(() => import("./pages/GameHostPage"));
const GameHostMatchPage = lazy(() => import("./pages/GameHostMatchPage"));
const GamePlayerPage = lazy(() => import("./pages/GamePlayerPage"));
const GamePlayerMatchPage = lazy(() => import("./pages/GamePlayerMatchPage"));



// Preload functions for faster navigation
const preloadRoutes = () => {
  // Preload main routes after initial render
  import("./pages/Index");
  import("./pages/About");
  import("./components/library/QuizLibrary");
  import("./pages/Dashboard");
  import("./pages/EnglishHub");
};

import { SoundProvider } from "@/contexts/SoundContext";
import { ChillMusicProvider } from "@/contexts/ChillMusicContext";
import { ChatImagesProvider } from "@/contexts/ChatImagesContext";
import { Analytics } from "@vercel/analytics/react";
import "@/i18n"; // Initialize i18n
import { GlobalLevelNotification } from "@/components/common/GlobalLevelNotification";
import { GlobalResumeButton } from "@/components/common/GlobalResumeButton";
import { GlobalCreateButton } from "@/components/common/GlobalCreateButton";
import { GlobalChatTicker } from "@/components/chat/GlobalChatTicker";
import { GlobalQuizListener } from "@/components/common/GlobalQuizListener";
import { CustomCursor } from "@/components/ui/CustomCursor";

import { NavbarActionProvider } from "@/contexts/NavbarActionContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";


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

        <Route path="/about" element={<About />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Quiz Domain */}
          <Route path="/quiz/create" element={<QuizCreatePage />} />
          <Route path="/quiz/library" element={<QuizLibrary />} />

          {/* User Domain */}
          <Route path="/user/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Multiplayer Game Host */}
          <Route path="/game/lobby" element={<GameLobbyPage />} />
          <Route path="/game/host/:roomId" element={<GameHostPage />} />
          <Route path="/game/host/:roomId/play" element={<GameHostMatchPage />} />
        </Route>

        <Route path="/quiz/play/:quizId" element={<PlayQuizPage />} />
        <Route path="/quiz/result/:attemptId" element={<QuizDetailPage />} />

        {/* Public User Routes */}
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/redeem" element={<RedeemCode />} />

        {/* Chat */}
        <Route path="/chat" element={<ChatPage />} />

        {/* Multiplayer Game */}
        {/* Multiplayer Game Public Routes */}
        {/* Host routes moved to protected section */}
        <Route path="/game/play/:roomId" element={<GamePlayerPage />} />
        <Route path="/game/play/:roomId/match" element={<GamePlayerMatchPage />} />
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
        // NOTE: ScrollSmoother instance is created in Index.tsx where #smooth-wrapper lives
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
        "[data-hot-toast]",
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
        <ThemeManager />
        <TooltipProvider>
          <ChillMusicProvider>
            <ChatImagesProvider>
              {/* 👇 Toaster nằm ngoài ScrollSmoother */}
              <HotToaster />
              <GlobalLevelNotification />
              <ToastBroadcastReceiver />
              <BrowserRouter
                future={{ v7_relativeSplatPath: true }}>
                <AuthProvider>
                  <NavbarActionProvider>
                  <AppRoutes />
                  <GlobalResumeButton />
                  <GlobalCreateButton />
                  <GlobalChatTicker />
                  <GlobalQuizListener />

                  </NavbarActionProvider>
                </AuthProvider>
              </BrowserRouter>
              <Analytics />
            </ChatImagesProvider>
          </ChillMusicProvider>
        </TooltipProvider>
      </SoundProvider>
    </QueryClientProvider>
  );
};

export default App;
