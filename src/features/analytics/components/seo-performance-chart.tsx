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
    <Card variant="bento" className="border-0 bg-transparent px-8 py-8 h-full">
      <CardHeader className="px-0 pb-6">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Search Performance</CardTitle>
        <CardDescription className="text-[9px] uppercase tracking-widest mt-1">Clicks and Impressions distribution</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <ChartContainer config={chartConfig} className="min-h-[350px] w-full">
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              stroke="var(--muted-foreground)"
              fontSize={10}
              className="uppercase tracking-widest"
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
                stroke="var(--muted-foreground)"
                fontSize={10}
                width={30}
            />
            <ChartTooltip cursor={{ fill: 'var(--secondary)', opacity: 0.05 }} content={<ChartTooltipContent className="rounded-none border-dashed uppercase text-[10px]" />} />
            <ChartLegend content={<ChartLegendContent className="uppercase text-[10px] font-bold tracking-widest pt-8" />} />
            <Bar
              dataKey="impressions"
              stackId="a"
              fill="var(--color-impressions)"
              radius={[0, 0, 0, 0]}
              fillOpacity={0.2}
            />
            <Bar
              dataKey="clicks"
              stackId="a"
              fill="var(--color-clicks)"
              radius={[0, 0, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}



