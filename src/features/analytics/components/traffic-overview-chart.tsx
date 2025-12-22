"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  sessions: {
    label: "Total Sessions",
    color: "var(--chart-1)",
  },
  aiReferrals: {
    label: "AI Referrals",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export interface TrafficOverviewData {
  date: string;
  sessions: number;
  aiReferrals: number;
}

interface TrafficOverviewChartProps {
  data: TrafficOverviewData[];
}

export function TrafficOverviewChart({ data }: TrafficOverviewChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic Overview</CardTitle>
        <CardDescription>Total Sessions vs AI Driven Traffic</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
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
                width={30}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              dataKey="sessions"
              type="monotone"
              fill="var(--color-sessions)"
              fillOpacity={0.1}
              stroke="var(--color-sessions)"
              stackId="a"
            />
            <Area
              dataKey="aiReferrals"
              type="monotone"
              fill="var(--color-aiReferrals)"
              fillOpacity={0.4}
              stroke="var(--color-aiReferrals)"
              stackId="b"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}



