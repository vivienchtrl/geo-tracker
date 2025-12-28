"use client";

/**
 * AI Monitoring Dashboard Shell
 *
 * Assembles all components:
 * - Filters
 * - Metrics (KPI Cards)
 * - Timeline Chart
 * - Keywords Table
 * - Models Breakdown
 * - Competitors Insights
 * - Prompts List
 *
 * Responsive grid layout with clean borders
 */

import { Suspense, useState, useCallback } from "react";
import { useAIMonitoring } from "../hooks/use-ai-monitoring";
import { AIMonitoringFilters } from "./ai-monitoring-filters";
import { AIMonitoringMetrics } from "./ai-monitoring-metrics";
import { AIMentionTimelineChart } from "./charts/ai-mention-timeline-chart";
import { AIModelsBreakdownChart } from "./charts/ai-models-breakdown-chart";
import { AIKeywordsTable } from "./ai-keywords-table";
import { AICompetitorsInsights } from "./ai-competitors-insights";
import { PromptsListTable, type PromptItem } from "./prompts/prompts-list-table";
import { Skeleton } from "@/components/ui/skeleton";
import { getPromptsData } from "../actions";
import type { AiSearch, Keyword } from "@/types/db";

interface AIMonitoringDashboardProps {
  projectId: string;
  keywords: Keyword[];
  initialMentions: AiSearch[];

  // Aggregated data for display
  mentionTimeline: Array<{
    date: string;
    total: number;
    mentioned: number;
  }>;
  modelBreakdown: Array<{
    name: string;
    total: number;
    mentioned: number;
    mentionRate: number;
  }>;
  competitorInsights: Array<{
    domain: string;
    mentions: number;
    avgRank: number;
    modelsFound: string[];
  }>;
  kpis: {
    totalScans: number;
    totalMentions: number;
    visibilityRate: number;
    avgRank: number;
  };

  // Initial prompts data
  initialPrompts?: {
    queries: PromptItem[];
    hasMore: boolean;
    total: number;
  };
}

export function AIMonitoringDashboard({
  projectId,
  keywords,
  initialMentions,
  mentionTimeline,
  modelBreakdown,
  competitorInsights,
  kpis,
  initialPrompts,
}: AIMonitoringDashboardProps) {
  const { isLoading, filters } = useAIMonitoring();

  // Prompts state with "Load More" support
  const [prompts, setPrompts] = useState<PromptItem[]>(initialPrompts?.queries || []);
  const [hasMorePrompts, setHasMorePrompts] = useState(initialPrompts?.hasMore || false);
  const [isLoadingMorePrompts, setIsLoadingMorePrompts] = useState(false);

  const handleLoadMorePrompts = useCallback(async () => {
    setIsLoadingMorePrompts(true);
    try {
      const result = await getPromptsData(projectId, filters, 20, prompts.length);
      setPrompts((prev) => [...prev, ...result.queries]);
      setHasMorePrompts(result.hasMore);
    } catch (error) {
      console.error("Error loading more prompts:", error);
    } finally {
      setIsLoadingMorePrompts(false);
    }
  }, [projectId, filters, prompts.length]);

  const topCompetitor = competitorInsights?.[0];

  return (
    <div className="flex flex-col min-h-full px-8 py-6">
      {/* Filters Section */}
      <Suspense fallback={<FilterSkeleton />}>
        <AIMonitoringFilters
          keywords={keywords.map((k) => ({ id: k.id, term: k.term }))}
          models={modelBreakdown.map((m) => m.name)}
          competitors={competitorInsights.map((c) => c.domain)}
        />
      </Suspense>

      {/* KPI Metrics */}
      <Suspense fallback={<MetricsSkeleton />}>
        <AIMonitoringMetrics
          totalScans={kpis.totalScans}
          mentionCount={kpis.totalMentions}
          visibilityRate={kpis.visibilityRate}
          avgRank={kpis.avgRank}
          topCompetitor={
            topCompetitor
              ? {
                  domain: topCompetitor.domain,
                  mentions: topCompetitor.mentions,
                }
              : undefined
          }
        />
      </Suspense>

      {/* Main Grid */}
      <div className="flex-1 flex flex-col">
        {/* Row 1: Timeline + Models */}
        <div className="grid gap-0 lg:grid-cols-12 border-b border-dashed border-border/80">
          <div className="lg:col-span-8 border-r border-dashed border-border/80">
            <Suspense fallback={<ChartSkeleton />}>
              <AIMentionTimelineChart
                data={mentionTimeline}
                isLoading={isLoading}
              />
            </Suspense>
          </div>
          <div className="lg:col-span-4">
            <Suspense fallback={<ChartSkeleton />}>
              <AIModelsBreakdownChart
                data={modelBreakdown}
                isLoading={isLoading}
              />
            </Suspense>
          </div>
        </div>

        {/* Row 2: Keywords Table */}
        <div className="border-b border-dashed border-border/80">
          <Suspense fallback={<TableSkeleton />}>
            <AIKeywordsTable
              keywords={initialMentions
                .reduce(
                  (acc, mention) => {
                    const existing = acc.find((k) => k.id === mention.keywordId);
                    if (!existing && mention.keywordId) {
                      const keyword = keywords.find(
                        (k) => k.id === mention.keywordId
                      );
                      if (keyword) {
                        acc.push({
                          id: mention.keywordId,
                          term: keyword.term,
                          totalScans: 0,
                          mentions: 0,
                          visibilityRate: 0,
                          avgRank: 0,
                          competitors: [],
                        });
                      }
                    }
                    return acc;
                  },
                  [] as Array<{
                    id: string;
                    term: string;
                    totalScans: number;
                    mentions: number;
                    visibilityRate: number;
                    avgRank: number;
                    competitors: Array<{
                      domain: string;
                      count: number;
                      avgRank: number;
                    }>;
                  }>
                )
                .slice(0, 10)}
              isLoading={isLoading}
            />
          </Suspense>
        </div>

        {/* Row 3: Prompts List */}
        <div className="border-b border-dashed border-border/80">
          <Suspense fallback={<TableSkeleton />}>
            <PromptsListTable
              projectId={projectId}
              prompts={prompts}
              hasMore={hasMorePrompts}
              isLoading={isLoading}
              onLoadMore={handleLoadMorePrompts}
              isLoadingMore={isLoadingMorePrompts}
            />
          </Suspense>
        </div>

        {/* Row 4: Competitors */}
        <div className="grid gap-0 lg:grid-cols-2 border-b border-dashed border-border/80">
          <div className="lg:border-r border-dashed border-border/80">
            <Suspense fallback={<TableSkeleton />}>
              <AICompetitorsInsights
                competitors={competitorInsights}
                isLoading={isLoading}
              />
            </Suspense>
          </div>
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
      <div className="grid gap-3 md:grid-cols-5">
        {[...Array(5)].map((_, i) => (
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
          className={`border-r border-dashed border-border/80 last:border-r-0 px-6 py-6 ${
            i % 2 === 1 && "md:border-r-0"
          } ${i % 3 === 2 && "lg:border-r-0"}`}
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


