"use client";

/**
 * AI Crawlers Metrics - KPI Cards
 *
 * Displays:
 * - Total Visits
 * - Unique Bots
 * - Pages Crawled
 * - Site Mentions
 * - Avg Response Time
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, FileText, MessageSquare, Clock, Activity } from "lucide-react";

interface AICrawlersMetricsProps {
  totalVisits: number;
  uniqueBots: number;
  uniquePaths: number;
  siteMentions: number;
  avgResponseTime: number;
}

export function AICrawlersMetrics({
  totalVisits,
  uniqueBots,
  uniquePaths,
  siteMentions,
  avgResponseTime,
}: AICrawlersMetricsProps) {
  const metrics = [
    {
      label: "Total Visits",
      value: totalVisits.toLocaleString(),
      icon: <Activity className="h-4 w-4" />,
    },
    {
      label: "Unique Bots",
      value: uniqueBots.toLocaleString(),
      icon: <Bot className="h-4 w-4" />,
    },
    {
      label: "Pages Crawled",
      value: uniquePaths.toLocaleString(),
      icon: <FileText className="h-4 w-4" />,
    },
    {
      label: "Site Mentions",
      value: siteMentions.toLocaleString(),
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      label: "Avg Response",
      value: avgResponseTime.toLocaleString(),
      suffix: "ms",
      icon: <Clock className="h-4 w-4" />,
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
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
