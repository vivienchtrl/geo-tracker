"use client";

/**
 * Bot Breakdown Chart
 *
 * Displays:
 * - Pie chart of bot distribution
 * - Top bots by visit count
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface BotBreakdownData {
  botName: string;
  count: number;
}

interface BotBreakdownChartProps {
  data: BotBreakdownData[];
  isLoading?: boolean;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "var(--muted-foreground)",
];

export function BotBreakdownChart({
  data,
  isLoading = false,
}: BotBreakdownChartProps) {
  if (isLoading) {
    return (
      <Card variant="bento" className="border-0 bg-transparent">
        <CardHeader className="px-8 py-6">
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
            Bot Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8 py-4">
          <div className="h-[350px] bg-muted/20 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card variant="bento" className="border-0 bg-transparent">
        <CardHeader className="px-8 py-6 border-b border-dashed border-border/80">
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
            Bot Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8 py-6">
          <div className="h-[350px] flex items-center justify-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              No data available
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Take top 5 bots and group the rest as "Other"
  const sortedData = [...data].sort((a, b) => b.count - a.count);
  const top5 = sortedData.slice(0, 5);
  const otherCount = sortedData.slice(5).reduce((sum, b) => sum + b.count, 0);

  const chartData = [
    ...top5.map((b) => ({ name: b.botName, value: b.count })),
    ...(otherCount > 0 ? [{ name: "Other", value: otherCount }] : []),
  ];

  const total = chartData.reduce((sum, b) => sum + b.value, 0);

  return (
    <Card variant="bento" className="border-0 bg-transparent">
      <CardHeader className="px-8 py-6 border-b border-dashed border-border/80">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
          Bot Breakdown
        </CardTitle>
        <p className="text-[9px] text-muted-foreground/60 mt-1 uppercase tracking-widest">
          Top crawlers by visits
        </p>
      </CardHeader>
      <CardContent className="px-8 py-6">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    strokeWidth={0}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  borderRadius: "4px",
                  fontSize: "11px",
                }}
                formatter={(value: number, name: string) => [
                  `${value.toLocaleString()} (${((value / total) * 100).toFixed(1)}%)`,
                  name,
                ]}
              />
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                wrapperStyle={{
                  fontSize: "10px",
                  paddingLeft: "20px",
                }}
                formatter={(value: string) => (
                  <span className="text-muted-foreground uppercase tracking-wider">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
