import { Button } from "@/components/ui/button";
import happyPets from "@/assets/happy-pets.png";

const Footer = () => {
  return (
    <footer>
      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/10 to-background relative overflow-hidden">
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Keep Your Pets <span className="text-primary">Happy & Healthy</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Schedule your appointment today and give your pet the care they deserve
            </p>
            <Button variant="hero" size="lg" className="text-base">
              Book Appointment Now
            </Button>
          </div>
          
          <div className="mt-12 flex justify-center">
            <img 
              src={happyPets} 
              alt="Happy pets playing together" 
              className="max-w-3xl w-full h-auto drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Footer Links */}
      <div className="bg-foreground text-background py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">PawPrint Care</h3>
              <p className="text-background/80 text-sm">
                Professional veterinary care with compassion and expertise.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-background/80">
                <li>Veterinary Care</li>
                <li>Pet Grooming</li>
                <li>Pet Daycare</li>
                <li>Emergency Services</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-background/80">
                <li>About Us</li>
                <li>Our Team</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-background/80">
                <li>123 Pet Street</li>
                <li>Pet City, PC 12345</li>
                <li>phone: (555) 123-4567</li>
                <li>info@pawprintcare.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/20 pt-8 text-center text-sm text-background/80">
            <p>&copy; 2025 PawPrint Care. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
