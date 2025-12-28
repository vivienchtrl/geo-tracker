/**
 * AI Monitoring Custom Hooks
 *
 * Purpose: Provide easy access to AI monitoring context and data
 * Usage: const { filters, mentions, selectKeyword } = useAIMonitoring()
 */

import { useContext } from "react";
import { AIMonitoringContext } from "../providers/ai-monitoring-provider";
import type { AIMonitoringContextType } from "../types";

/**
 * Main hook to access AI Monitoring context
 * Must be used within AIMonitoringProvider
 */
export function useAIMonitoring(): AIMonitoringContextType {
  const context = useContext(AIMonitoringContext);

  if (!context) {
    throw new Error(
      "useAIMonitoring must be used within AIMonitoringProvider"
    );
  }

  return context;
}

/**
 * Hook to check if a specific keyword is selected
 */
export function useSelectedKeyword(): string | undefined {
  const { selectedKeyword } = useAIMonitoring();
  return selectedKeyword;
}

/**
 * Hook to check if a specific model is selected
 */
export function useSelectedModel(): string | undefined {
  const { selectedModel } = useAIMonitoring();
  return selectedModel;
}

/**
 * Hook to check if a specific competitor is selected
 */
export function useSelectedCompetitor(): string | undefined {
  const { selectedCompetitor } = useAIMonitoring();
  return selectedCompetitor;
}

/**
 * Hook to filter mentions based on current selection
 */
export function useFilteredMentions() {
  const { mentions, selectedKeyword, selectedModel, selectedCompetitor } =
    useAIMonitoring();

  return mentions.filter((mention) => {
    // Filter by keyword if selected
    if (selectedKeyword && mention.keywordId !== selectedKeyword) {
      return false;
    }

    // Filter by model if selected
    if (selectedModel && !mention.modelUsed?.includes(selectedModel)) {
      return false;
    }

    // Filter by competitor if selected
    if (selectedCompetitor) {
      const urls = mention.urlsFound as
        | Array<{ link?: string } | string>
        | null;
      const hasCompetitor = Array.isArray(urls) && urls.some((url) => {
        try {
          const link = typeof url === "string" ? url : url?.link;
          if (!link) return false;
          const hostname = new URL(link).hostname.replace("www.", "");
          return (
            hostname === selectedCompetitor.replace("www.", "")
          );
        } catch {
          return false;
        }
      });

      if (!hasCompetitor) return false;
    }

    return true;
  });
}

/**
 * Hook to get loading state
 */
export function useAIMonitoringLoading(): boolean {
  const { isLoading } = useAIMonitoring();
  return isLoading;
}


