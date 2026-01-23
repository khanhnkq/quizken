import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCountUp } from "@/hooks/useCountUp";
import type { UserStatistics } from "@/types/dashboard";
import { FileTextIcon, CheckCircleIcon, TrophyIcon } from "lucide-react";

interface StatisticsCardsProps {
  statistics: UserStatistics | null;
  isLoading: boolean;
}

import { useTranslation } from "react-i18next";

export function StatisticsCards({
  statistics,
  isLoading,
}: StatisticsCardsProps) {
  const { t } = useTranslation();
  const totalCreatedRef = useCountUp(statistics?.total_quizzes_created || 0, {
    duration: 1.5,
  });
  const totalTakenRef = useCountUp(statistics?.total_quizzes_taken || 0, {
    duration: 1.5,
  });
  const highestScoreRef = useCountUp(statistics?.highest_score || 0, {
    duration: 1.5,
  });

  const cards = [
    {
      title: t('dashboard.statistics.quizzesCreated'),
      icon: FileTextIcon,
      // Pink Theme
      bgColor: "bg-pink-100 dark:bg-pink-900/20",
      iconBg: "bg-pink-200 dark:bg-pink-800/40",
      iconColor: "text-pink-600 dark:text-pink-300",
      borderColor: "border-pink-200 dark:border-pink-800/50",
      description: t('dashboard.statistics.createdDesc'),
      ref: totalCreatedRef,
      rotate: "rotate-[-2deg]",
      delay: "delay-0",
    },
    {
      title: t('dashboard.statistics.quizzesTaken'),
      icon: CheckCircleIcon,
      // Blue Theme
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      iconBg: "bg-blue-200 dark:bg-blue-800/40",
      iconColor: "text-blue-600 dark:text-blue-300",
      borderColor: "border-blue-200 dark:border-blue-800/50",
      description: t('dashboard.statistics.takenDesc'),
      ref: totalTakenRef,
      rotate: "rotate-[2deg]",
      delay: "delay-100",
    },
    {
      title: t('dashboard.statistics.highestScore'),
      icon: TrophyIcon,
      // Yellow Theme
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      iconBg: "bg-yellow-200 dark:bg-yellow-800/40",
      iconColor: "text-yellow-700 dark:text-yellow-300",
      borderColor: "border-yellow-200 dark:border-yellow-800/50",
      description: t('dashboard.statistics.highestScoreDesc'),
      ref: highestScoreRef,
      suffix: "%",
      rotate: "rotate-[-1deg]",
      delay: "delay-200",
    },
  ];

  if (isLoading) {
    return (
      <>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="rounded-[2.5rem] border-0 shadow-sm bg-white/50">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center space-x-3 md:space-x-4">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </>
    );
  }

  return (
    <>
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card
            key={index}
            className={`
              rounded-[2.5rem] border-4 ${card.borderColor} ${card.bgColor}
              transform transition-all duration-200 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl hover:rotate-0
              ${card.rotate} cursor-default group overflow-hidden relative
            `}
          >
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

            <CardContent className="p-6 md:p-8 relative z-10 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4">
              <div
                className={`
                  p-4 rounded-3xl ${card.iconBg} ${card.iconColor} 
                  shadow-sm transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300
                `}>
                <Icon className="w-8 h-8 md:w-10 md:h-10" />
              </div>

              <div className="flex-1">
                <p className={`text-4xl md:text-5xl font-heading font-bold ${card.iconColor} mb-1 tracking-tight`}>
                  <span ref={card.ref}>0</span>
                  {card.suffix}
                </p>
                <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-slate-200 opacity-80">
                  {card.title}
                </h3>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}
