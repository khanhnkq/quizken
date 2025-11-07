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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5" />
            Xu hướng tiến bộ (30 ngày)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!trendData || trendData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5" />
            Xu hướng tiến bộ (30 ngày)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500 text-center">
            Chưa có dữ liệu tiến bộ.
            <br />
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
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-blue-600">
            Điểm trung bình: {payload[0]?.value?.toFixed(1)}%
          </p>
          <p className="text-sm text-green-600">Số quiz: {payload[1]?.value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUpIcon className="h-5 w-5" />
          Xu hướng tiến bộ (30 ngày)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="score"
              orientation="left"
              tick={{ fontSize: 12 }}
              domain={[0, 100]}
              label={{ value: "Điểm (%)", angle: -90, position: "insideLeft" }}
            />
            <YAxis
              yAxisId="count"
              orientation="right"
              tick={{ fontSize: 12 }}
              label={{ value: "Số quiz", angle: 90, position: "insideRight" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              yAxisId="score"
              type="monotone"
              dataKey="điểm"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="count"
              type="monotone"
              dataKey="Số quiz"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
