import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Brain, Eye } from "@/lib/icons";
import { useState, useEffect, type MouseEvent } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import { shouldReduceAnimations } from "@/utils/deviceDetection";

const Hero = () => {
  const navigate = useNavigate();
  const scrollToGenerator = async () => {
    // Ưu tiên cuộn đến phần làm bài nếu đã có quiz; nếu chưa, cuộn đến trình tạo (generator)
    const element =
      document.getElementById("quiz") || document.getElementById("generator");
    if (!element) return;

    const headerHeight =
      (document.querySelector("nav") as HTMLElement | null)?.clientHeight ?? 64;
    const marginCompensation = 8;

    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const elementTop = rect.top + scrollTop;
    const targetY = elementTop - (headerHeight + marginCompensation);

    // Thử dùng GSAP ScrollSmoother nếu đang bật cho trang
    try {
      const { default: ScrollSmoother } = await import("gsap/ScrollSmoother");
      const smoother = ScrollSmoother.get();
      if (smoother) {
        smoother.scrollTo(targetY, true);
        return;
      }
    } catch {
      // ScrollSmoother không khả dụng -> fallback
    }

    // Fallback: native scroll với bù header cố định (loại bỏ backup thứ hai để tránh giật)
    window.scrollTo({
      top: targetY,
      behavior: "smooth",
    });
  };

  // Typing effect state
  const [displayText, setDisplayText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const fullText = "Tạo mọi bài kiểm tra với AI. Phù hợp với tất cả mọi người";

  useEffect(() => {
    let currentIndex = 0;
    // Reduce typing speed on mobile/low-end devices for better performance
    const typingSpeed = shouldReduceAnimations() ? 50 : 120;
    const displayTime = 2000; // 2 seconds before restarting

    let typeTimeout;
    let cursorTimeout;
    let restartTimeout;

    const restartTyping = () => {
      setDisplayText("");
      setShowCursor(true);
      currentIndex = 0;
      startTyping();
    };

    const startTyping = () => {
      const typeText = () => {
        if (currentIndex < fullText.length) {
          setDisplayText(fullText.slice(0, currentIndex + 1));
          currentIndex++;
          typeTimeout = setTimeout(typeText, typingSpeed);
        } else {
          // When typing completes, keep cursor visible and start countdown for restart
          restartTimeout = setTimeout(restartTyping, displayTime);
        }
      };

      typeText();
    };

    // Start typing immediately without delay
    const initialTimeout = setTimeout(startTyping, 200);

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(typeTimeout);
      clearTimeout(cursorTimeout);
      clearTimeout(restartTimeout);
    };
  }, []);

  const handleHoverEnter = (e: MouseEvent<HTMLButtonElement>) => {
    // Skip animations on mobile/low-end devices
    if (shouldReduceAnimations()) return;

    const target = e.currentTarget as HTMLButtonElement;
    gsap.to(target, {
      y: -2,
      scale: 1.04,
      boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
      duration: 0.18,
      ease: "power3.out",
    });
  };

  const handleHoverLeave = (e: MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget as HTMLButtonElement;
    gsap.to(target, {
      y: 0,
      scale: 1,
      boxShadow: "0 0 0 rgba(0,0,0,0)",
      duration: 0.22,
      ease: "power3.inOut",
    });
  };

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-b from-secondary/30 to-background min-h-[90svh] md:min-h-screen py-16 sm:py-20 md:py-28 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8 lg:space-y-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-normal leading-snug md:leading-normal group hover:text-primary transition-all duration-500 hover:drop-shadow-2xl hover:scale-105 cursor-pointer">
            Tạo{" "}
            <span className="text-primary group-hover:text-yellow-300 group-hover:scale-110 group-hover:animate-pulse transition-all duration-700">
              Bài Kiểm Tra Tuyệt Vời
            </span>{" "}
            với{" "}
            <span className="text-primary group-hover:text-yellow-300 group-hover:scale-110 group-hover:animate-pulse transition-all duration-700">
              AI
            </span>{" "}
            trong vài giây
          </h1>
          <div className="h-14 sm:h-14 md:h-16 lg:h-20 flex items-center justify-center">
            {" "}
            {/* Fixed height container */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-sans leading-relaxed">
              {displayText}
              {showCursor && (
                <span
                  className="inline-block w-1 h-5 md:h-6 ml-1 animate-slow-blink"
                  style={{ backgroundColor: "#B5CC89" }}></span>
              )}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 md:gap-6 justify-center">
            <Button
              variant="hero"
              size="lg"
              className="group text-base flex items-center gap-2 w-full sm:w-auto hover:bg-black hover:text-white transition-colors"
              onClick={scrollToGenerator}
              onMouseEnter={handleHoverEnter}
              onMouseLeave={handleHoverLeave}>
              Tạo Bài Kiểm Tra Ngay
              <div className="bg-[#B5CC89] p-1 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-black group-hover:text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </div>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base w-full sm:w-auto hover:bg-primary hover:text-primary-foreground hover:border-foreground transition-colors"
              onClick={() => navigate("/library")}
              onMouseEnter={handleHoverEnter}
              onMouseLeave={handleHoverLeave}>
              Xem Ví Dụ
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-4 md:gap-6 lg:gap-8 justify-center pt-6 md:pt-8">
            <div className="flex items-center gap-2">
              <div className="p-1.5 md:p-2 rounded-full bg-[#B5CC89]/20">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-black" />
              </div>
              <span className="text-xs md:text-sm font-medium">
                Được tạo bởi AI
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 md:p-2 rounded-full bg-[#B5CC89]/20">
                <Zap className="w-4 h-4 md:w-5 md:h-5 text-black" />
              </div>
              <span className="text-xs md:text-sm font-medium">
                Tạo Trong Tức Thì
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 md:p-2 rounded-full bg-[#B5CC89]/20">
                <Brain className="w-4 h-4 md:w-5 md:h-5 text-black" />
              </div>
              <span className="text-xs md:text-sm font-medium">
                Câu Hỏi Thông Minh
              </span>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="hidden md:block absolute top-0 right-0 w-72 h-72 bg-[#B5CC89]/20 rounded-full blur-3xl -z-0" />
        <div className="hidden md:block absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -z-0" />
      </div>

      <div className="absolute inset-x-0 bottom-0 h-16">
        <div className="container mx-auto max-w-7xl h-full"></div>
      </div>
    </section>
  );
};

export default Hero;
