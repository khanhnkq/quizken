import { useLayoutEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/dist/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);

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
          smooth: 1.2, // reduced smoothness for faster scroll feel
          effects: false,
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

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
