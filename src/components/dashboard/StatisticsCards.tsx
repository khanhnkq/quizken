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
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Tổng số quiz bạn đã tạo",
      ref: totalCreatedRef,
    },
    {
      title: "Quiz đã làm",
      icon: CheckCircleIcon,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Tổng số quiz bạn đã hoàn thành",
      ref: totalTakenRef,
    },
    {
      title: "Điểm cao nhất",
      icon: TrophyIcon,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
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
            className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    <span ref={card.ref}>0</span>
                    {card.suffix}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {card.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
