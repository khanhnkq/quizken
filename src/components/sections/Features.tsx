import {
  Sparkles,
  BookOpen,
  Users,
  Target,
  Zap,
  Award,
  Star,
} from '@/lib/icons';
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const Features = () => {
  const { t } = useTranslation();
  const features = [
    {
      icon: Sparkles,
      title: t('features.items.0.title'),
      description: t('features.items.0.description'),
    },
    {
      icon: Zap,
      title: t('features.items.1.title'),
      description: t('features.items.1.description'),
    },
    {
      icon: BookOpen,
      title: t('features.items.2.title'),
      description: t('features.items.2.description'),
    },
    {
      icon: Target,
      title: t('features.items.3.title'),
      description: t('features.items.3.description'),
    },
    {
      icon: Users,
      title: t('features.items.4.title'),
      description: t('features.items.4.description'),
    },
    {
      icon: Award,
      title: t('features.items.5.title'),
      description: t('features.items.5.description'),
    },
  ];

  return (
    <section
      id="features"
      className="relative overflow-hidden bg-gradient-to-b from-secondary/30 to-background min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Star className="w-12 h-12 text-[#B5CC89]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('features.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-2 hover:border-[#B5CC89] transition-colors duration-300 hover:shadow-lg">
              <CardContent className="p-8 text-center space-y-4">
                <div className="inline-flex p-4 bg-[#B5CC89]/20 rounded-2xl">
                  <feature.icon className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-12 pointer-events-none">
        <div className="container mx-auto max-w-7xl h-full">
          <div className="h-px bg-border/50" />
        </div>
      </div>
    </section>
  );
};

export default Features;
