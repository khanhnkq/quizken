import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import vetsIllustration from "@/assets/vets-illustration.png";
import { HeartPulse, Scissors, Home } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: HeartPulse,
      title: "Veterinary Care",
      description: "Comprehensive medical care from routine check-ups to emergency treatment with state-of-the-art diagnostics.",
    },
    {
      icon: Scissors,
      title: "Grooming",
      description: "Professional grooming services to keep your pet looking and feeling their best with gentle care.",
    },
    {
      icon: Home,
      title: "Pet Daycare",
      description: "Safe and fun daycare services where your pet can socialize and play under expert supervision.",
    },
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            All-in-One Care for Your <span className="text-primary">Pet's Needs</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From medical care to grooming and daycare, we provide everything your pet needs under one roof.
          </p>
        </div>

        {/* Illustration */}
        <div className="mb-16 flex justify-center">
          <img 
            src={vetsIllustration} 
            alt="Friendly veterinarians with pet" 
            className="max-w-xl w-full h-auto drop-shadow-xl"
          />
        </div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="mb-4 inline-flex p-3 bg-primary rounded-xl">
                  <service.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{service.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
