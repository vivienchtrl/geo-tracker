"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
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
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
  tablet: {
    label: "Tablet",
    color: "var(--chart-3)",
  },
  unknown: {
    label: "Other",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

interface DeviceData {
  deviceType: string | null;
  count: number;
}

interface DeviceBreakdownProps {
  data: DeviceData[];
}

export function DeviceBreakdown({ data }: DeviceBreakdownProps) {
  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      device: item.deviceType || "unknown",
      count: item.count,
      fill: `var(--color-${item.deviceType || "unknown"})`,
    }));
  }, [data]);

  const totalVisitors = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.count, 0);
  }, [data]);

  return (
    <Card variant="bento" className="flex flex-col border-0 bg-transparent px-8 py-8 h-full">
      <CardHeader className="px-0 pb-6 items-center">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Device Distribution</CardTitle>
        <CardDescription className="text-[9px] uppercase tracking-widest mt-1">Traffic by device category</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 px-0 pb-0 flex items-center justify-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[280px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel className="rounded-none border-dashed" />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="device"
              innerRadius={70}
              strokeWidth={0}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-black tracking-tighter"
                        >
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-[10px] uppercase font-bold tracking-[0.2em]"
                        >
                          VISITORS
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

