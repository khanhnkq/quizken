import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah P.",
      initial: "S",
      text: "My senior dog received the best care possible. The vets were so patient and knowledgeable. I'm grateful for their compassion.",
      rating: 5,
    },
    {
      name: "Mike T.",
      initial: "M",
      text: "Clean facilities, friendly staff and they really care about every animal. Our cat feels comfortable here.",
      rating: 5,
    },
    {
      name: "Emily R.",
      initial: "E",
      text: "Emergency visit at night and they were amazing! Quick response and professional care. Highly recommended!",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 px-4 bg-secondary/50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Loved by <span className="text-primary">Pets</span>, Trusted by{" "}
            <span className="text-primary">Owners</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what our happy customers have to say about their experience
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-2">
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3 pt-2">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {testimonial.initial}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">Pet Owner</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
