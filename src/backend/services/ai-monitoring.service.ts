/**
 * AI Monitoring Service
 *
 * Purpose: Provide granular, optimized queries for AI search/mention analysis
 * Strategy: Each function is independently cached and can be refetched without affecting others
 *
 * Features:
 * - Keywords analysis (mentions, visibility, trending)
 * - Model metrics (distribution, performance)
 * - Competitor insights (mentions, references)
 * - Prompts/Queries analysis
 */

import { db } from "@/backend/db/db";
import {
  aiSearch,
} from "@/backend/db/tables/schema";
import {
  eq,
  and,
  gte,
  lte,
  desc,
  sql,
  count as dbCount,
  SQL,
} from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { DashboardFilters, getDateRangeDate } from "@/types/dashboard";

/**
 * HELPER FUNCTIONS
 */

/**
 * Extract base model name from full model string
 * Examples:
 * - "GPT-4 (ICP: xyz)" → "GPT"
 * - "Claude-3-Opus (ICP: abc)" → "Claude"
 * - "GPT-3.5-Turbo" → "GPT"
 * - "Claude-3.5-Sonnet" → "Claude"
 */
function extractBaseModelName(modelUsed: string | null): string {
  if (!modelUsed) return "Unknown";

  return modelUsed
    .split("(")[0] // Remove ICP suffix
    .trim()
    .replace(/[-_\s]?\d+(\.\d+)?/g, "") // Remove version numbers (3.5, 4.0, etc.)
    .replace(/[-_](Turbo|Opus|Sonnet|Haiku|Pro|Ultra)/gi, "") // Remove variant suffixes
    .trim() || modelUsed;
}

/**
 * AI SEARCH METRICS
 */

/**
 * Get all AI mentions with rich context
 * Used for timeline, table, and detailed views
 */
export const getAIMentions = unstable_cache(
  async (projectId: string, filters: DashboardFilters = {}) => {
    const conditions: SQL[] = [eq(aiSearch.projectId, projectId)];

    // Date filtering
    if (filters.startDate && filters.endDate) {
      conditions.push(
        and(
          gte(aiSearch.createdAt, filters.startDate),
          lte(aiSearch.createdAt, filters.endDate)
        )!
      );
    } else {
      const cutoff = getDateRangeDate(filters.dateRange || "30d");
      conditions.push(gte(aiSearch.createdAt, cutoff)!);
    }

    // Keyword filter
    if (filters.keyword) {
      conditions.push(eq(aiSearch.keywordId, filters.keyword));
    }

    const mentions = await db.query.aiSearch.findMany({
      where: and(...conditions),
      orderBy: desc(aiSearch.createdAt),
      limit: 1000,
    });

    // Model filter - match by base model name (ignoring versions and ICP)
    if (filters.llmModel) {
      return mentions.filter((m) => extractBaseModelName(m.modelUsed) === filters.llmModel);
    }

    return mentions;
  },
  ["ai-mentions"],
  { revalidate: 300, tags: ["ai-search", "ai-monitoring"] }
);

/**
 * Get AI metrics by keyword
 * Returns: visibility %, avg rank, mention count, competitors
 */
export const getAIMetricsByKeyword = unstable_cache(
  async (projectId: string, keywordId: string, filters: DashboardFilters = {}) => {
    const conditions: SQL[] = [
      eq(aiSearch.projectId, projectId),
      eq(aiSearch.keywordId, keywordId),
    ];

    if (filters.startDate && filters.endDate) {
      conditions.push(
        and(
          gte(aiSearch.createdAt, filters.startDate),
          lte(aiSearch.createdAt, filters.endDate)
        )!
      );
    } else {
      const cutoff = getDateRangeDate(filters.dateRange || "30d");
      conditions.push(gte(aiSearch.createdAt, cutoff)!);
    }

    const mentions = await db.query.aiSearch.findMany({
      where: and(...conditions),
      orderBy: desc(aiSearch.createdAt),
    });

    const totalScans = mentions.length;
    const mentionedScans = mentions.filter((m) => m.isMentioned).length;
    const mentionedRanks = mentions
      .filter((m) => m.isMentioned && m.rank)
      .map((m) => m.rank as number);

    const avgRank =
      mentionedRanks.length > 0
        ? Math.round(
            (mentionedRanks.reduce((a, b) => a + b, 0) / mentionedRanks.length) *
              10
          ) / 10
        : 0;

    return {
      keyword: keywordId,
      totalScans,
      mentions: mentionedScans,
      visibilityRate: totalScans > 0 ? (mentionedScans / totalScans) * 100 : 0,
      avgRank,
      history: mentions.map((m) => ({
        date: m.createdAt?.toISOString().split("T")[0] || "",
        isMentioned: m.isMentioned || false,
        rank: m.rank || 0,
      })),
    };
  },
  ["ai-metrics-by-keyword"],
  { revalidate: 300, tags: ["ai-search", "ai-monitoring"] }
);

/**
 * Get AI metrics by model family
 * Returns: total scans, mention rate, avg rank by model
 * Aggregates across all versions of a model (e.g., all GPT versions)
 */
export const getAIMetricsByModel = unstable_cache(
  async (projectId: string, modelName: string, filters: DashboardFilters = {}) => {
    const conditions: SQL[] = [eq(aiSearch.projectId, projectId)];

    if (filters.startDate && filters.endDate) {
      conditions.push(
        and(
          gte(aiSearch.createdAt, filters.startDate),
          lte(aiSearch.createdAt, filters.endDate)
        )!
      );
    } else {
      const cutoff = getDateRangeDate(filters.dateRange || "30d");
      conditions.push(gte(aiSearch.createdAt, cutoff)!);
    }

    // Get all mentions and filter by model family
    const allMentions = await db.query.aiSearch.findMany({
      where: and(...conditions),
      orderBy: desc(aiSearch.createdAt),
    });

    // Filter by model family name
    const mentions = allMentions.filter((m) => extractBaseModelName(m.modelUsed) === modelName);

    const totalScans = mentions.length;
    const mentionedScans = mentions.filter((m) => m.isMentioned).length;
    const mentionedRanks = mentions
      .filter((m) => m.isMentioned && m.rank)
      .map((m) => m.rank as number);

    const avgRank =
      mentionedRanks.length > 0
        ? Math.round(
            (mentionedRanks.reduce((a, b) => a + b, 0) / mentionedRanks.length) *
              10
          ) / 10
        : 0;

    return {
      model: modelName,
      totalScans,
      mentions: mentionedScans,
      mentionRate: totalScans > 0 ? (mentionedScans / totalScans) * 100 : 0,
      avgRank,
    };
  },
  ["ai-metrics-by-model"],
  { revalidate: 300, tags: ["ai-search", "ai-monitoring"] }
);

/**
 * Get all model names and their stats
 * Aggregates by model family (e.g., all GPT versions → "GPT", all Claude versions → "Claude")
 * Removes ICP suffixes
 */
export const getAIModelBreakdown = unstable_cache(
  async (projectId: string, filters: DashboardFilters = {}) => {
    const conditions: SQL[] = [eq(aiSearch.projectId, projectId)];

    if (filters.startDate && filters.endDate) {
      conditions.push(
        and(
          gte(aiSearch.createdAt, filters.startDate),
          lte(aiSearch.createdAt, filters.endDate)
        )!
      );
    } else {
      const cutoff = getDateRangeDate(filters.dateRange || "30d");
      conditions.push(gte(aiSearch.createdAt, cutoff)!);
    }

    const allMentions = await db.query.aiSearch.findMany({
      where: and(...conditions),
      columns: {
        modelUsed: true,
        isMentioned: true,
      },
    });

    // Aggregate by model family (grouping versions)
    const modelMap = new Map<
      string,
      { total: number; mentioned: number }
    >();

    allMentions.forEach((mention) => {
      const modelName = extractBaseModelName(mention.modelUsed);

      if (!modelMap.has(modelName)) {
        modelMap.set(modelName, { total: 0, mentioned: 0 });
      }

      const stats = modelMap.get(modelName)!;
      stats.total++;
      if (mention.isMentioned) {
        stats.mentioned++;
      }
    });

    // Convert to array and sort by total
    return Array.from(modelMap.entries())
      .map(([name, stats]) => ({
        name,
        total: stats.total,
        mentioned: stats.mentioned,
        mentionRate: stats.total > 0 ? (stats.mentioned / stats.total) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  },
  ["ai-model-breakdown"],
  { revalidate: 300, tags: ["ai-search", "ai-monitoring"] }
);

/**
 * COMPETITOR ANALYSIS
 */

/**
 * Get all competitors mentioned in AI searches
 * Extracts domains from urlsFound
 */
export const getAICompetitorInsights = unstable_cache(
  async (projectId: string, filters: DashboardFilters = {}) => {
    const conditions: SQL[] = [eq(aiSearch.projectId, projectId)];

    if (filters.startDate && filters.endDate) {
      conditions.push(
        and(
          gte(aiSearch.createdAt, filters.startDate),
          lte(aiSearch.createdAt, filters.endDate)
        )!
      );
    } else {
      const cutoff = getDateRangeDate(filters.dateRange || "30d");
      conditions.push(gte(aiSearch.createdAt, cutoff)!);
    }

    const mentions = await db.query.aiSearch.findMany({
      where: and(...conditions),
    });

    // Extract competitors from urlsFound
    const competitorMap = new Map<
      string,
      { count: number; ranks: number[]; models: Set<string> }
    >();

    mentions.forEach((mention) => {
      const urls = mention.urlsFound as
        | Array<{ link?: string; rank?: number; title?: string } | string>
        | null;

      if (Array.isArray(urls)) {
        urls.forEach((url) => {
          try {
            const link = typeof url === "string" ? url : url?.link;
            if (!link) return;

            const hostname = new URL(link).hostname.replace("www.", "");
            const rank = typeof url === "object" ? url?.rank : 0;

            if (!competitorMap.has(hostname)) {
              competitorMap.set(hostname, {
                count: 0,
                ranks: [],
                models: new Set(),
              });
            }

            const comp = competitorMap.get(hostname)!;
            comp.count++;
            if (rank) comp.ranks.push(rank);
            if (mention.modelUsed) comp.models.add(mention.modelUsed);
          } catch {
            // Invalid URL
          }
        });
      }
    });

    return Array.from(competitorMap.entries())
      .map(([domain, data]) => ({
        domain,
        mentions: data.count,
        avgRank:
          data.ranks.length > 0
            ? Math.round(
                (data.ranks.reduce((a, b) => a + b, 0) / data.ranks.length) * 10
              ) / 10
            : 0,
        modelsFound: Array.from(data.models),
      }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 15);
  },
  ["ai-competitor-insights"],
  { revalidate: 300, tags: ["ai-search", "ai-monitoring"] }
);

/**
 * Get mentions for a specific competitor
 */
export const getAICompetitorMentions = unstable_cache(
  async (
    projectId: string,
    competitorDomain: string,
    filters: DashboardFilters = {}
  ) => {
    const conditions: SQL[] = [eq(aiSearch.projectId, projectId)];

    if (filters.startDate && filters.endDate) {
      conditions.push(
        and(
          gte(aiSearch.createdAt, filters.startDate),
          lte(aiSearch.createdAt, filters.endDate)
        )!
      );
    } else {
      const cutoff = getDateRangeDate(filters.dateRange || "30d");
      conditions.push(gte(aiSearch.createdAt, cutoff)!);
    }

    const mentions = await db.query.aiSearch.findMany({
      where: and(...conditions),
      orderBy: desc(aiSearch.createdAt),
    });

    // Filter mentions that contain this competitor
    return mentions.filter((mention) => {
      const urls = mention.urlsFound as
        | Array<{ link?: string } | string>
        | null;

      if (!Array.isArray(urls)) return false;

      return urls.some((url) => {
        try {
          const link = typeof url === "string" ? url : url?.link;
          if (!link) return false;
          const hostname = new URL(link).hostname.replace("www.", "");
          return hostname === competitorDomain.replace("www.", "");
        } catch {
          return false;
        }
      });
    });
  },
  ["ai-competitor-mentions"],
  { revalidate: 300, tags: ["ai-search", "ai-monitoring"] }
);

/**
 * TIMELINE & AGGREGATION
 */

/**
 * Get mention timeline (daily aggregation)
 */
export const getAIMentionTimeline = unstable_cache(
  async (projectId: string, filters: DashboardFilters = {}) => {
    const conditions: SQL[] = [eq(aiSearch.projectId, projectId)];

    if (filters.startDate && filters.endDate) {
      conditions.push(
        and(
          gte(aiSearch.createdAt, filters.startDate),
          lte(aiSearch.createdAt, filters.endDate)
        )!
      );
    } else {
      const cutoff = getDateRangeDate(filters.dateRange || "30d");
      conditions.push(gte(aiSearch.createdAt, cutoff)!);
    }

    if (filters.keyword) {
      conditions.push(eq(aiSearch.keywordId, filters.keyword));
    }

    const timeline = await db
      .select({
        date: sql<string>`DATE(${aiSearch.createdAt})`,
        total: dbCount(),
        mentioned: dbCount(sql`CASE WHEN ${aiSearch.isMentioned} = true THEN 1 END`),
      })
      .from(aiSearch)
      .where(and(...conditions))
      .groupBy(sql<string>`DATE(${aiSearch.createdAt})`)
      .orderBy(sql<string>`DATE(${aiSearch.createdAt})`);

    return timeline;
  },
  ["ai-mention-timeline"],
  { revalidate: 300, tags: ["ai-search", "ai-monitoring"] }
);

/**
 * OVERALL KPI METRICS
 */

/**
 * Get overall AI monitoring KPIs
 */
export const getAIMonitoringKPIs = unstable_cache(
  async (projectId: string, filters: DashboardFilters = {}) => {
    // Get all mentions for period
    const mentionsData = await getAIMentions(projectId, filters);
    const competitorData = await getAICompetitorInsights(projectId, filters);

    const totalScans = mentionsData.length;
    const totalMentions = mentionsData.filter((m) => m.isMentioned).length;
    const visibilityRate =
      totalScans > 0 ? (totalMentions / totalScans) * 100 : 0;

    const mentionedRanks = mentionsData
      .filter((m) => m.isMentioned && m.rank)
      .map((m) => m.rank as number);

    const avgRank =
      mentionedRanks.length > 0
        ? Math.round(
            (mentionedRanks.reduce((a, b) => a + b, 0) / mentionedRanks.length) *
              10
          ) / 10
        : 0;

    return {
      totalScans,
      totalMentions,
      visibilityRate: Math.round(visibilityRate * 10) / 10,
      avgRank,
      topCompetitors: competitorData.slice(0, 5),
    };
  },
  ["ai-monitoring-kpis"],
  { revalidate: 300, tags: ["ai-search", "ai-monitoring"] }
);

/**
 * ============================================
 * PROMPTS/QUERIES VIEW FUNCTIONS
 * ============================================
 */

/**
 * Get queries using a specific model
 */
export const getQueriesByModel = unstable_cache(
  async (projectId: string, modelName: string, filters: DashboardFilters = {}) => {
    const conditions: SQL[] = [eq(aiSearch.projectId, projectId)];

    if (filters.startDate && filters.endDate) {
      conditions.push(
        and(
          gte(aiSearch.createdAt, filters.startDate),
          lte(aiSearch.createdAt, filters.endDate)
        )!
      );
    } else {
      const cutoff = getDateRangeDate(filters.dateRange || "30d");
      conditions.push(gte(aiSearch.createdAt, cutoff)!);
    }

    const allMentions = await db.query.aiSearch.findMany({
      where: and(...conditions),
      orderBy: desc(aiSearch.createdAt),
    });

    return allMentions
      .filter((m) => extractBaseModelName(m.modelUsed) === modelName)
      .map((m) => ({
        id: m.id,
        query: m.query,
        rank: m.rank,
        mentioned: m.isMentioned,
        date: m.createdAt,
      }))
      .slice(0, 100);
  },
  ["queries-by-model"],
  { revalidate: 300, tags: ["ai-search", "ai-monitoring"] }
);

/**
 * Get detailed context for a specific query
 */
export const getQueryDetail = unstable_cache(
  async (projectId: string, queryId: string) => {
    const mention = await db.query.aiSearch.findFirst({
      where: and(eq(aiSearch.projectId, projectId), eq(aiSearch.id, queryId)),
    });

    if (!mention) return null;

    const urls = mention.urlsFound as
      | Array<{ link?: string; rank?: number; title?: string } | string>
      | null;

    const extractedUrls = Array.isArray(urls)
      ? urls.map((url) => {
          if (typeof url === "string") {
            return { link: url, rank: 0, title: "" };
          }
          return {
            link: url?.link || "",
            rank: url?.rank || 0,
            title: url?.title || "",
          };
        })
      : [];

    // Extract competitors
    const competitors = new Set<string>();
    extractedUrls.forEach((url) => {
      try {
        const hostname = new URL(url.link).hostname.replace("www.", "");
        competitors.add(hostname);
      } catch {
        // Invalid URL
      }
    });

    return {
      id: mention.id,
      query: mention.query,
      response: mention.response,
      model: extractBaseModelName(mention.modelUsed),
      rank: mention.rank,
      mentioned: mention.isMentioned,
      date: mention.createdAt,
      urls: extractedUrls,
      competitors: Array.from(competitors),
    };
  },
  ["query-detail"],
  { revalidate: 300, tags: ["ai-search", "ai-monitoring"] }
);

/**
 * Get all queries/prompts with pagination
 * Supports multi-model filtering via llmModels array
 */
export const getAllQueries = unstable_cache(
  async (projectId: string, filters: DashboardFilters = {}, limit = 100, offset = 0) => {
    const conditions: SQL[] = [eq(aiSearch.projectId, projectId)];

    if (filters.startDate && filters.endDate) {
      conditions.push(
        and(
          gte(aiSearch.createdAt, filters.startDate),
          lte(aiSearch.createdAt, filters.endDate)
        )!
      );
    } else {
      const cutoff = getDateRangeDate(filters.dateRange || "30d");
      conditions.push(gte(aiSearch.createdAt, cutoff)!);
    }

    const mentions = await db.query.aiSearch.findMany({
      where: and(...conditions),
      orderBy: desc(aiSearch.createdAt),
      limit: limit + offset + 1, // Fetch extra to check for more
    });

    // Filter by models if specified (supports both single and multi-select)
    let filteredMentions = mentions;
    const selectedModels = filters.llmModels || (filters.llmModel ? [filters.llmModel] : null);

    if (selectedModels && selectedModels.length > 0) {
      filteredMentions = mentions.filter((m) =>
        selectedModels.includes(extractBaseModelName(m.modelUsed))
      );
    }

    // Apply offset and limit
    const paginatedMentions = filteredMentions.slice(offset, offset + limit);
    const hasMore = filteredMentions.length > offset + limit;

    return {
      queries: paginatedMentions.map((m) => ({
        id: m.id,
        query: m.query,
        model: extractBaseModelName(m.modelUsed),
        rank: m.rank,
        mentioned: m.isMentioned,
        date: m.createdAt,
      })),
      hasMore,
      total: filteredMentions.length,
    };
  },
  ["all-queries"],
  { revalidate: 300, tags: ["ai-search", "ai-monitoring"] }
);


