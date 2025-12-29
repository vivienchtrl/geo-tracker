"use client";

/**
 * AI Crawlers Provider
 *
 * Manages:
 * - Filter state (bot, category, date range)
 * - Visits data with pagination
 * - KPIs and chart data
 * - Smooth transitions without page reloads
 *
 * Strategy:
 * - useTransition() for async filter updates
 * - useCallback() to prevent unnecessary re-renders
 * - Context to share state with all child components
 */

import React, {
  createContext,
  useCallback,
  useState,
  useTransition,
  useMemo,
} from "react";
import type { CrawlerVisit } from "@/types/db";
import type {
  AICrawlersContextType,
  AICrawlersFilters,
  CrawlerKPIs,
  TimelineData,
  BotBreakdownData,
} from "../types";
import { getCrawlerVisitsAction } from "../actions";

export const AICrawlersContext = createContext<AICrawlersContextType | null>(
  null
);

interface AICrawlersProviderProps {
  children: React.ReactNode;
  projectId: string;
  initialData: {
    visits: CrawlerVisit[];
    hasMore: boolean;
    kpis: CrawlerKPIs;
    timeline: TimelineData[];
    botBreakdown: BotBreakdownData[];
  };
  initialFilters?: AICrawlersFilters;
}

/**
 * Provider component
 * Wraps dashboard to provide context to all children
 */
export function AICrawlersProvider({
  children,
  projectId,
  initialData,
  initialFilters = {},
}: AICrawlersProviderProps) {
  // State: Filters
  const [filters, setFilters] = useState<AICrawlersFilters>(initialFilters);
  const [selectedBot, setSelectedBot] = useState<string | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  // State: Data
  const [visits, setVisits] = useState<CrawlerVisit[]>(initialData.visits);
  const [hasMore, setHasMore] = useState(initialData.hasMore);
  const [kpis, setKpis] = useState<CrawlerKPIs>(initialData.kpis);
  const [timeline, setTimeline] = useState<TimelineData[]>(initialData.timeline);
  const [botBreakdown, setBotBreakdown] = useState<BotBreakdownData[]>(
    initialData.botBreakdown
  );

  // State: Loading
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Transition for smooth UI updates
  const [isPending, startTransition] = useTransition();

  /**
   * Update filters
   * Triggers refetch of data
   */
  const updateFilters = useCallback(
    (newFilters: Partial<AICrawlersFilters>) => {
      startTransition(async () => {
        setIsLoading(true);
        setError(undefined);

        try {
          // Update local filter state immediately
          setFilters((prev) => ({
            ...prev,
            ...newFilters,
          }));

          // Optionally: fetch new data here if needed
          // const response = await refetchData(projectId, newFilters);
          // setVisits(response.visits);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to update filters"
          );
        } finally {
          setIsLoading(false);
        }
      });
    },
    []
  );

  /**
   * Select bot (for drill-down)
   */
  const selectBot = useCallback((botName?: string) => {
    setSelectedBot(botName);
    setSelectedCategory(undefined);
  }, []);

  /**
   * Select category (for drill-down)
   */
  const selectCategory = useCallback((category?: string) => {
    setSelectedCategory(category);
    setSelectedBot(undefined);
  }, []);

  /**
   * Load more visits (pagination)
   */
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setError(undefined);

    try {
      const result = await getCrawlerVisitsAction(projectId, {
        startDate: filters.startDate,
        endDate: filters.endDate,
        botName: filters.botName,
        botCategory: filters.botCategory,
        offset: visits.length,
        limit: 20,
      });

      setVisits((prev) => [...prev, ...result.visits]);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load more visits"
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [projectId, filters, visits.length, isLoadingMore, hasMore]);

  /**
   * Refetch all data
   * Called manually or on filter change
   */
  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      const result = await getCrawlerVisitsAction(projectId, {
        startDate: filters.startDate,
        endDate: filters.endDate,
        botName: filters.botName,
        botCategory: filters.botCategory,
        limit: 20,
        offset: 0,
      });

      setVisits(result.visits);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refetch data");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, filters]);

  /**
   * Memoize context value to prevent unnecessary re-renders
   */
  const contextValue = useMemo<AICrawlersContextType>(
    () => ({
      filters,
      selectedBot,
      selectedCategory,
      visits,
      hasMore,
      isLoading: isLoading || isPending,
      isLoadingMore,
      error,
      kpis,
      timeline,
      botBreakdown,
      updateFilters,
      selectBot,
      selectCategory,
      loadMore,
      refetch,
    }),
    [
      filters,
      selectedBot,
      selectedCategory,
      visits,
      hasMore,
      isLoading,
      isPending,
      isLoadingMore,
      error,
      kpis,
      timeline,
      botBreakdown,
      updateFilters,
      selectBot,
      selectCategory,
      loadMore,
      refetch,
    ]
  );

  return (
    <AICrawlersContext.Provider value={contextValue}>
      {children}
    </AICrawlersContext.Provider>
  );
}
