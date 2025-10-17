import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const Footer = () => {
  const scrollToGenerator = () => {
    document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-foreground/5 border-t">
      {/* CTA Section */}
      <div className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="flex justify-center">
              <Sparkles className="w-16 h-16 text-primary" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              Start Creating Amazing Quizzes Today
            </h2>
            <p className="text-lg text-muted-foreground">
              Join educators worldwide who are transforming how they create educational content with AI.
            </p>
            <Button variant="hero" size="lg" onClick={scrollToGenerator}>
              Generate Your First Quiz
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="border-t py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">QuizAI</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered quiz generation for educators and content creators worldwide.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Quiz Generator</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Custom Topics</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Export Options</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">AI Models</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQs</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="border-t py-6 px-4">
        <div className="container mx-auto max-w-7xl">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 QuizAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
