import { Button } from "@/components/ui/button";
import heroPets from "@/assets/hero-pets.png";
import { Heart, Shield, Clock } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary/30 to-background py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Support for Every <span className="text-primary">Furry</span>,{" "}
              <span className="text-primary">Feathered</span>, and{" "}
              <span className="text-primary">Finned</span> Friend
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
              Professional veterinary care with compassion and expertise. Your pet's health and happiness is our priority.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="lg" className="text-base">
                Book an Appointment
              </Button>
              <Button variant="outline" size="lg" className="text-base">
                Learn More
              </Button>
            </div>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start pt-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/10">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Licensed Vets</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/10">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Compassionate Care</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/10">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium">24/7 Support</span>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative z-10">
              <img 
                src={heroPets} 
                alt="Happy pets together - dog, cat, fish, and bird" 
                className="w-full h-auto drop-shadow-2xl"
              />
            </div>
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-primary/20 rounded-full blur-3xl -z-0" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -z-0" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
