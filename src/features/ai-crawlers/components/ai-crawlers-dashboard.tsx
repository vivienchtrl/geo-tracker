"use client";

/**
 * AI Crawlers Dashboard Shell
 *
 * Assembles all components:
 * - Filters
 * - Metrics (KPI Cards)
 * - Stacked Bot Timeline Chart
 * - Recent Visits Table
 *
 * Uses AICrawlersProvider context for state management
 */

import { Suspense } from "react";
import { AICrawlersMetrics } from "./ai-crawlers-metrics";
import { CrawlersTimelineChart } from "./charts/crawlers-timeline-chart";
import { MentionsTimelineChart } from "./charts/mentions-timeline-chart";
import { RecentVisitsTable } from "./recent-visits-table";
import {
  useAICrawlers,
  useAICrawlersKPIs,
  useAICrawlersCharts,
  useAICrawlersPagination,
} from "../hooks/use-ai-crawlers";
import { Skeleton } from "@/components/ui/skeleton";

export function AICrawlersDashboard() {
  const { visits } = useAICrawlers();
  const kpis = useAICrawlersKPIs();
  const { timeline, mentionsTimeline, botBreakdown } = useAICrawlersCharts();
  const { hasMore, isLoadingMore, loadMore } = useAICrawlersPagination();

  // Get unique bot names from breakdown
  const uniqueBots = [...new Set(botBreakdown.map((b) => b.botName))];

  return (
    <div className="flex flex-col min-h-full">
      {/* KPI Metrics */}
      <Suspense fallback={<MetricsSkeleton />}>
        <AICrawlersMetrics
          totalVisits={kpis.totalVisits}
          uniqueBots={kpis.uniqueBots}
          uniquePaths={kpis.uniquePaths}
          siteMentions={kpis.siteMentions}
          avgResponseTime={kpis.avgResponseTime}
        />
      </Suspense>

      {/* Charts Row */}
      <div className="grid gap-0 lg:grid-cols-2 border-b border-dashed border-border/80">
        {/* Crawler Activity Chart */}
        <div className="border-r border-dashed border-border/80">
          <Suspense fallback={<ChartSkeleton />}>
            <CrawlersTimelineChart data={timeline} bots={uniqueBots} />
          </Suspense>
        </div>

        {/* AI Mentions Chart */}
        <div>
          <Suspense fallback={<ChartSkeleton />}>
            <MentionsTimelineChart data={mentionsTimeline} />
          </Suspense>
        </div>
      </div>

      {/* Recent Visits Table */}
      <div className="border-b border-dashed border-border/80">
        <Suspense fallback={<TableSkeleton />}>
          <RecentVisitsTable
            visits={visits}
            hasMore={hasMore}
            onLoadMore={loadMore}
            isLoadingMore={isLoadingMore}
          />
        </Suspense>
      </div>
    </div>
  );
}

/**
 * Loading Skeletons
 */

function MetricsSkeleton() {
  return (
    <div className="grid gap-0 md:grid-cols-2 lg:grid-cols-5 border-b border-dashed border-border/80">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="border-r border-dashed border-border/80 last:border-r-0 px-6 py-6"
        >
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="px-8 py-6">
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-[350px] w-full" />
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="px-8 py-6">
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
