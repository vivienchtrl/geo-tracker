/**
 * AI Crawlers Feature - Public API
 *
 * Export only what's needed by consumers
 * Keep internal implementation details hidden
 */

// Types
export type { AICrawlersContextType } from "./types";
export type {
  AICrawlersFilters,
  AICrawlersTab,
  CrawlerKPIs,
  TimelineData,
  BotBreakdownData,
} from "./types";

// Provider
export { AICrawlersProvider } from "./providers/ai-crawlers-provider";

// Hooks
export {
  useAICrawlers,
  useSelectedBot,
  useSelectedCategory,
  useFilteredVisits,
  useAICrawlersLoading,
  useAICrawlersKPIs,
  useAICrawlersCharts,
  useAICrawlersPagination,
} from "./hooks/use-ai-crawlers";
