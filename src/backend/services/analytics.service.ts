import { db } from "@/backend/db/db";
import { aiSearch, crawlerVisits } from "@/backend/db/tables/schema";
import { eq, and, gte, lte, sql, desc, ilike, SQL } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { DashboardFilters, getDateRangeDate } from "@/types/dashboard";

/**
 * Analytics Service
 *
 * Purpose: Provide aggregated data for dashboard charts and metrics.
 * Uses crawler_visits for bot/AI tracking and ai_search for mention tracking.
 */

// Helper to build common filters for crawler visits
const buildCrawlerFilters = (projectId: string, filters: DashboardFilters) => {
  const conditions: SQL[] = [eq(crawlerVisits.projectId, projectId)];

  if (filters.startDate && filters.endDate) {
    conditions.push(and(gte(crawlerVisits.timestamp, filters.startDate), lte(crawlerVisits.timestamp, filters.endDate))!);
  } else {
    const cutoff = getDateRangeDate(filters.dateRange || '30d');
    conditions.push(gte(crawlerVisits.timestamp, cutoff)!);
  }

  return conditions;
};

// Helper to build AI search filters
const buildAiFilters = (projectId: string, filters: DashboardFilters) => {
  const conditions: SQL[] = [eq(aiSearch.projectId, projectId)];

  if (filters.startDate && filters.endDate) {
    conditions.push(and(gte(aiSearch.createdAt, filters.startDate), lte(aiSearch.createdAt, filters.endDate))!);
  } else {
    const cutoff = getDateRangeDate(filters.dateRange || '30d');
    conditions.push(gte(aiSearch.createdAt, cutoff)!);
  }

  if (filters.llmModel) {
    conditions.push(ilike(aiSearch.modelUsed, `%${filters.llmModel}%`));
  }
  if (filters.searchQuery) {
    conditions.push(ilike(aiSearch.query, `%${filters.searchQuery}%`));
  }

  return conditions;
};

/**
 * Get Traffic breakdown by Bot Category (device type equivalent)
 */
export const getTrafficByDevice = async (projectId: string, filters: DashboardFilters) => {
  const cacheKey = `traffic-by-device-${projectId}-${JSON.stringify(filters)}`;

  return await unstable_cache(
    async () => {
      const conditions = buildCrawlerFilters(projectId, filters);

      return await db
        .select({
          deviceType: crawlerVisits.botCategory,
          count: sql<number>`COUNT(*)`,
        })
        .from(crawlerVisits)
        .where(and(...conditions))
        .groupBy(crawlerVisits.botCategory)
        .orderBy(desc(sql<number>`COUNT(*)`));
    },
    [cacheKey],
    { revalidate: 3600, tags: [`analytics-${projectId}`, "crawler-visits"] }
  )();
};

/**
 * Get Traffic breakdown by Path (referrer equivalent)
 */
export const getTrafficByReferrer = async (projectId: string, filters: DashboardFilters) => {
  const cacheKey = `traffic-by-referrer-${projectId}-${JSON.stringify(filters)}`;

  return await unstable_cache(
    async () => {
      const conditions = buildCrawlerFilters(projectId, filters);

      return await db
        .select({
          referrer: crawlerVisits.path,
          count: sql<number>`COUNT(*)`,
        })
        .from(crawlerVisits)
        .where(and(...conditions))
        .groupBy(crawlerVisits.path)
        .orderBy(desc(sql<number>`COUNT(*)`))
        .limit(10);
    },
    [cacheKey],
    { revalidate: 3600, tags: [`analytics-${projectId}`, "crawler-visits"] }
  )();
};

/**
 * Get AI Bot Activity (Crawl Frequency)
 */
export const getBotActivity = async (projectId: string, filters: DashboardFilters) => {
  const cacheKey = `bot-activity-${projectId}-${JSON.stringify(filters)}`;

  return await unstable_cache(
    async () => {
      const conditions = buildCrawlerFilters(projectId, filters);

      return await db
        .select({
          botName: crawlerVisits.botName,
          botType: crawlerVisits.botCategory,
          count: sql<number>`COUNT(*)`,
        })
        .from(crawlerVisits)
        .where(and(...conditions))
        .groupBy(crawlerVisits.botName, crawlerVisits.botCategory)
        .orderBy(desc(sql<number>`COUNT(*)`));
    },
    [cacheKey],
    { revalidate: 3600, tags: [`analytics-${projectId}`, "crawler-visits"] }
  )();
};

/**
 * Get Traffic breakdown by Source (integration source)
 */
export const getTrafficBySocial = async (projectId: string, filters: DashboardFilters) => {
  const cacheKey = `traffic-by-social-${projectId}-${JSON.stringify(filters)}`;

  return await unstable_cache(
    async () => {
      const conditions = buildCrawlerFilters(projectId, filters);

      return await db
        .select({
          referrer: crawlerVisits.source,
          count: sql<number>`COUNT(*)`,
        })
        .from(crawlerVisits)
        .where(and(...conditions))
        .groupBy(crawlerVisits.source)
        .orderBy(desc(sql<number>`COUNT(*)`));
    },
    [cacheKey],
    { revalidate: 3600, tags: [`analytics-${projectId}`, "crawler-visits"] }
  )();
};

/**
 * Get AI Search Mention Stats (Mentions over time)
 */
export const getAISearchStats = async (projectId: string, filters: DashboardFilters) => {
  const cacheKey = `ai-search-stats-${projectId}-${JSON.stringify(filters)}`;

  return await unstable_cache(
    async () => {
      const conditions = buildAiFilters(projectId, filters);

      const mentions = await db
        .select({
          date: sql<string>`DATE(${aiSearch.createdAt})`,
          count: sql<number>`COUNT(*)`,
          mentionedCount: sql<number>`COUNT(*) FILTER (WHERE ${aiSearch.isMentioned} = true)`,
        })
        .from(aiSearch)
        .where(and(...conditions))
        .groupBy(sql<string>`DATE(${aiSearch.createdAt})`)
        .orderBy(sql<string>`DATE(${aiSearch.createdAt})`);

      return {
        mentions,
      };
    },
    [cacheKey],
    { revalidate: 3600, tags: [`analytics-${projectId}`, "ai-search"] }
  )();
};
