
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
import { sourceData } from "../mock-data";

const chartConfig = {
  documentation: {
    label: "Documentation",
    color: "hsl(var(--chart-1))",
  },
  blog: {
    label: "Blog Posts",
    color: "hsl(var(--chart-2))",
  },
  "case-studies": {
    label: "Case Studies",
    color: "hsl(var(--chart-3))",
  },
  pricing: {
    label: "Pricing Page",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function SourceDistributionChart() {
  const totalCitations = React.useMemo(() => {
    return sourceData.reduce((acc, curr) => acc + curr.count, 0);
  }, []);

  return (
    <Card variant="bento" className="flex flex-col border-0 bg-transparent px-8 py-8 h-full">
      <CardHeader className="px-0 pb-6 items-center">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Top Cited Sources</CardTitle>
        <CardDescription className="text-[9px] uppercase tracking-widest mt-1">Distribution of content types cited by AI</CardDescription>
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
              data={sourceData}
              dataKey="count"
              nameKey="source"
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
                          {totalCitations.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-[10px] uppercase font-bold tracking-[0.2em]"
                        >
                          CITATIONS
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






