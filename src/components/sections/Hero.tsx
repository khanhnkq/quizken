import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Brain, Eye } from "@/lib/icons";
import { useState, useEffect, type MouseEvent } from "react";
import { gsap } from "gsap";
import { killActiveScroll, scrollToTarget } from "@/lib/scroll";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { shouldReduceAnimations } from "@/utils/deviceDetection";

const Hero = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const scrollToGenerator = async () => {
    // Chuẩn hóa cuộn bằng tiện ích thống nhất, ưu tiên ScrollSmoother nếu khả dụng
    killActiveScroll();
    const targetId = document.getElementById("quiz") ? "quiz" : "generator";
    scrollToTarget(targetId, { align: "top" });
  };

  // Typing effect state
  const [displayText, setDisplayText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const fullText = t("hero.typingText");

  useEffect(() => {
    let currentIndex = 0;
    // Reduce typing speed on mobile/low-end devices for better performance
    const typingSpeed = shouldReduceAnimations() ? 50 : 120;
    const displayTime = 2000; // 2 seconds before restarting

    let typeTimeout: NodeJS.Timeout;
    let cursorTimeout: NodeJS.Timeout;
    let restartTimeout: NodeJS.Timeout;

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
  }, [fullText]);

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
      className="relative overflow-hidden bg-background min-h-[90svh] md:min-h-screen pt-10 pb-32 sm:pt-14 sm:pb-40 md:pt-14 md:pb-52 px-4 flex items-center justify-center">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Icons */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none -z-0">
        <div className="absolute top-[10%] left-[15%] animate-float hover:scale-110 transition-transform duration-1000">
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-border/50 rotate-[-10deg]">
            <Brain className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="absolute top-[20%] right-[15%] animate-float animation-delay-2000 hover:scale-110 transition-transform duration-1000">
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-border/50 rotate-[10deg]">
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="absolute bottom-[40%] left-[20%] animate-float animation-delay-4000 hover:scale-110 transition-transform duration-1000">
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-border/50 rotate-[5deg]">
            <Zap className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10 text-center space-y-8">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm animate-fade-in mx-auto">
            <Sparkles className="w-4 h-4" />
            <span>{t("hero.badgeAI")}</span>
          </div>

          <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] md:leading-tight text-foreground drop-shadow-sm">
            {t("hero.titlePart1")}{" "}
            <span className="text-primary relative inline-block">
              {t("hero.titlePart2")}
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-yellow-300 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>{" "}
            {t("hero.titlePart3")}{" "}
            <span className="text-primary relative inline-block">
              {t("hero.titlePart4")}
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-pink-300 -z-10 opacity-70" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>{" "}
            {t("hero.titlePart5")}
          </h1>

          <div className="h-14 sm:h-16 flex items-center justify-center">
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-sans leading-relaxed font-medium">
              {displayText}
              {showCursor && (
                <span
                  className="inline-block w-1 h-6 md:h-7 ml-1 animate-slow-blink bg-primary rounded-full"></span>
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              variant="hero"
              size="xl"
              className="group text-lg px-8 py-6 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 font-heading bg-primary hover:bg-primary/90 text-white w-full sm:w-auto"
              onClick={scrollToGenerator}
              onMouseEnter={handleHoverEnter}
              onMouseLeave={handleHoverLeave}>
              {t("hero.createQuizButton")}
              <div className="bg-white/20 p-1.5 rounded-lg ml-2 group-hover:rotate-12 transition-transform">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </div>
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="text-lg px-8 py-6 rounded-2xl border-2 hover:bg-secondary hover:text-secondary-foreground hover:-translate-y-1 transition-all duration-300 font-heading w-full sm:w-auto"
              onClick={() => navigate("/library")}
              onMouseEnter={handleHoverEnter}
              onMouseLeave={handleHoverLeave}>
              {t("hero.viewExamplesButton")}
            </Button>
          </div>

          <div className="pt-12 grid grid-cols-2 md:grid-cols-3 gap-6 opacity-80">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-green-100 rounded-2xl text-green-600">
                <Zap className="w-6 h-6" />
              </div>
              <span className="font-heading font-semibold text-sm">{t("hero.badgeInstant")}</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                <Brain className="w-6 h-6" />
              </div>
              <span className="font-heading font-semibold text-sm">{t("hero.badgeSmartQuestions")}</span>
            </div>
            <div className="flex flex-col items-center gap-2 col-span-2 md:col-span-1">
              <div className="p-3 bg-purple-100 rounded-2xl text-purple-600">
                <Eye className="w-6 h-6" />
              </div>
              <span className="font-heading font-semibold text-sm">{t("hero.badgeAI")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
