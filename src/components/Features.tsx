import { Sparkles, BookOpen, Users, Target, Zap, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Generation",
      description: "Advanced AI creates intelligent, contextual questions tailored to your topic.",
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Generate complete quizzes in seconds, not hours. Save time and boost productivity.",
    },
    {
      icon: BookOpen,
      title: "Multiple Topics",
      description: "Create quizzes on any subject - science, history, language, or custom topics.",
    },
    {
      icon: Target,
      title: "Customizable Difficulty",
      description: "Control difficulty levels from beginner to expert for your specific audience.",
    },
    {
      icon: Users,
      title: "For Everyone",
      description: "Perfect for teachers, trainers, content creators, and anyone who needs quizzes.",
    },
    {
      icon: Award,
      title: "Quality Questions",
      description: "Every question includes detailed explanations to enhance learning.",
    },
  ];

  return (
    <section className="py-20 px-4 bg-secondary/10">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why Choose QuizAI
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The smartest way to create engaging quizzes. Powered by advanced AI to deliver quality educational content instantly.
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
