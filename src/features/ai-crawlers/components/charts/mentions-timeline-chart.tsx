"use client";

/**
 * Mentions Timeline Chart
 *
 * Displays:
 * - Line chart showing AI mentions over time
 * - When LLMs reference the website in responses
 */

import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Area,
  AreaChart,
} from "recharts";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";

const DATE_RANGES = [
  { value: "7", label: "7d" },
  { value: "15", label: "15d" },
  { value: "30", label: "30d" },
];

interface MentionData {
  date: string;
  mentions: number;
}

interface MentionsTimelineChartProps {
  data: MentionData[];
  isLoading?: boolean;
}

export function MentionsTimelineChart({
  data,
  isLoading = false,
}: MentionsTimelineChartProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentDays = searchParams.get("days") || "7";

  const updateDays = (days: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("days", days);
    router.push(`?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <Card variant="bento" className="border-0 bg-transparent">
        <CardHeader className="px-8 py-6">
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
            AI Mentions
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
            AI Mentions
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8 py-6">
          <div className="h-[350px] flex items-center justify-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              No mentions yet
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="bento" className="border-0 bg-transparent">
      <CardHeader className="px-8 py-6 border-b border-dashed border-border/80">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
              AI Mentions
            </CardTitle>
            <p className="text-[9px] text-muted-foreground/60 mt-1 uppercase tracking-widest">
              When LLMs reference your site
            </p>
          </div>

          {/* Date Range Tabs */}
          <div className="flex items-center gap-0.5 bg-muted/50 rounded-md p-0.5">
            {DATE_RANGES.map((range) => (
              <Button
                key={range.value}
                variant="ghost"
                size="sm"
                onClick={() => updateDays(range.value)}
                className={cn(
                  "h-7 px-2.5 text-[10px] uppercase tracking-widest rounded-sm",
                  currentDays === range.value
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-8 py-6">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
            >
              <defs>
                <linearGradient id="mentionsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  borderRadius: "4px",
                  fontSize: "11px",
                }}
                formatter={(value: number) => [value, "Mentions"]}
              />
              <Area
                type="monotone"
                dataKey="mentions"
                stroke="var(--chart-3)"
                strokeWidth={2}
                fill="url(#mentionsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
