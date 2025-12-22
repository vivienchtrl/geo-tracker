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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  count: {
    label: "Crawl Frequency",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

interface BotData {
  botName: string | null;
  botType: string | null;
  count: number;
}

interface BotActivityChartProps {
  data: BotData[];
}

export function BotActivityChart({ data }: BotActivityChartProps) {
  return (
    <Card variant="bento" className="flex flex-col border-0 bg-transparent px-8 py-8 h-full">
      <CardHeader className="px-0 pb-6">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">AI Crawler Activity</CardTitle>
        <CardDescription className="text-[9px] uppercase tracking-widest mt-1">Bot crawl frequency by engine</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 px-0">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              left: -20,
            }}
          >
            <CartesianGrid horizontal={false} vertical={false} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="botName"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              fontSize={10}
              className="uppercase font-bold tracking-tighter"
              width={100}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel className="rounded-none border-dashed" />}
            />
            <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

