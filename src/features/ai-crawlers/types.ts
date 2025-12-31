/**
 * AI Crawlers Feature Types
 *
 * Separate from db.ts to keep feature isolated
 * Imported by components, providers, and hooks
 */

import type { CrawlerVisit } from "@/types/db";

/**
 * Context type for AICrawlersProvider
 */
export type AICrawlersContextType = {
  // Filter State
  filters: AICrawlersFilters;
  selectedBot?: string;
  selectedCategory?: string;

  // Data
  visits: CrawlerVisit[];
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error?: string;

  // KPIs
  kpis: CrawlerKPIs;

  // Chart Data
  timeline: TimelineData[];
  mentionsTimeline: MentionsData[];
  botBreakdown: BotBreakdownData[];

  // Filter Actions
  updateFilters: (filters: Partial<AICrawlersFilters>) => void;
  selectBot: (botName?: string) => void;
  selectCategory: (category?: string) => void;

  // Data Actions
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
};

/**
 * Filters specific to AI Crawlers
 */
export type AICrawlersFilters = {
  botName?: string;
  botCategory?: string;
};

/**
 * KPI metrics for crawler dashboard
 */
export type CrawlerKPIs = {
  totalVisits: number;
  uniqueBots: number;
  uniquePaths: number;
  siteMentions: number;
  avgResponseTime: number;
};

/**
 * Timeline chart data - stacked by bot
 * Each entry has a date and count per bot
 */
export type TimelineData = {
  date: string;
  crawlers: number;
  userMentions: number;
  searchMentions: number;
  [botName: string]: string | number;
};

/**
 * Mentions timeline data
 */
export type MentionsData = {
  date: string;
  mentions: number;
};

/**
 * Bot breakdown chart data
 */
export type BotBreakdownData = {
  botName: string;
  count: number;
};

/**
 * Tab type for AI Crawlers dashboard
 */
export type AICrawlersTab = "overview" | "visits" | "bots" | "api-keys";
