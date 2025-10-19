import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, MessageSquare } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Mitchell",
      initial: "S",
      role: "High School Teacher",
      text: "QuizAI has revolutionized how I create assessments. What used to take hours now takes minutes, and my students love the engaging questions!",
      rating: 5,
    },
    {
      name: "David Park",
      initial: "D",
      role: "Corporate Trainer",
      text: "The quality of AI-generated quizzes is outstanding. Perfect for employee training programs and knowledge assessments.",
      rating: 5,
    },
    {
      name: "Maria Garcia",
      initial: "M",
      role: "Content Creator",
      text: "This tool is a game-changer! I create educational content for thousands of followers, and QuizAI makes it so much easier.",
      rating: 5,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary/30 to-background min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <MessageSquare className="w-12 h-12 text-[#B5CC89]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            What Users Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied educators and content creators
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-2">
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-primary text-primary"
                    />
                  ))}
                </div>
                <p className="text-foreground italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3 pt-2">
                  <Avatar>
                    <AvatarFallback className="bg-[#B5CC89] text-black font-semibold">
                      {testimonial.initial}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
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
