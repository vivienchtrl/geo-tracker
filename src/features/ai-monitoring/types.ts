/**
 * AI Monitoring Feature Types
 *
 * Separate from dashboard.ts to keep feature isolated
 * Imported by components, providers, and hooks
 */

import type { DashboardFilters } from "@/types/dashboard";
import type { AiSearch } from "@/types/db";

/**
 * Context type for AIMonitoringProvider
 */
export type AIMonitoringContextType = {
  // Filter State
  filters: DashboardFilters;
  selectedKeyword?: string;
  selectedModel?: string;
  selectedCompetitor?: string;

  // Detail View State (for inline display)
  selectedQuery?: string;

  // Data
  mentions: AiSearch[];
  isLoading: boolean;
  error?: string;

  // Filter Actions
  updateFilters: (filters: Partial<DashboardFilters>) => void;
  selectKeyword: (keywordId?: string) => void;
  selectModel: (modelName?: string) => void;
  selectCompetitor: (domain?: string) => void;

  // Detail View Actions
  selectQuery: (queryId?: string) => void;

  // Data Actions
  refetch: () => Promise<void>;
};

/**
 * Tab type for AI Monitoring dashboard
 */
export type AIMonitoringTab =
  | "overview"
  | "keywords"
  | "models"
  | "competitors"
  | "prompts";

/**
 * Chart data types
 */
export type MentionTimelineData = {
  date: string;
  total: number;
  mentioned: number;
};

export type ModelDistributionData = {
  name: string;
  total: number;
  mentioned: number;
  mentionRate: number;
};

export type CompetitorRankingData = {
  domain: string;
  mentions: number;
  avgRank: number;
  trend?: "up" | "down" | "stable";
};

/**
 * Query/Prompt types for list and detail views
 */
export type QueryListItem = {
  id: string;
  query: string;
  model: string;
  rank: number | null;
  mentioned: boolean | null;
  date: Date | null;
};

export type QueryDetail = {
  id: string;
  query: string;
  response: string;
  model: string;
  rank: number | null;
  mentioned: boolean | null;
  date: Date | null;
  urls: Array<{ link: string; rank: number; title: string }>;
  competitors: string[];
};


