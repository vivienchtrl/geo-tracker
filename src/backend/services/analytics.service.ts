import { db } from "@/backend/db/db";
import {
  pageVisits,
  aiSearch,
} from "@/backend/db/tables/schema";
import { eq, and, gte, lte, sql, desc, inArray, isNull, ilike, SQL } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { DashboardFilters, getDateRangeDate } from "@/types/dashboard";

/**
 * Analytics Service
 * 
 * Purpose: Provide aggregated data for dashboard charts and metrics.
 * Strategy: Leverage pre-aggregated tables where possible, fallback to raw page_visits for granular data.
 */

// Helper to build common filters
const buildCommonFilters = (projectId: string, filters: DashboardFilters, table: typeof pageVisits | typeof aiSearch) => {
  const conditions: SQL[] = [eq(table.projectId, projectId)];

  // Date Range
  if (filters.startDate && filters.endDate) {
    conditions.push(and(gte(table.createdAt, filters.startDate), lte(table.createdAt, filters.endDate))!);
  } else {
    const cutoff = getDateRangeDate(filters.dateRange || '30d');
    conditions.push(gte(table.createdAt, cutoff)!);
  }

  return conditions;
};

// Helper to build traffic specific filters
const buildTrafficFilters = (filters: DashboardFilters) => {
  const conditions: SQL[] = [isNull(pageVisits.isBot)];

  if (filters.device) {
    conditions.push(eq(pageVisits.deviceType, filters.device));
  }
  if (filters.country) {
    conditions.push(eq(pageVisits.countryCode, filters.country));
  }
  if (filters.referrer) {
    conditions.push(ilike(pageVisits.referrerDomain, `%${filters.referrer}%`));
  }
  if (filters.utmCampaign) {
    conditions.push(eq(pageVisits.utmCampaign, filters.utmCampaign));
  }

  return conditions;
};

// Helper to build AI specific filters
const buildAiFilters = (filters: DashboardFilters) => {
  const conditions: SQL[] = [];

  if (filters.llmModel) {
    conditions.push(ilike(aiSearch.modelUsed, `%${filters.llmModel}%`));
  }
  if (filters.searchQuery) {
    conditions.push(ilike(aiSearch.query, `%${filters.searchQuery}%`));
  }

  return conditions;
};

/**
 * Get Traffic breakdown by Device Type
 */
export const getTrafficByDevice = async (projectId: string, filters: DashboardFilters) => {
  const cacheKey = `traffic-by-device-${projectId}-${JSON.stringify(filters)}`;
  
  return await unstable_cache(
    async () => {
      const conditions = [
        ...buildCommonFilters(projectId, filters, pageVisits),
        ...buildTrafficFilters(filters)
      ];

      return await db
        .select({
          deviceType: pageVisits.deviceType,
          count: sql<number>`COUNT(*)`,
        })
        .from(pageVisits)
        .where(and(...conditions))
        .groupBy(pageVisits.deviceType)
        .orderBy(desc(sql<number>`COUNT(*)`));
    },
    [cacheKey],
    { revalidate: 3600, tags: [`analytics-${projectId}`, "page-visits"] }
  )();
};

/**
 * Get Traffic breakdown by Location (Country, Region, City)
 */
export const getTrafficByLocation = async (projectId: string, type: "country" | "region" | "city" = "country", filters: DashboardFilters) => {
  const cacheKey = `traffic-by-location-${type}-${projectId}-${JSON.stringify(filters)}`;

  return await unstable_cache(
    async () => {
      const conditions = [
        ...buildCommonFilters(projectId, filters, pageVisits),
        ...buildTrafficFilters(filters)
      ];

      const column = type === "country" ? pageVisits.country : type === "region" ? pageVisits.region : pageVisits.city;
      const codeColumn = type === "country" ? pageVisits.countryCode : null;

      return await db
        .select({
          name: column,
          ...(codeColumn ? { code: codeColumn } : {}),
          count: sql<number>`COUNT(*)`,
        })
        .from(pageVisits)
        .where(and(...conditions))
        .groupBy(column, ...(codeColumn ? [codeColumn] : []))
        .orderBy(desc(sql<number>`COUNT(*)`))
        .limit(10);
    },
    [cacheKey],
    { revalidate: 3600, tags: [`analytics-${projectId}`, "page-visits"] }
  )();
};

/**
 * Get Traffic breakdown by Referrer/Source
 */
export const getTrafficByReferrer = async (projectId: string, filters: DashboardFilters) => {
  const cacheKey = `traffic-by-referrer-${projectId}-${JSON.stringify(filters)}`;

  return await unstable_cache(
    async () => {
      const conditions = [
        ...buildCommonFilters(projectId, filters, pageVisits),
        ...buildTrafficFilters(filters)
      ];

      return await db
        .select({
          referrer: pageVisits.referrerDomain,
          count: sql<number>`COUNT(*)`,
        })
        .from(pageVisits)
        .where(and(...conditions))
        .groupBy(pageVisits.referrerDomain)
        .orderBy(desc(sql<number>`COUNT(*)`))
        .limit(10);
    },
    [cacheKey],
    { revalidate: 3600, tags: [`analytics-${projectId}`, "page-visits"] }
  )();
};

/**
 * Get AI Bot Activity (Crawl Frequency)
 */
export const getBotActivity = async (projectId: string, filters: DashboardFilters) => {
  const cacheKey = `bot-activity-${projectId}-${JSON.stringify(filters)}`;

  return await unstable_cache(
    async () => {
      // Bot activity ignores 'isBot' filter from buildTrafficFilters because we WANT bots here
      const commonConditions = buildCommonFilters(projectId, filters, pageVisits);
      
      const conditions = [
        ...commonConditions,
        sql`${pageVisits.isBot} IS NOT NULL`
      ];

      return await db
        .select({
          botName: pageVisits.botName,
          botType: pageVisits.isBot,
          count: sql<number>`COUNT(*)`,
        })
        .from(pageVisits)
        .where(and(...conditions))
        .groupBy(pageVisits.botName, pageVisits.isBot)
        .orderBy(desc(sql<number>`COUNT(*)`));
    },
    [cacheKey],
    { revalidate: 3600, tags: [`analytics-${projectId}`, "page-visits"] }
  )();
};

/**
 * Get Traffic breakdown by Social Channel
 */
export const getTrafficBySocial = async (projectId: string, filters: DashboardFilters) => {
  const cacheKey = `traffic-by-social-${projectId}-${JSON.stringify(filters)}`;

  return await unstable_cache(
    async () => {
      const conditions = [
        ...buildCommonFilters(projectId, filters, pageVisits),
        ...buildTrafficFilters(filters)
      ];

      const socialPatterns = [
        't.co', 'twitter.com', 'x.com', 
        'facebook.com', 'fb.me',
        'linkedin.com', 'lnkd.in',
        'instagram.com',
        'reddit.com',
        'youtube.com',
        'tiktok.com',
        'pinterest.com',
        'threads.net'
      ];

      conditions.push(inArray(pageVisits.referrerDomain, socialPatterns));

      return await db
        .select({
          referrer: pageVisits.referrerDomain,
          count: sql<number>`COUNT(*)`,
        })
        .from(pageVisits)
        .where(and(...conditions))
        .groupBy(pageVisits.referrerDomain)
        .orderBy(desc(sql<number>`COUNT(*)`));
    },
    [cacheKey],
    { revalidate: 3600, tags: [`analytics-${projectId}`, "page-visits"] }
  )();
};

/**
 * Get AI Search Mention Stats (Mentions over time, Sentiment)
 */
export const getAISearchStats = async (projectId: string, filters: DashboardFilters) => {
  const cacheKey = `ai-search-stats-${projectId}-${JSON.stringify(filters)}`;

  return await unstable_cache(
    async () => {
      const conditions = [
        ...buildCommonFilters(projectId, filters, aiSearch),
        ...buildAiFilters(filters)
      ];

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
