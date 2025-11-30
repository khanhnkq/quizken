```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ProgressTrendData } from "@/types/dashboard";
import { TrendingUpIcon } from "lucide-react";

interface ProgressTrendlineProps {
  progressData: ProgressTrendData[];
  isLoading: boolean;
}

export function ProgressTrendline({
  progressData,
  isLoading,
}: ProgressTrendlineProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <Card className="border-2 hover:border-[#B5CC89] transition-colors">
        <CardHeader className="border-b bg-[#B5CC89]/5">
          <CardTitle className="flex items-center gap-2 text-gray-900 text-base md:text-lg">
            <TrendingUpIcon className="h-4 w-4 md:h-5 md:w-5" />
            <span className="sm:inline">Tiến bộ (30 ngày)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 md:pt-6">
          <Skeleton className="h-48 md:h-64 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!trendData || trendData.length === 0) {
    return (
      <Card className="border-2 border-dashed hover:border-[#B5CC89] transition-colors">
        <CardHeader className="border-b bg-[#B5CC89]/5">
          <CardTitle className="flex items-center gap-2 text-gray-900 text-base md:text-lg">
            <TrendingUpIcon className="h-4 w-4 md:h-5 md:w-5" />
            <span className="hidden sm:inline">Xu hướng tiến bộ (30 ngày)</span>
            <span className="sm:inline">Tiến bộ (30 ngày)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-48 md:h-64 text-center p-4">
          <div className="p-3 md:p-4 rounded-full bg-[#B5CC89]/20 mb-3 md:mb-4">
            <TrendingUpIcon className="h-10 w-10 md:h-12 md:w-12 text-[#B5CC89]" />
          </div>
          <p className="text-gray-700 font-semibold mb-2 text-sm md:text-base">
            {t('dashboard.progressTrend.empty')}
          </p>
          <p className="text-gray-500 text-xs md:text-sm">
            {t('dashboard.progressTrend.emptyDescription')}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Format data for chart
  const chartData = trendData.map((item) => ({
    date: item.date,
    điểm: item.average_score,
    "Số quiz": item.quiz_count,
  }));

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{
      value: number;
      dataKey: string;
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border-2 border-[#B5CC89] rounded-xl shadow-xl">
          <p className="font-bold text-gray-900 mb-2 text-sm">{label}</p>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#B5CC89] flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#B5CC89]"></span>
              Điểm TB: {payload[0]?.value?.toFixed(1)}%
            </p>
            <p className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-500"></span>
              Số quiz: {payload[1]?.value}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="rounded-2xl border-2 hover:border-[#B5CC89] transition-all hover:shadow-lg">
      <CardHeader className="border-b bg-[#B5CC89]/5">
        <CardTitle className="flex items-center gap-2 text-gray-900 text-base md:text-lg">
          <TrendingUpIcon className="h-4 w-4 md:h-5 md:w-5" />
          <span className="hidden sm:inline">{t('dashboard.progressTrend.title')}</span>
          <span className="sm:inline">{t('dashboard.progressTrend.titleShort')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 md:pt-6">
        <ResponsiveContainer width="100%" height={250} minHeight={200}>
          <LineChart data={chartData}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B5CC89" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#B5CC89" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="countGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#6b7280" }}
              interval="preserveStartEnd"
              stroke="#d1d5db"
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              yAxisId="score"
              orientation="left"
              tick={{ fontSize: 10, fill: "#6b7280" }}
              domain={[0, 100]}
              label={{
                value: "Điểm (%)",
                angle: -90,
                position: "insideLeft",
                fill: "#B5CC89",
                fontWeight: 600,
                style: { fontSize: 10 },
              }}
              stroke="#d1d5db"
            />
            <YAxis
              yAxisId="count"
              orientation="right"
              tick={{ fontSize: 10, fill: "#6b7280" }}
              label={{
                value: "Số quiz",
                angle: 90,
                position: "insideRight",
                fill: "#6b7280",
                fontWeight: 600,
                style: { fontSize: 10 },
              }}
              stroke="#d1d5db"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              yAxisId="score"
              type="monotone"
              dataKey="điểm"
              stroke="#B5CC89"
              strokeWidth={2}
              dot={{ fill: "#B5CC89", strokeWidth: 1, r: 3 }}
              activeDot={{ r: 5, fill: "#A0B878" }}
              fill="url(#scoreGradient)"
            />
            <Line
              yAxisId="count"
              type="monotone"
              dataKey="Số quiz"
              stroke="#6b7280"
              strokeWidth={2}
              dot={{ fill: "#6b7280", strokeWidth: 1, r: 2 }}
              activeDot={{ r: 4, fill: "#4b5563" }}
              fill="url(#countGradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
