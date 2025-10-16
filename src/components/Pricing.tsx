import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Basic Care",
      price: "$45",
      period: "per visit",
      description: "Essential veterinary care for your pet",
      features: [
        "General health check-up",
        "Basic vaccinations",
        "Nutritional consultation",
        "Health records management",
      ],
    },
    {
      name: "Full Exam + Care",
      price: "$90",
      period: "per visit",
      description: "Comprehensive examination and treatment",
      features: [
        "Complete physical examination",
        "All basic care features",
        "Laboratory testing",
        "Treatment recommendations",
        "Follow-up consultation",
      ],
      popular: true,
    },
    {
      name: "Premium Wellness Plan",
      price: "$250",
      period: "per month",
      description: "Complete care package for peace of mind",
      features: [
        "Unlimited consultations",
        "All exam + care features",
        "Emergency services priority",
        "Grooming discounts",
        "Daycare credits included",
        "24/7 phone support",
      ],
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Affordable Care <span className="text-primary">Plans</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect care plan for your pet's needs and budget
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'border-primary border-2 shadow-xl' : 'border-2'} hover:shadow-lg transition-shadow`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="mb-2">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">{plan.period}</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  Get Started
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
