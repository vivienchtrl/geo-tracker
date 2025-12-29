/**
 * AI Crawlers Custom Hooks
 *
 * Purpose: Provide easy access to AI crawlers context and data
 * Usage: const { visits, kpis, loadMore } = useAICrawlers()
 */

import { useContext } from "react";
import { AICrawlersContext } from "../providers/ai-crawlers-provider";
import type { AICrawlersContextType } from "../types";

/**
 * Main hook to access AI Crawlers context
 * Must be used within AICrawlersProvider
 */
export function useAICrawlers(): AICrawlersContextType {
  const context = useContext(AICrawlersContext);

  if (!context) {
    throw new Error("useAICrawlers must be used within AICrawlersProvider");
  }

  return context;
}

/**
 * Hook to check if a specific bot is selected
 */
export function useSelectedBot(): string | undefined {
  const { selectedBot } = useAICrawlers();
  return selectedBot;
}

/**
 * Hook to check if a specific category is selected
 */
export function useSelectedCategory(): string | undefined {
  const { selectedCategory } = useAICrawlers();
  return selectedCategory;
}

/**
 * Hook to filter visits based on current selection
 */
export function useFilteredVisits() {
  const { visits, selectedBot, selectedCategory } = useAICrawlers();

  return visits.filter((visit) => {
    // Filter by bot if selected
    if (selectedBot && visit.botName !== selectedBot) {
      return false;
    }

    // Filter by category if selected
    if (selectedCategory && visit.botCategory !== selectedCategory) {
      return false;
    }

    return true;
  });
}

/**
 * Hook to get loading state
 */
export function useAICrawlersLoading(): boolean {
  const { isLoading } = useAICrawlers();
  return isLoading;
}

/**
 * Hook to get KPIs
 */
export function useAICrawlersKPIs() {
  const { kpis } = useAICrawlers();
  return kpis;
}

/**
 * Hook to get chart data
 */
export function useAICrawlersCharts() {
  const { timeline, botBreakdown } = useAICrawlers();
  return { timeline, botBreakdown };
}

/**
 * Hook for pagination
 */
export function useAICrawlersPagination() {
  const { hasMore, isLoadingMore, loadMore } = useAICrawlers();
  return { hasMore, isLoadingMore, loadMore };
}
