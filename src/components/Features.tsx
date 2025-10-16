import { Stethoscope, Award, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: Stethoscope,
      title: "Experienced Vets",
      description: "Our team of certified veterinarians brings years of expertise and genuine care to every appointment.",
    },
    {
      icon: Award,
      title: "Locally Licensed",
      description: "Fully accredited and licensed veterinary practice meeting the highest standards of pet care.",
    },
    {
      icon: Building2,
      title: "Modern Clinics",
      description: "State-of-the-art facilities equipped with advanced medical technology for comprehensive pet care.",
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Because Your Pet <span className="text-primary">Deserves the Best</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We combine professional expertise with genuine compassion to provide the best possible care for your beloved companions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-primary transition-colors duration-300 hover:shadow-lg">
              <CardContent className="p-8 text-center space-y-4">
                <div className="inline-flex p-4 bg-primary/10 rounded-2xl">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
