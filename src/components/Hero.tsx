import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Brain } from "lucide-react";
import { useState, useEffect } from "react";

const Hero = () => {
  const scrollToGenerator = () => {
    document
      .getElementById("generator")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  // Typing effect state
  const [displayText, setDisplayText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const fullText =
    "Transform any topic into engaging quizzes instantly. Perfect for teachers, trainers, and content creators.";

  useEffect(() => {
    let currentIndex = 0;
    const typingSpeed = 120; // milliseconds per character - slower for dramatic effect
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

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary/30 to-background min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight group hover:text-primary transition-all duration-500 hover:drop-shadow-2xl hover:scale-105 cursor-pointer">
            Create{" "}
            <span className="text-primary group-hover:text-yellow-300 group-hover:scale-110 group-hover:animate-pulse transition-all duration-700">
              Amazing Quizzes
            </span>{" "}
            with{" "}
            <span className="text-primary group-hover:text-yellow-300 group-hover:scale-110 group-hover:animate-pulse transition-all duration-700">
              AI
            </span>{" "}
            in Seconds
          </h1>
          <div className="h-16 flex items-center justify-center">
            {" "}
            {/* Fixed height container */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-mono">
              {displayText}
              {showCursor && (
                <span
                  className="inline-block w-1 h-6 ml-1 animate-slow-blink"
                  style={{ backgroundColor: "#B5CC89" }}></span>
              )}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="hero"
              size="lg"
              className="text-base flex items-center gap-2"
              onClick={scrollToGenerator}>
              Generate Quiz Now
              <div className="bg-[#B5CC89] p-1 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-black"
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
            <Button variant="outline" size="lg" className="text-base">
              See Examples
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-6 justify-center pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-[#B5CC89]/20">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <span className="text-sm font-medium">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-[#B5CC89]/20">
                <Zap className="w-5 h-5 text-black" />
              </div>
              <span className="text-sm font-medium">Instant Generation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-[#B5CC89]/20">
                <Brain className="w-5 h-5 text-black" />
              </div>
              <span className="text-sm font-medium">Smart Questions</span>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#B5CC89]/20 rounded-full blur-3xl -z-0" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -z-0" />
      </div>
    </section>
  );
};

export default Hero;
