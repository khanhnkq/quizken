import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Brain } from "lucide-react";

const Hero = () => {
  const scrollToGenerator = () => {
    document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary/30 to-background py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
            Create <span className="text-primary">Amazing Quizzes</span> with{" "}
            <span className="text-primary">AI</span> in Seconds
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform any topic into engaging quizzes instantly. Perfect for teachers, trainers, and content creators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" className="text-base" onClick={scrollToGenerator}>
              Generate Quiz Now
            </Button>
            <Button variant="outline" size="lg" className="text-base">
              See Examples
            </Button>
          </div>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap gap-6 justify-center pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium">Instant Generation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium">Smart Questions</span>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/20 rounded-full blur-3xl -z-0" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -z-0" />
      </div>
    </section>
  );
};

export default Hero;
