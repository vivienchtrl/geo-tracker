"use client";

/**
 * Crawlers Timeline Chart
 *
 * Displays:
 * - Total visits over time
 * - AI crawlers vs other breakdown
 * - Site mentions overlay
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from "recharts";

interface TimelineData {
  date: string;
  total: number;
  aiCrawlers: number;
  mentioned: number;
}

interface CrawlersTimelineChartProps {
  data: TimelineData[];
  isLoading?: boolean;
}

export function CrawlersTimelineChart({
  data,
  isLoading = false,
}: CrawlersTimelineChartProps) {
  if (isLoading) {
    return (
      <Card variant="bento" className="border-0 bg-transparent">
        <CardHeader className="px-8 py-6">
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
            Crawler Activity
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
            Crawler Activity
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

  const chartData = data.map((item) => ({
    ...item,
    otherCrawlers: item.total - item.aiCrawlers,
  }));

  return (
    <Card variant="bento" className="border-0 bg-transparent">
      <CardHeader className="px-8 py-6 border-b border-dashed border-border/80">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
          Crawler Activity
        </CardTitle>
        <p className="text-[9px] text-muted-foreground/60 mt-1 uppercase tracking-widest">
          Daily crawler visits over time
        </p>
      </CardHeader>
      <CardContent className="px-8 py-6">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
                opacity={0.3}
              />
              <XAxis
                dataKey="date"
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  borderRadius: "4px",
                  fontSize: "11px",
                }}
                cursor={{ fill: "var(--primary)", opacity: 0.1 }}
              />
              <Legend
                wrapperStyle={{
                  fontSize: "11px",
                  color: "var(--muted-foreground)",
                }}
              />
              <Bar
                dataKey="aiCrawlers"
                stackId="a"
                fill="hsl(var(--chart-1))"
                name="AI Crawlers"
                radius={[0, 0, 0, 0]}
                opacity={0.9}
              />
              <Bar
                dataKey="otherCrawlers"
                stackId="a"
                fill="var(--muted-foreground)"
                name="Other Bots"
                radius={[4, 4, 0, 0]}
                opacity={0.3}
              />
              <Line
                type="monotone"
                dataKey="mentioned"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Site Mentions"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
