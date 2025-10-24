import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/loading-skeleton";

export const QuizCardSkeleton: React.FC = () => {
  return (
    <Card className="border-2 flex flex-col h-full">
      <CardHeader className="pb-4 flex-shrink-0">
        <div className="space-y-3">
          {/* Title skeleton */}
          <div className="min-h-[3.5rem] space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>

          {/* Badge skeleton */}
          <Skeleton className="h-6 w-20" />

          {/* Description skeleton */}
          <div className="min-h-[2.5rem] space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          {/* Category badge skeleton */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-grow flex flex-col">
        {/* Tags skeleton */}
        <div className="min-h-[2rem] flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-14" />
        </div>

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Stats skeleton */}
        <div className="flex gap-3 min-h-[1.5rem]">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Buttons skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </CardContent>
    </Card>
  );
};
