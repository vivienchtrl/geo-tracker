"use client";

/**
 * AI Crawlers Dashboard Shell
 *
 * Assembles all components:
 * - Filters
 * - Metrics (KPI Cards)
 * - Timeline Chart
 * - Bot Breakdown Chart
 * - Recent Visits Table
 */

import { Suspense, useState, useCallback } from "react";
import { AICrawlersFilters } from "./ai-crawlers-filters";
import { AICrawlersMetrics } from "./ai-crawlers-metrics";
import { CrawlersTimelineChart } from "./charts/crawlers-timeline-chart";
import { BotBreakdownChart } from "./charts/bot-breakdown-chart";
import { RecentVisitsTable } from "./recent-visits-table";
import { getCrawlerVisitsAction } from "../actions";
import { Skeleton } from "@/components/ui/skeleton";
import type { CrawlerVisit } from "@/types/db";

interface AICrawlersDashboardProps {
  projectId: string;
  initialVisits: CrawlerVisit[];
  hasMoreVisits: boolean;
  kpis: {
    totalVisits: number;
    uniqueBots: number;
    uniquePaths: number;
    siteMentions: number;
    avgResponseTime: number;
  };
  timeline: Array<{
    date: string;
    total: number;
    aiCrawlers: number;
    mentioned: number;
  }>;
  botBreakdown: Array<{
    botName: string;
    count: number;
  }>;
}

export function AICrawlersDashboard({
  projectId,
  initialVisits,
  hasMoreVisits,
  kpis,
  timeline,
  botBreakdown,
}: AICrawlersDashboardProps) {
  const [visits, setVisits] = useState<CrawlerVisit[]>(initialVisits);
  const [hasMore, setHasMore] = useState(hasMoreVisits);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleLoadMore = useCallback(async () => {
    setIsLoadingMore(true);
    try {
      const result = await getCrawlerVisitsAction(projectId, {
        offset: visits.length,
        limit: 20,
      });
      setVisits((prev) => [...prev, ...result.visits]);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Error loading more visits:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [projectId, visits.length]);

  // Get unique bot names for filter
  const uniqueBots = [...new Set(botBreakdown.map((b) => b.botName))];

  return (
    <div className="flex flex-col min-h-full">
      {/* Filters Section */}
      <Suspense fallback={<FilterSkeleton />}>
        <AICrawlersFilters bots={uniqueBots} />
      </Suspense>

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

      {/* Main Grid */}
      <div className="flex-1 flex flex-col">
        {/* Row 1: Timeline + Bot Breakdown */}
        <div className="grid gap-0 lg:grid-cols-12 border-b border-dashed border-border/80">
          <div className="lg:col-span-8 border-r border-dashed border-border/80">
            <Suspense fallback={<ChartSkeleton />}>
              <CrawlersTimelineChart data={timeline} />
            </Suspense>
          </div>
          <div className="lg:col-span-4">
            <Suspense fallback={<ChartSkeleton />}>
              <BotBreakdownChart data={botBreakdown} />
            </Suspense>
          </div>
        </div>

        {/* Row 2: Recent Visits Table */}
        <div className="border-b border-dashed border-border/80">
          <Suspense fallback={<TableSkeleton />}>
            <RecentVisitsTable
              visits={visits}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
              isLoadingMore={isLoadingMore}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading Skeletons
 */

function FilterSkeleton() {
  return (
    <div className="px-8 py-6 border-b border-dashed border-border/80 space-y-4">
      <div className="h-4 w-12 bg-muted rounded animate-pulse" />
      <div className="grid gap-3 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-9" />
        ))}
      </div>
    </div>
  );
}

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
        <Skeleton className="h-[300px] w-full" />
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
