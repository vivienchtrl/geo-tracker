"use client";

/**
 * Analytics Metrics Component
 *
 * KPI cards for the analytics dashboard
 */

import { Users, Eye, Clock, TrendingDown } from "lucide-react";

interface AnalyticsMetricsProps {
  totalVisits: number;
  uniqueVisitors: number;
  pageviews: number;
  avgTimeOnPage: number;
  bounceRate: number;
}

export function AnalyticsMetrics({
  totalVisits,
  uniqueVisitors,
  pageviews,
  avgTimeOnPage,
  bounceRate,
}: AnalyticsMetricsProps) {
  const metrics = [
    {
      label: "Total Visits",
      value: totalVisits.toLocaleString(),
      icon: <Eye className="h-4 w-4" />,
    },
    {
      label: "Unique Visitors",
      value: uniqueVisitors.toLocaleString(),
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Pageviews",
      value: pageviews.toLocaleString(),
      icon: <Eye className="h-4 w-4" />,
    },
    {
      label: "Avg. Time on Page",
      value: formatTime(avgTimeOnPage),
      icon: <Clock className="h-4 w-4" />,
    },
    {
      label: "Bounce Rate",
      value: `${bounceRate}%`,
      icon: <TrendingDown className="h-4 w-4" />,
    },
  ];

  return (
    <div className="grid gap-0 md:grid-cols-2 lg:grid-cols-5 border-b border-dashed border-border/80">
      {metrics.map((metric, index) => (
        <div
          key={metric.label}
          className={`px-6 py-6 ${
            index < metrics.length - 1
              ? "border-r border-dashed border-border/80"
              : ""
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-muted-foreground">{metric.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
              {metric.label}
            </span>
          </div>
          <div className="text-3xl font-black tracking-tighter">
            {metric.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}
