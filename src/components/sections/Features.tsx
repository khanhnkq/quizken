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
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";

// Pastel color palette for each feature
const pastelColors = [
  { bg: 'bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900/50 dark:to-pink-950/30', border: 'border-pink-200 dark:border-pink-900', iconColor: 'text-pink-600 dark:text-pink-300' },
  { bg: 'bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/50 dark:to-amber-950/30', border: 'border-amber-200 dark:border-amber-900', iconColor: 'text-amber-600 dark:text-amber-300' },
  { bg: 'bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/50 dark:to-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-900', iconColor: 'text-emerald-600 dark:text-emerald-300' },
  { bg: 'bg-gradient-to-br from-sky-100 to-sky-50 dark:from-sky-900/50 dark:to-sky-950/30', border: 'border-sky-200 dark:border-sky-900', iconColor: 'text-sky-600 dark:text-sky-300' },
  { bg: 'bg-gradient-to-br from-violet-100 to-violet-50 dark:from-violet-900/50 dark:to-violet-950/30', border: 'border-violet-200 dark:border-violet-900', iconColor: 'text-violet-600 dark:text-violet-300' },
  { bg: 'bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-900/50 dark:to-rose-950/30', border: 'border-rose-200 dark:border-rose-900', iconColor: 'text-rose-600 dark:text-rose-300' },
];

const Features = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { profileData } = useProfile(user?.id);
  const isComic = profileData?.equipped_theme === 'theme_comic_manga';
  
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
      className="relative overflow-hidden bg-gradient-to-b from-secondary/30 to-background dark:from-slate-900/30 dark:to-slate-950 py-24 px-2 md:px-4">

      {/* Floating Background Shapes */}
      <div className="absolute top-20 left-[5%] w-16 h-16 rounded-full bg-pink-200/30 animate-bounce-slow" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-40 right-[10%] w-12 h-12 rounded-2xl bg-amber-200/30 rotate-12 animate-bounce-slow" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-32 left-[15%] w-10 h-10 rounded-full bg-emerald-200/30 animate-bounce-slow" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 right-[20%] w-14 h-14 rounded-3xl bg-violet-200/30 -rotate-12 animate-bounce-slow" style={{ animationDelay: '1.5s' }}></div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex justify-center p-5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full shadow-lg mb-6 animate-bounce-slow">
            <Star className="w-10 h-10 text-[#B5CC89]" />
          </div>
          <h2 className={cn(
            "text-3xl md:text-4xl lg:text-6xl font-bold font-heading mb-6 filter",
            isComic 
              ? "text-black drop-shadow-[4px_4px_0px_#FFD700]" 
              : "bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent"
          )}>
            {t('features.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            {t('features.subtitle')}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {features.map((feature, index) => {
            const color = pastelColors[index % pastelColors.length];
            return (
              <Card
                key={index}
                className={`
                  group cursor-pointer
                  rounded-3xl border-4 ${color.border}
                  bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm
                  shadow-[0_8px_30px_rgba(0,0,0,0.06),inset_0_2px_0_rgba(255,255,255,0.8)]
                  dark:shadow-[0_8px_30px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]
                  hover:shadow-[0_16px_40px_rgba(0,0,0,0.1),inset_0_2px_0_rgba(255,255,255,0.9)]
                  dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]
                  hover:-translate-y-3 hover:rotate-1
                  transition-all duration-300 ease-out
                  overflow-hidden
                `}>
                <CardContent className="p-5 md:p-8 text-center space-y-5">
                  {/* Icon Bubble */}
                  <div className={`
                    inline-flex p-5 rounded-2xl
                    ${color.bg}
                    shadow-inner
                    group-hover:scale-110
                    transition-transform duration-300
                  `}>
                    <feature.icon className={`w-9 h-9 ${color.iconColor}`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold font-heading">{feature.title}</h3>

                  {/* Description */}
                  <p className="text-muted-foreground dark:text-slate-400 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;

