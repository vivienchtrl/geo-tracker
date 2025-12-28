/**
 * Crawler Visits Service
 *
 * Operations for storing and querying crawler visit logs
 * Used by the API endpoint and dashboard
 */

import { db } from "@/backend/db/db";
import { crawlerVisits } from "@/backend/db/tables/crawler-visits";
import { eq, and, gte, lte, desc, sql, count as dbCount } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { hashIpAddress } from "@/lib/crypto/api-key";
import type { CrawlerVisitInput } from "@/backend/validators/crawler-visits.validators";

/**
 * Auto-detect bot category from bot name
 */
function detectBotCategory(botName: string): string {
  const aiCrawlers = [
    "GPTBot",
    "ClaudeBot",
    "PerplexityBot",
    "ChatGPT-User",
    "Anthropic",
    "Cohere",
    "Googlebot-Extended",
  ];
  const searchEngines = ["Googlebot", "Bingbot", "DuckDuckBot", "YandexBot"];
  const socialCrawlers = ["Twitterbot", "facebookexternalhit", "LinkedInBot"];

  const lowerName = botName.toLowerCase();

  if (aiCrawlers.some((b) => lowerName.includes(b.toLowerCase()))) {
    return "ai_crawler";
  }
  if (searchEngines.some((b) => lowerName.includes(b.toLowerCase()))) {
    return "search_engine";
  }
  if (socialCrawlers.some((b) => lowerName.includes(b.toLowerCase()))) {
    return "social_crawler";
  }

  return "other";
}

/**
 * Insert a new crawler visit log
 * Called by the API endpoint
 */
export async function captureCrawlerVisit(
  projectId: string,
  data: CrawlerVisitInput
) {
  const ipHash = data.ipAddress
    ? hashIpAddress(data.ipAddress)
    : "unknown";

  const botCategory = data.botCategory || detectBotCategory(data.botName);

  await db.insert(crawlerVisits).values({
    projectId,
    botName: data.botName,
    botCategory: botCategory as "ai_crawler" | "search_engine" | "social_crawler" | "monitoring" | "other",
    userAgent: data.userAgent,
    path: data.path,
    method: data.method || "GET",
    responseStatus: data.responseStatus,
    responseTime: data.responseTime,
    ipHash,
    countryCode: data.countryCode,
    country: data.country,
    region: data.region,
    city: data.city,
    headers: data.headers,
    requestBody: data.requestBody?.slice(0, 1000),
    responseBodySnippet: data.responseBodySnippet?.slice(0, 2000),
    siteMentioned: data.siteMentioned || false,
    mentionContext: data.mentionContext?.slice(0, 500),
    source: data.source || "cloudflare",
    timestamp: new Date(data.timestamp),
  });
}

/**
 * Get crawler visits for a project with pagination
 */
export const getCrawlerVisits = unstable_cache(
  async (
    projectId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      botName?: string;
      botCategory?: string;
      limit?: number;
      offset?: number;
    } = {}
  ) => {
    const { startDate, endDate, botName, botCategory, limit = 20, offset = 0 } = options;

    const conditions = [eq(crawlerVisits.projectId, projectId)];

    if (startDate) {
      conditions.push(gte(crawlerVisits.timestamp, startDate));
    }
    if (endDate) {
      conditions.push(lte(crawlerVisits.timestamp, endDate));
    }
    if (botName) {
      conditions.push(eq(crawlerVisits.botName, botName));
    }
    if (botCategory) {
      conditions.push(eq(crawlerVisits.botCategory, botCategory as "ai_crawler" | "search_engine" | "social_crawler" | "monitoring" | "other"));
    }

    const visits = await db.query.crawlerVisits.findMany({
      where: and(...conditions),
      orderBy: [desc(crawlerVisits.timestamp)],
      limit: limit + 1, // Fetch one extra to check for more
      offset,
    });

    const hasMore = visits.length > limit;
    const data = hasMore ? visits.slice(0, limit) : visits;

    return {
      visits: data,
      hasMore,
    };
  },
  ["crawler-visits"],
  { revalidate: 60, tags: ["crawler-visits"] }
);

/**
 * Get KPIs for the crawler dashboard
 */
export const getCrawlerKPIs = unstable_cache(
  async (
    projectId: string,
    options: { startDate?: Date; endDate?: Date } = {}
  ) => {
    const { startDate, endDate } = options;

    const conditions = [eq(crawlerVisits.projectId, projectId)];

    // Default to last 30 days if no dates provided
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    if (startDate) {
      conditions.push(gte(crawlerVisits.timestamp, startDate));
    } else {
      conditions.push(gte(crawlerVisits.timestamp, defaultStartDate));
    }

    if (endDate) {
      conditions.push(lte(crawlerVisits.timestamp, endDate));
    }

    const visits = await db.query.crawlerVisits.findMany({
      where: and(...conditions),
      columns: {
        id: true,
        botName: true,
        path: true,
        responseTime: true,
        siteMentioned: true,
      },
    });

    const totalVisits = visits.length;
    const uniqueBots = new Set(visits.map((v) => v.botName)).size;
    const uniquePaths = new Set(visits.map((v) => v.path)).size;
    const siteMentions = visits.filter((v) => v.siteMentioned).length;

    const responseTimes = visits
      .filter((v) => v.responseTime !== null)
      .map((v) => v.responseTime as number);
    const avgResponseTime =
      responseTimes.length > 0
        ? Math.round(
            responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          )
        : 0;

    return {
      totalVisits,
      uniqueBots,
      uniquePaths,
      siteMentions,
      avgResponseTime,
    };
  },
  ["crawler-kpis"],
  { revalidate: 300, tags: ["crawler-visits"] }
);

/**
 * Get timeline data for the chart
 */
export const getCrawlerTimeline = unstable_cache(
  async (
    projectId: string,
    options: { startDate?: Date; endDate?: Date } = {}
  ) => {
    const { startDate, endDate } = options;

    const conditions = [eq(crawlerVisits.projectId, projectId)];

    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    if (startDate) {
      conditions.push(gte(crawlerVisits.timestamp, startDate));
    } else {
      conditions.push(gte(crawlerVisits.timestamp, defaultStartDate));
    }

    if (endDate) {
      conditions.push(lte(crawlerVisits.timestamp, endDate));
    }

    const timeline = await db
      .select({
        date: sql<string>`DATE(${crawlerVisits.timestamp})`,
        total: dbCount(),
        aiCrawlers: dbCount(
          sql`CASE WHEN ${crawlerVisits.botCategory} = 'ai_crawler' THEN 1 END`
        ),
        mentioned: dbCount(
          sql`CASE WHEN ${crawlerVisits.siteMentioned} = true THEN 1 END`
        ),
      })
      .from(crawlerVisits)
      .where(and(...conditions))
      .groupBy(sql`DATE(${crawlerVisits.timestamp})`)
      .orderBy(sql`DATE(${crawlerVisits.timestamp})`);

    return timeline;
  },
  ["crawler-timeline"],
  { revalidate: 300, tags: ["crawler-visits"] }
);

/**
 * Get bot breakdown for the pie chart
 */
export const getBotBreakdown = unstable_cache(
  async (
    projectId: string,
    options: { startDate?: Date; endDate?: Date } = {}
  ) => {
    const { startDate, endDate } = options;

    const conditions = [eq(crawlerVisits.projectId, projectId)];

    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    if (startDate) {
      conditions.push(gte(crawlerVisits.timestamp, startDate));
    } else {
      conditions.push(gte(crawlerVisits.timestamp, defaultStartDate));
    }

    if (endDate) {
      conditions.push(lte(crawlerVisits.timestamp, endDate));
    }

    const breakdown = await db
      .select({
        botName: crawlerVisits.botName,
        count: dbCount(),
      })
      .from(crawlerVisits)
      .where(and(...conditions))
      .groupBy(crawlerVisits.botName)
      .orderBy(desc(dbCount()));

    return breakdown;
  },
  ["crawler-breakdown"],
  { revalidate: 300, tags: ["crawler-visits"] }
);

/**
 * Get a single crawler visit by ID
 */
export async function getCrawlerVisitById(projectId: string, visitId: string) {
  return await db.query.crawlerVisits.findFirst({
    where: and(
      eq(crawlerVisits.projectId, projectId),
      eq(crawlerVisits.id, visitId)
    ),
  });
}
