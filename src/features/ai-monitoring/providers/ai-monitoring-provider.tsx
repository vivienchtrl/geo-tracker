"use client";

/**
 * AI Monitoring Provider
 *
 * Manages:
 * - Filter state (keyword, model, competitor, date range)
 * - Selected items for drill-down
 * - Data fetching and caching
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
import type { DashboardFilters } from "@/types/dashboard";
import type { AiSearch } from "@/types/db";
import type { AIMonitoringContextType } from "../types";

export const AIMonitoringContext = createContext<AIMonitoringContextType | null>(
  null
);

interface AIMonitoringProviderProps {
  children: React.ReactNode;
  projectId: string;
  initialData: {
    mentions: AiSearch[];
  };
  initialFilters: DashboardFilters;
}

/**
 * Provider component
 * Wraps dashboard to provide context to all children
 */
export function AIMonitoringProvider({
  children,
  projectId,
  initialData,
  initialFilters,
}: AIMonitoringProviderProps) {
  // State: Filters
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters);
  const [selectedKeyword, setSelectedKeyword] = useState<string | undefined>();
  const [selectedModel, setSelectedModel] = useState<string | undefined>();
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | undefined>();

  // State: Detail views (for inline display)
  const [selectedQuery, setSelectedQuery] = useState<string | undefined>();

  // State: Data
  const [mentions, setMentions] = useState<AiSearch[]>(initialData.mentions);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Transition for smooth UI updates
  const [isPending, startTransition] = useTransition();

  /**
   * Update filters
   * Triggers refetch of data
   */
  const updateFilters = useCallback(
    (newFilters: Partial<DashboardFilters>) => {
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
          // setMentions(response.mentions);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to update filters");
        } finally {
          setIsLoading(false);
        }
      });
    },
    []
  );

  /**
   * Select keyword (for drill-down)
   */
  const selectKeyword = useCallback((keywordId?: string) => {
    setSelectedKeyword(keywordId);
    // Clear other selections for clean state
    setSelectedModel(undefined);
    setSelectedCompetitor(undefined);
  }, []);

  /**
   * Select model (for drill-down)
   */
  const selectModel = useCallback((modelName?: string) => {
    setSelectedModel(modelName);
    setSelectedKeyword(undefined);
    setSelectedCompetitor(undefined);
  }, []);

  /**
   * Select competitor (for drill-down)
   */
  const selectCompetitor = useCallback((domain?: string) => {
    setSelectedCompetitor(domain);
    setSelectedKeyword(undefined);
    setSelectedModel(undefined);
  }, []);

  /**
   * Select query (for inline detail view)
   */
  const selectQuery = useCallback((queryId?: string) => {
    setSelectedQuery(queryId);
  }, []);

  /**
   * Refetch all data
   * Called manually or on filter change
   */
  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      // This would call a Server Action to refetch data
      // For now, just toggle loading state
      // const response = await refetchAIMonitoringData(projectId, filters);
      // setMentions(response.mentions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refetch data");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, filters]);

  /**
   * Memoize context value to prevent unnecessary re-renders
   */
  const contextValue = useMemo<AIMonitoringContextType>(
    () => ({
      filters,
      selectedKeyword,
      selectedModel,
      selectedCompetitor,
      selectedQuery,
      mentions,
      isLoading: isLoading || isPending,
      error,
      updateFilters,
      selectKeyword,
      selectModel,
      selectCompetitor,
      selectQuery,
      refetch,
    }),
    [
      filters,
      selectedKeyword,
      selectedModel,
      selectedCompetitor,
      selectedQuery,
      mentions,
      isLoading,
      isPending,
      error,
      updateFilters,
      selectKeyword,
      selectModel,
      selectCompetitor,
      selectQuery,
      refetch,
    ]
  );

  return (
    <AIMonitoringContext.Provider value={contextValue}>
      {children}
    </AIMonitoringContext.Provider>
  );
}


