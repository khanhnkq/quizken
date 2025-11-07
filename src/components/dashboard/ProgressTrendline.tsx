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
      <Card className="border-2 hover:border-[#B5CC89] transition-colors">
        <CardHeader className="border-b bg-[#B5CC89]/5">
          <CardTitle className="flex items-center gap-2 text-gray-900">
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
      <Card className="border-2 border-dashed hover:border-[#B5CC89] transition-colors">
        <CardHeader className="border-b bg-[#B5CC89]/5">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <TrendingUpIcon className="h-5 w-5" />
            Xu hướng tiến bộ (30 ngày)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 text-center">
          <div className="p-4 rounded-full bg-[#B5CC89]/20 mb-4">
            <TrendingUpIcon className="h-12 w-12 text-[#B5CC89]" />
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
    <Card className="border-2 hover:border-[#B5CC89] transition-colors hover:shadow-lg">
      <CardHeader className="border-b bg-[#B5CC89]/5">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <TrendingUpIcon className="h-5 w-5" />
          Xu hướng tiến bộ (30 ngày)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={300}>
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
                fill: "#B5CC89",
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
                fill: "#6b7280",
                fontWeight: 600,
              }}
              stroke="#d1d5db"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              yAxisId="score"
              type="monotone"
              dataKey="điểm"
              stroke="#B5CC89"
              strokeWidth={3}
              dot={{ fill: "#B5CC89", strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: "#A0B878" }}
              fill="url(#scoreGradient)"
            />
            <Line
              yAxisId="count"
              type="monotone"
              dataKey="Số quiz"
              stroke="#6b7280"
              strokeWidth={3}
              dot={{ fill: "#6b7280", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "#4b5563" }}
              fill="url(#countGradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
