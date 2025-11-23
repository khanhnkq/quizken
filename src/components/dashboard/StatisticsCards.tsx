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
      bgColor: "bg-[#B5CC89]/20",
      iconBg: "bg-[#B5CC89]",
      iconColor: "text-black",
      description: "Tổng số quiz bạn đã tạo",
      ref: totalCreatedRef,
    },
    {
      title: "Quiz đã làm",
      icon: CheckCircleIcon,
      bgColor: "bg-[#B5CC89]/20",
      iconBg: "bg-[#B5CC89]",
      iconColor: "text-black",
      description: "Tổng số quiz bạn đã hoàn thành",
      ref: totalTakenRef,
    },
    {
      title: "Điểm cao nhất",
      icon: TrophyIcon,
      bgColor: "bg-[#B5CC89]/20",
      iconBg: "bg-[#B5CC89]",
      iconColor: "text-black",
      description: "Điểm cao nhất bạn đạt được",
      ref: highestScoreRef,
      suffix: "%",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-3 md:space-x-4">
                <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-16 md:h-4 md:w-20" />
                  <Skeleton className="h-6 w-12 md:h-8 md:w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card
            key={index}
            className={`border-2 hover:border-[#B5CC89] transition-colors duration-300 hover:shadow-lg ${card.bgColor}`}>
            <CardContent className="p-4 md:p-6 lg:p-8 text-center space-y-3 md:space-y-4">
              <div
                className={`inline-flex p-3 md:p-4 ${card.iconBg} rounded-2xl`}>
                <Icon className={`w-6 h-6 md:w-8 md:h-8 ${card.iconColor}`} />
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
                  <span ref={card.ref}>0</span>
                  {card.suffix}
                </p>
                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1">
                  {card.title}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {card.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
