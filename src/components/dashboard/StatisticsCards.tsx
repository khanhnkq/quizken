import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCountUp } from "@/hooks/useCountUp";
import type { UserStatistics } from "@/types/dashboard";
import { FileTextIcon, CheckCircleIcon, TrophyIcon } from "lucide-react";

interface StatisticsCardsProps {
  statistics: UserStatistics | null;
  isLoading: boolean;
}

export function StatisticsCards({
  statistics,
  isLoading,
}: StatisticsCardsProps) {
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
      title: "Quiz đã tạo",
      icon: FileTextIcon,
      gradient: "from-violet-500 to-purple-600",
      iconColor: "text-white",
      description: "Tổng số quiz bạn đã tạo",
      ref: totalCreatedRef,
    },
    {
      title: "Quiz đã làm",
      icon: CheckCircleIcon,
      gradient: "from-pink-500 to-rose-600",
      iconColor: "text-white",
      description: "Tổng số quiz bạn đã hoàn thành",
      ref: totalTakenRef,
    },
    {
      title: "Điểm cao nhất",
      icon: TrophyIcon,
      gradient: "from-amber-500 to-orange-600",
      iconColor: "text-white",
      description: "Điểm cao nhất bạn đạt được",
      ref: highestScoreRef,
      suffix: "%",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card
            key={index}
            className="group relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-90`}
            />
            <CardContent className="relative p-6 text-white">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                    <Icon className={`h-8 w-8 ${card.iconColor}`} />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold tracking-tight">
                      <span ref={card.ref}>0</span>
                      {card.suffix}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/90 mb-1">
                    {card.title}
                  </p>
                  <p className="text-xs text-white/75">{card.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
