"use client";

/**
 * Analytics Dashboard Shell (Human Traffic)
 *
 * Assembles all components:
 * - Filters
 * - Metrics (KPI Cards)
 * - Timeline Chart
 * - Device Breakdown
 * - Geo Distribution
 * - Referrer Breakdown
 * - Recent Visits Table
 *
 * Uses AnalyticsProvider context for state management
 */

import { Suspense } from "react";
import { AnalyticsFilters } from "./analytics-filters";
import { AnalyticsMetrics } from "./analytics-metrics";
import { TrafficOverviewChart } from "./traffic-overview-chart";
import { DeviceBreakdown } from "./device-breakdown";
import { GeoDistribution } from "./geo-distribution";
import { ReferrerBreakdown } from "./referrer-breakdown";
import { RecentVisitsTable } from "./recent-visits-table";
import {
  useAnalytics,
  useAnalyticsKPIs,
  useAnalyticsCharts,
  useAnalyticsPagination,
} from "../hooks/use-analytics";
import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsDashboard() {
  const { visits } = useAnalytics();
  const kpis = useAnalyticsKPIs();
  const { timeline, deviceBreakdown, geoBreakdown, referrerBreakdown } = useAnalyticsCharts();
  const { hasMore, isLoadingMore, loadMore } = useAnalyticsPagination();

  return (
    <div className="flex flex-col min-h-full">
      {/* Filters Section */}
      <Suspense fallback={<FilterSkeleton />}>
        <AnalyticsFilters />
      </Suspense>

      {/* KPI Metrics */}
      <Suspense fallback={<MetricsSkeleton />}>
        <AnalyticsMetrics
          totalVisits={kpis.totalVisits}
          uniqueVisitors={kpis.uniqueVisitors}
          pageviews={kpis.pageviews}
          avgTimeOnPage={kpis.avgTimeOnPage}
          bounceRate={kpis.bounceRate}
        />
      </Suspense>

      {/* Main Grid */}
      <div className="flex-1 flex flex-col">
        {/* Row 1: Traffic Timeline */}
        <div className="border-b border-dashed border-border/80">
          <Suspense fallback={<ChartSkeleton />}>
            <div className="px-8 py-6">
              <TrafficOverviewChart
                data={timeline.map((t) => ({
                  date: t.date,
                  sessions: t.visits,
                  aiReferrals: 0,
                }))}
              />
            </div>
          </Suspense>
        </div>

        {/* Row 2: Device + Geo + Referrer */}
        <div className="grid gap-0 lg:grid-cols-12 border-b border-dashed border-border/80">
          <div className="lg:col-span-4 border-r border-dashed border-border/80">
            <Suspense fallback={<ChartSkeleton />}>
              <DeviceBreakdown
                data={deviceBreakdown.map((d) => ({
                  deviceType: d.deviceType,
                  count: d.count,
                }))}
              />
            </Suspense>
          </div>
          <div className="lg:col-span-4 border-r border-dashed border-border/80">
            <Suspense fallback={<ChartSkeleton />}>
              <GeoDistribution
                data={geoBreakdown.map((g) => ({
                  name: g.country,
                  code: g.countryCode,
                  count: g.count,
                }))}
              />
            </Suspense>
          </div>
          <div className="lg:col-span-4">
            <Suspense fallback={<ChartSkeleton />}>
              <ReferrerBreakdown
                data={referrerBreakdown.map((r) => ({
                  referrer: r.referrerDomain,
                  count: r.count,
                }))}
              />
            </Suspense>
          </div>
        </div>

        {/* Row 3: Recent Visits Table */}
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
