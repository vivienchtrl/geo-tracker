"use client";

import * as React from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  count: {
    label: "Total Searches",
    color: "var(--muted-foreground)",
  },
  mentionedCount: {
    label: "Brand Mentions",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

interface AISearchStats {
  mentions: { date: string; count: number; mentionedCount: number }[];
}

interface AISearchMetricsChartProps {
  data: AISearchStats;
}

export function AISearchMetricsChart({ data }: AISearchMetricsChartProps) {
  return (
    <Card variant="bento" className="flex flex-col border-0 bg-transparent px-8 py-8 h-full">
      <CardHeader className="px-0 pb-6">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">AI Mention Visibility</CardTitle>
        <CardDescription className="text-[9px] uppercase tracking-widest mt-1">Brand presence across AI searches over time</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 px-0">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart
            data={data.mentions}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={10}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={10}
            />
            <ChartTooltip content={<ChartTooltipContent className="rounded-none border-dashed" />} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="var(--color-count)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="mentionedCount"
              stroke="var(--color-mentionedCount)"
              strokeWidth={3}
              dot={{ fill: "var(--color-mentionedCount)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

