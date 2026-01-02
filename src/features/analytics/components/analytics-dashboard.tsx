"use client";

/**
 * Analytics Dashboard - Vercel Style
 *
 * Layout:
 * - Time period selector at top (7d, 30d, 90d, 12m)
 * - Area chart showing traffic over time
 * - Tabbed breakdown section (Pages, Referrers, Countries, Devices, OS, Browsers, UTM)
 */

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  useAnalytics,
  useAnalyticsKPIs,
  useAnalyticsCharts,
} from "../hooks/use-analytics";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/utils";
import type { AnalyticsTimePeriod } from "../types";

const chartConfig = {
  visitors: {
    label: "Visitors",
    color: "var(--chart-1)",
  },
  pageviews: {
    label: "Pageviews",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const timePeriods: { value: AnalyticsTimePeriod; label: string }[] = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "3M" },
  { value: "12m", label: "12M" },
];

export function AnalyticsDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { timePeriod } = useAnalytics();
  const kpis = useAnalyticsKPIs();
  const { timeline, pathBreakdown, referrerBreakdown, geoBreakdown, deviceBreakdown, osBreakdown, browserBreakdown, sourceBreakdown } = useAnalyticsCharts();
  const [activeTab, setActiveTab] = useState("pages");

  const handlePeriodChange = (period: AnalyticsTimePeriod) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", period);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Time Period Selector + KPIs */}
      <div className="px-8 py-6 border-b border-dashed border-border/80">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1 p-1 bg-muted/30 border border-dashed border-border/80 rounded-lg">
            {timePeriods.map((period) => (
              <button
                key={period.value}
                onClick={() => handlePeriodChange(period.value)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                  timePeriod === period.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {period.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-chart-1" />
              <span className="text-muted-foreground">Visitors</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-chart-2" />
              <span className="text-muted-foreground">Pageviews</span>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label="Total Visitors" value={kpis.uniqueVisitors.toLocaleString()} />
          <KPICard label="Total Pageviews" value={kpis.pageviews.toLocaleString()} />
          <KPICard label="Bounce Rate" value={`${kpis.bounceRate}%`} />
          <KPICard label="Avg. Time on Page" value={formatDuration(kpis.avgTimeOnPage)} />
        </div>
      </div>

      {/* Main Chart */}
      <div className="px-8 py-6 border-b border-dashed border-border/80">
        <Suspense fallback={<ChartSkeleton />}>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart
              data={timeline.map((t) => ({
                date: t.date,
                visitors: t.uniqueVisitors,
                pageviews: t.pageviews,
              }))}
              margin={{ left: 0, right: 0, top: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-visitors)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-visitors)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fillPageviews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-pageviews)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-pageviews)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
                className="text-xs text-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={40}
                tickFormatter={(value) => value.toLocaleString()}
                className="text-xs text-muted-foreground"
              />
              <ChartTooltip
                cursor={{ stroke: "var(--border)", strokeDasharray: "3 3" }}
                content={<ChartTooltipContent />}
              />
              <Area
                dataKey="visitors"
                type="monotone"
                fill="url(#fillVisitors)"
                stroke="var(--color-visitors)"
                strokeWidth={2}
              />
              <Area
                dataKey="pageviews"
                type="monotone"
                fill="url(#fillPageviews)"
                stroke="var(--color-pageviews)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </Suspense>
      </div>

      {/* Tabbed Breakdown Section */}
      <div className="flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-8 py-4 border-b border-dashed border-border/80">
            <TabsList variant="line">
              <TabsTrigger value="pages">Pages</TabsTrigger>
              <TabsTrigger value="referrers">Referrers</TabsTrigger>
              <TabsTrigger value="countries">Countries</TabsTrigger>
              <TabsTrigger value="devices">Devices</TabsTrigger>
              <TabsTrigger value="os">OS</TabsTrigger>
              <TabsTrigger value="browsers">Browsers</TabsTrigger>
              <TabsTrigger value="utm">UTM</TabsTrigger>
            </TabsList>
          </div>

          <div className="px-8 py-6">
            <TabsContent value="pages">
              <BreakdownTable
                data={pathBreakdown.map((p) => ({
                  name: p.path,
                  subtitle: p.title !== p.path ? p.title : undefined,
                  value: p.views,
                  secondary: p.uniqueViews,
                  percentage: p.percentage,
                }))}
                columns={["Path", "Views", "Uniques", "%"]}
              />
            </TabsContent>

            <TabsContent value="referrers">
              <BreakdownTable
                data={referrerBreakdown.map((r) => ({
                  name: r.referrerDomain,
                  value: r.count,
                  percentage: r.percentage,
                }))}
                columns={["Referrer", "Visitors", "%"]}
              />
            </TabsContent>

            <TabsContent value="countries">
              <BreakdownTable
                data={geoBreakdown.map((g) => ({
                  name: g.country,
                  subtitle: g.countryCode,
                  value: g.count,
                  percentage: g.percentage,
                }))}
                columns={["Country", "Visitors", "%"]}
              />
            </TabsContent>

            <TabsContent value="devices">
              <BreakdownTable
                data={deviceBreakdown.map((d) => ({
                  name: capitalizeFirst(d.deviceType),
                  value: d.count,
                  percentage: d.percentage,
                }))}
                columns={["Device", "Visitors", "%"]}
              />
            </TabsContent>

            <TabsContent value="os">
              <BreakdownTable
                data={osBreakdown.map((o) => ({
                  name: o.os,
                  value: o.count,
                  percentage: o.percentage,
                }))}
                columns={["Operating System", "Visitors", "%"]}
              />
            </TabsContent>

            <TabsContent value="browsers">
              <BreakdownTable
                data={browserBreakdown.map((b) => ({
                  name: b.browser,
                  value: b.count,
                  percentage: b.percentage,
                }))}
                columns={["Browser", "Visitors", "%"]}
              />
            </TabsContent>

            <TabsContent value="utm">
              <BreakdownTable
                data={sourceBreakdown.map((s) => ({
                  name: s.source,
                  subtitle: s.medium !== "None" ? s.medium : undefined,
                  value: s.count,
                  percentage: s.percentage,
                }))}
                columns={["Source / Medium", "Visitors", "%"]}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

/**
 * KPI Card Component
 */
function KPICard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 bg-muted/20 border border-dashed border-border/80 rounded-lg">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

/**
 * Breakdown Table Component
 */
function BreakdownTable({
  data,
  columns,
}: {
  data: {
    name: string;
    subtitle?: string;
    value: number;
    secondary?: number;
    percentage: number;
  }[];
  columns: string[];
}) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No data available for this period
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="grid gap-4 px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
           style={{ gridTemplateColumns: columns.length === 4 ? "1fr 80px 80px 60px" : "1fr 80px 60px" }}>
        {columns.map((col) => (
          <div key={col} className={col !== columns[0] ? "text-right" : ""}>
            {col}
          </div>
        ))}
      </div>

      {/* Rows */}
      {data.map((item, index) => (
        <div
          key={`${item.name}-${index}`}
          className="relative group"
        >
          {/* Background bar */}
          <div
            className="absolute inset-y-0 left-0 bg-muted/30 rounded-md transition-all group-hover:bg-muted/50"
            style={{ width: `${(item.value / maxValue) * 100}%` }}
          />

          {/* Content */}
          <div
            className="relative grid gap-4 px-3 py-2.5 text-sm"
            style={{ gridTemplateColumns: columns.length === 4 ? "1fr 80px 80px 60px" : "1fr 80px 60px" }}
          >
            <div className="flex flex-col min-w-0">
              <span className="truncate font-medium">{item.name}</span>
              {item.subtitle && (
                <span className="text-xs text-muted-foreground truncate">{item.subtitle}</span>
              )}
            </div>
            <div className="text-right tabular-nums">{item.value.toLocaleString()}</div>
            {item.secondary !== undefined && (
              <div className="text-right tabular-nums text-muted-foreground">
                {item.secondary.toLocaleString()}
              </div>
            )}
            <div className="text-right tabular-nums text-muted-foreground">{item.percentage}%</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Chart Skeleton
 */
function ChartSkeleton() {
  return (
    <div className="h-[300px] w-full">
      <Skeleton className="h-full w-full" />
    </div>
  );
}

/**
 * Format duration in seconds to human readable format
 */
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
