import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader className="border-b bg-gradient-to-r from-violet-50 to-purple-50">
          <CardTitle className="flex items-center gap-2 text-violet-900">
            <TrendingUpIcon className="h-5 w-5" />
            Xu hướng tiến bộ (30 ngày)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Skeleton className="h-64 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!trendData || trendData.length === 0) {
    return (
      <Card className="shadow-md border-2 border-dashed border-gray-200">
        <CardHeader className="border-b bg-gradient-to-r from-violet-50 to-purple-50">
          <CardTitle className="flex items-center gap-2 text-violet-900">
            <TrendingUpIcon className="h-5 w-5" />
            Xu hướng tiến bộ (30 ngày)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 text-center">
          <div className="p-4 rounded-full bg-violet-100 mb-4">
            <TrendingUpIcon className="h-12 w-12 text-violet-600" />
          </div>
          <p className="text-gray-700 font-semibold mb-2">
            Chưa có dữ liệu tiến bộ
          </p>
          <p className="text-gray-500 text-sm">
            Hãy làm một vài quiz để xem xu hướng của bạn!
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
        <div className="bg-white p-4 border-2 border-violet-200 rounded-xl shadow-xl backdrop-blur-sm">
          <p className="font-bold text-gray-900 mb-2 text-sm">{label}</p>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-violet-600 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-violet-500"></span>
              Điểm TB: {payload[0]?.value?.toFixed(1)}%
            </p>
            <p className="text-sm font-semibold text-pink-600 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-pink-500"></span>
              Số quiz: {payload[1]?.value}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="border-b bg-gradient-to-r from-violet-50 to-purple-50">
        <CardTitle className="flex items-center gap-2 text-violet-900">
          <TrendingUpIcon className="h-5 w-5" />
          Xu hướng tiến bộ (30 ngày)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="countGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              interval="preserveStartEnd"
              stroke="#d1d5db"
            />
            <YAxis
              yAxisId="score"
              orientation="left"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              domain={[0, 100]}
              label={{
                value: "Điểm (%)",
                angle: -90,
                position: "insideLeft",
                fill: "#8b5cf6",
                fontWeight: 600,
              }}
              stroke="#d1d5db"
            />
            <YAxis
              yAxisId="count"
              orientation="right"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              label={{
                value: "Số quiz",
                angle: 90,
                position: "insideRight",
                fill: "#ec4899",
                fontWeight: 600,
              }}
              stroke="#d1d5db"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              yAxisId="score"
              type="monotone"
              dataKey="điểm"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: "#7c3aed" }}
              fill="url(#scoreGradient)"
            />
            <Line
              yAxisId="count"
              type="monotone"
              dataKey="Số quiz"
              stroke="#ec4899"
              strokeWidth={3}
              dot={{ fill: "#ec4899", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "#db2777" }}
              fill="url(#countGradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
