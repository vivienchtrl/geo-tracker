import { db } from "@/backend/db/db";
import {
  pageVisits,
  aiSearch,
} from "@/backend/db/tables/schema";
import { eq, and, gte, sql, desc, inArray, isNull } from "drizzle-orm";
import { unstable_cache } from "next/cache";

/**
 * Analytics Service
 * 
 * Purpose: Provide aggregated data for dashboard charts and metrics.
 * Strategy: Leverage pre-aggregated tables where possible, fallback to raw page_visits for granular data.
 */

/**
 * Get Traffic breakdown by Device Type
 */
export const getTrafficByDevice = async (projectId: string, days = 30) => {
  return await unstable_cache(
    async () => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);

      return await db
        .select({
          deviceType: pageVisits.deviceType,
          count: sql<number>`COUNT(*)`,
        })
        .from(pageVisits)
        .where(
          and(
            eq(pageVisits.projectId, projectId),
            gte(pageVisits.createdAt, cutoff),
            isNull(pageVisits.isBot) // Only human traffic
          )
        )
        .groupBy(pageVisits.deviceType)
        .orderBy(desc(sql<number>`COUNT(*)`));
    },
    [`traffic-by-device-${projectId}-${days}`],
    { revalidate: 3600, tags: [`analytics-${projectId}`, "page-visits"] }
  )();
};

/**
 * Get Traffic breakdown by Location (Country, Region, City)
 */
export const getTrafficByLocation = async (projectId: string, type: "country" | "region" | "city" = "country", days = 30) => {
  return await unstable_cache(
    async () => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);

      const column = type === "country" ? pageVisits.country : type === "region" ? pageVisits.region : pageVisits.city;
      const codeColumn = type === "country" ? pageVisits.countryCode : null;

      return await db
        .select({
          name: column,
          ...(codeColumn ? { code: codeColumn } : {}),
          count: sql<number>`COUNT(*)`,
        })
        .from(pageVisits)
        .where(
          and(
            eq(pageVisits.projectId, projectId),
            gte(pageVisits.createdAt, cutoff),
            isNull(pageVisits.isBot)
          )
        )
        .groupBy(column, ...(codeColumn ? [codeColumn] : []))
        .orderBy(desc(sql<number>`COUNT(*)`))
        .limit(10);
    },
    [`traffic-by-location-${type}-${projectId}-${days}`],
    { revalidate: 3600, tags: [`analytics-${projectId}`, "page-visits"] }
  )();
};

/**
 * Get Traffic breakdown by Referrer/Source
 */
export const getTrafficByReferrer = async (projectId: string, days = 30) => {
  return await unstable_cache(
    async () => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);

      return await db
        .select({
          referrer: pageVisits.referrerDomain,
          count: sql<number>`COUNT(*)`,
        })
        .from(pageVisits)
        .where(
          and(
            eq(pageVisits.projectId, projectId),
            gte(pageVisits.createdAt, cutoff),
            isNull(pageVisits.isBot)
          )
        )
        .groupBy(pageVisits.referrerDomain)
        .orderBy(desc(sql<number>`COUNT(*)`))
        .limit(10);
    },
    [`traffic-by-referrer-${projectId}-${days}`],
    { revalidate: 3600, tags: [`analytics-${projectId}`, "page-visits"] }
  )();
};

/**
 * Get AI Bot Activity (Crawl Frequency)
 */
export const getBotActivity = async (projectId: string, days = 30) => {
  return await unstable_cache(
    async () => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);

      return await db
        .select({
          botName: pageVisits.botName,
          botType: pageVisits.isBot,
          count: sql<number>`COUNT(*)`,
        })
        .from(pageVisits)
        .where(
          and(
            eq(pageVisits.projectId, projectId),
            gte(pageVisits.createdAt, cutoff),
            sql`${pageVisits.isBot} IS NOT NULL`
          )
        )
        .groupBy(pageVisits.botName, pageVisits.isBot)
        .orderBy(desc(sql<number>`COUNT(*)`));
    },
    [`bot-activity-${projectId}-${days}`],
    { revalidate: 3600, tags: [`analytics-${projectId}`, "page-visits"] }
  )();
};

/**
 * Get Traffic breakdown by Social Channel
 */
export const getTrafficBySocial = async (projectId: string, days = 30) => {
  return await unstable_cache(
    async () => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);

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

      return await db
        .select({
          referrer: pageVisits.referrerDomain,
          count: sql<number>`COUNT(*)`,
        })
        .from(pageVisits)
        .where(
          and(
            eq(pageVisits.projectId, projectId),
            gte(pageVisits.createdAt, cutoff),
            isNull(pageVisits.isBot),
            inArray(pageVisits.referrerDomain, socialPatterns)
          )
        )
        .groupBy(pageVisits.referrerDomain)
        .orderBy(desc(sql<number>`COUNT(*)`));
    },
    [`traffic-by-social-${projectId}-${days}`],
    { revalidate: 3600, tags: [`analytics-${projectId}`, "page-visits"] }
  )();
};

/**
 * Get AI Search Mention Stats (Mentions over time, Sentiment)
 */
export const getAISearchStats = async (projectId: string, days = 30) => {
  return await unstable_cache(
    async () => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);

      const mentions = await db
        .select({
          date: sql<string>`DATE(${aiSearch.createdAt})`,
          count: sql<number>`COUNT(*)`,
          mentionedCount: sql<number>`COUNT(*) FILTER (WHERE ${aiSearch.isMentioned} = true)`,
        })
        .from(aiSearch)
        .where(
          and(
            eq(aiSearch.projectId, projectId),
            gte(aiSearch.createdAt, cutoff)
          )
        )
        .groupBy(sql<string>`DATE(${aiSearch.createdAt})`)
        .orderBy(sql<string>`DATE(${aiSearch.createdAt})`);

      const sentiment = await db
        .select({
          label: aiSearch.sentimentLabel,
          count: sql<number>`COUNT(*)`,
        })
        .from(aiSearch)
        .where(
          and(
            eq(aiSearch.projectId, projectId),
            gte(aiSearch.createdAt, cutoff)
          )
        )
        .groupBy(aiSearch.sentimentLabel);

      return {
        mentions,
        sentiment,
      };
    },
    [`ai-search-stats-${projectId}-${days}`],
    { revalidate: 3600, tags: [`analytics-${projectId}`, "ai-search"] }
  )();
};

