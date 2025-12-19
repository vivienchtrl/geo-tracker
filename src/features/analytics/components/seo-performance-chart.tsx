"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
import type { SearchConsoleMetric } from "@/types/db";

const chartConfig = {
  clicks: {
    label: "Clicks",
    color: "var(--chart-1)",
  },
  impressions: {
    label: "Impressions",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

interface SeoPerformanceChartProps {
  data: SearchConsoleMetric[];
}

export function SeoPerformanceChart({ data }: SeoPerformanceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Performance</CardTitle>
        <CardDescription>Clicks and Impressions distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart
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
                width={40}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="impressions"
              stackId="a"
              fill="var(--color-impressions)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="clicks"
              stackId="a"
              fill="var(--color-clicks)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}



