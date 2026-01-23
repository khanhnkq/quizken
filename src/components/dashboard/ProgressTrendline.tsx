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
  trendData: ProgressTrendData[];
  isLoading: boolean;
}

export function ProgressTrendline({
  trendData,
  isLoading,
}: ProgressTrendlineProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <Card className="border-2 hover:border-primary transition-colors">
        <CardHeader className="border-b bg-primary/5">
          <CardTitle className="flex items-center gap-2 text-gray-900 text-base md:text-lg">
            <TrendingUpIcon className="h-4 w-4 md:h-5 md:w-5" />
            <span className="sm:inline">{t('dashboard.progressTrend.titleShort')}</span>
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
      <Card className="border-2 border-dashed hover:border-primary transition-colors">
        <CardHeader className="border-b bg-primary/5">
          <CardTitle className="flex items-center gap-2 text-gray-900 text-base md:text-lg">
            <TrendingUpIcon className="h-4 w-4 md:h-5 md:w-5" />
            <span className="hidden sm:inline">{t('dashboard.progressTrend.title')}</span>
            <span className="sm:inline">{t('dashboard.progressTrend.titleShort')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-48 md:h-64 text-center p-4">
          <div className="p-3 md:p-4 rounded-full bg-primary/20 mb-3 md:mb-4">
            <TrendingUpIcon className="h-10 w-10 md:h-12 md:w-12 text-primary" />
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
    [t('dashboard.progressTrend.score')]: item.average_score,
    [t('dashboard.progressTrend.quizCount')]: item.quiz_count,
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
        <div className="bg-white p-4 border-2 border-primary rounded-xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold text-gray-900 dark:text-slate-900 text-sm">{label}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-primary flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary"></span>
              {t('dashboard.progressTrend.avgScore')}: {payload[0]?.value?.toFixed(1)}%
            </p>
            <p className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-500"></span>
              {t('dashboard.progressTrend.quizCount')}: {payload[1]?.value}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="rounded-[2.5rem] border-2 border-gray-100 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 overflow-hidden relative group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-50"></div>

      <CardHeader className="border-b-0 pb-0 relative z-10">
        <CardTitle className="flex items-center gap-3 text-2xl font-heading font-bold text-gray-800 dark:text-white">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
            <TrendingUpIcon className="h-6 w-6" />
          </div>
          <span className="hidden sm:inline">{t('dashboard.progressTrend.title')}</span>
          <span className="sm:inline">{t('dashboard.progressTrend.titleShort')}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-6 relative z-10">
        <ResponsiveContainer width="100%" height={250} minHeight={200}>
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#84cc16" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="countGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              dy={10}
            />
            <YAxis
              yAxisId="score"
              orientation="left"
              tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              width={30}
            />
            <YAxis
              yAxisId="count"
              orientation="right"
              tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              width={30}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#e5e7eb', strokeWidth: 2, strokeDasharray: '4 4' }}
            />

            <Line
              yAxisId="score"
              type="monotone"
              dataKey={t('dashboard.progressTrend.score')}
              stroke="#84cc16"
              strokeWidth={4}
              dot={{ fill: "#fff", stroke: "#84cc16", strokeWidth: 3, r: 4 }}
              activeDot={{ r: 6, fill: "#84cc16", stroke: "#fff", strokeWidth: 2 }}
              fill="url(#scoreGradient)"
            />
            <Line
              yAxisId="count"
              type="monotone"
              dataKey={t('dashboard.progressTrend.quizCount')}
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: "#fff", stroke: "#3b82f6", strokeWidth: 3, r: 3 }}
              activeDot={{ r: 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
              fill="url(#countGradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
