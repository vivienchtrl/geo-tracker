"use client";

/**
 * AI Monitoring Metrics - KPI Cards
 *
 * Displays:
 * - Total Scans
 * - Mention Count
 * - Visibility Rate %
 * - Average Rank
 * - Bot Activity
 * - Top Competitor
 *
 * Features:
 * - Real-time updates when filters change
 * - Responsive grid layout
 * - Change indicators (trend)
 * - Icon support for visual recognition
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Eye, Zap, Target } from "lucide-react";
import type { AIMetricCard } from "@/types/dashboard";

interface AIMonitoringMetricsProps {
  totalScans: number;
  mentionCount: number;
  visibilityRate: number;
  avgRank: number;
  topCompetitor?: {
    domain: string;
    mentions: number;
  };
}

export function AIMonitoringMetrics({
  totalScans,
  mentionCount,
  visibilityRate,
  avgRank,
  topCompetitor,
}: AIMonitoringMetricsProps) {
  const metrics: AIMetricCard[] = [
    {
      label: "Total Scans",
      value: totalScans.toLocaleString(),
      icon: <Zap className="h-4 w-4" />,
    },
    {
      label: "Mentions",
      value: mentionCount,
      icon: <Eye className="h-4 w-4" />,
    },
    {
      label: "Visibility Rate",
      value: visibilityRate.toFixed(1),
      suffix: "%",
      icon: <Target className="h-4 w-4" />,
    },
    {
      label: "Average Rank",
      value: avgRank.toFixed(1),
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      label: "Top Competitor",
      value: topCompetitor?.domain || "N/A",
      suffix: topCompetitor ? `(${topCompetitor.mentions})` : undefined,
    },
  ];

  return (
    <div className="grid gap-0 md:grid-cols-2 lg:grid-cols-5 border-b border-dashed border-border/80">
      {metrics.map((metric, idx) => (
        <div
          key={idx}
          className={`border-r border-dashed border-border/80 last:border-r-0 px-6 py-6 ${
            idx % 2 === 1 && "md:border-r-0"
          } ${idx % 3 === 2 && "lg:border-r-0"}`}
        >
          <Card
            variant="bento"
            className="border-0 bg-transparent p-0 shadow-none"
          >
            <CardHeader className="pb-3 px-0">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2">
                {metric.icon && (
                  <span className="text-primary/60">{metric.icon}</span>
                )}
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pt-0">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tracking-tight">
                  {metric.value}
                </span>
                {metric.suffix && (
                  <span className="text-[12px] text-muted-foreground font-medium">
                    {metric.suffix}
                  </span>
                )}
              </div>
              {metric.change && (
                <div className="mt-2 flex items-center gap-1 text-[10px]">
                  {metric.change.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span
                    className={
                      metric.change.trend === "up"
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {metric.change.trend === "up" ? "+" : "-"}
                    {metric.change.value.toFixed(1)}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}


