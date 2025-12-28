"use client";

/**
 * AI Mention Timeline Chart
 *
 * Displays:
 * - Total mentions over time
 * - Mentioned vs non-mentioned breakdown
 * - Responsive to filter changes
 *
 * Features:
 * - Dual-axis chart (total vs mentioned)
 * - Smooth transitions
 * - Tooltip with details
 * - Mobile responsive
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";

interface MentionTimelineData {
  date: string;
  total: number;
  mentioned: number;
}

interface AIMentionTimelineChartProps {
  data: MentionTimelineData[];
  isLoading?: boolean;
}

export function AIMentionTimelineChart({
  data,
  isLoading = false,
}: AIMentionTimelineChartProps) {
  if (isLoading) {
    return (
      <Card variant="bento" className="border-0 bg-transparent">
        <CardHeader className="px-8 py-6">
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
            Mention Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8 py-4">
          <div className="h-[350px] bg-muted/20 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    notMentioned: item.total - item.mentioned,
  }));

  return (
    <Card variant="bento" className="border-0 bg-transparent">
      <CardHeader className="px-8 py-6 border-b border-dashed border-border/80">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
          Mention Timeline
        </CardTitle>
        <p className="text-[9px] text-muted-foreground/60 mt-1 uppercase tracking-widest">
          Daily mentions activity
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
                dataKey="mentioned"
                fill="var(--primary)"
                name="Mentioned"
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              />
              <Bar
                dataKey="notMentioned"
                fill="var(--muted-foreground)"
                name="Not Mentioned"
                radius={[4, 4, 0, 0]}
                opacity={0.3}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}


