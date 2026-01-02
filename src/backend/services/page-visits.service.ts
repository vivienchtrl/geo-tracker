/**
 * Page Visits Service (Human Traffic)
 *
 * Operations for storing and querying human visitor page views
 * Used by the API endpoint and dashboard
 */

import { db } from "@/backend/db/db";
import { pageVisits } from "@/backend/db/tables/page-visits";
import { eq, and, gte, lte, desc, sql, count as dbCount } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { hashIpAddress } from "@/lib/crypto/api-key";
import type { PageVisitInput } from "@/backend/validators/page-visits.validators";

/**
 * Parse User-Agent to extract device info
 */
function parseUserAgent(userAgent: string): {
  deviceType: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
} {
  const ua = userAgent.toLowerCase();

  // Device type detection
  let deviceType = "desktop";
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) {
    deviceType = "mobile";
  } else if (/ipad|tablet|playbook|silk/i.test(ua)) {
    deviceType = "tablet";
  }

  // Browser detection
  let browser = "unknown";
  let browserVersion = "";
  if (ua.includes("chrome") && !ua.includes("edg")) {
    browser = "Chrome";
    browserVersion = ua.match(/chrome\/(\d+)/)?.[1] || "";
  } else if (ua.includes("firefox")) {
    browser = "Firefox";
    browserVersion = ua.match(/firefox\/(\d+)/)?.[1] || "";
  } else if (ua.includes("safari") && !ua.includes("chrome")) {
    browser = "Safari";
    browserVersion = ua.match(/version\/(\d+)/)?.[1] || "";
  } else if (ua.includes("edg")) {
    browser = "Edge";
    browserVersion = ua.match(/edg\/(\d+)/)?.[1] || "";
  }

  // OS detection
  let os = "unknown";
  let osVersion = "";
  if (ua.includes("windows")) {
    os = "Windows";
    osVersion = ua.match(/windows nt (\d+\.\d+)/)?.[1] || "";
  } else if (ua.includes("mac os")) {
    os = "macOS";
    osVersion = ua.match(/mac os x (\d+[._]\d+)/)?.[1]?.replace("_", ".") || "";
  } else if (ua.includes("iphone") || ua.includes("ipad")) {
    os = "iOS";
    osVersion = ua.match(/os (\d+[._]\d+)/)?.[1]?.replace("_", ".") || "";
  } else if (ua.includes("android")) {
    os = "Android";
    osVersion = ua.match(/android (\d+\.?\d*)/)?.[1] || "";
  } else if (ua.includes("linux")) {
    os = "Linux";
  }

  return { deviceType, browser, browserVersion, os, osVersion };
}

/**
 * Extract domain from referrer URL
 */
function extractReferrerDomain(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    return url.hostname.replace("www.", "");
  } catch {
    return null;
  }
}

/**
 * Insert a new page visit log
 * Called by the API endpoint
 */
export async function capturePageVisit(
  projectId: string,
  data: PageVisitInput
) {
  const ipHash = data.ipAddress ? hashIpAddress(data.ipAddress) : "unknown";
  const uaInfo = parseUserAgent(data.userAgent || "");
  const referrerDomain = extractReferrerDomain(data.referrer || null);

  await db.insert(pageVisits).values({
    projectId,
    visitorId: data.visitorId,
    sessionId: data.sessionId,
    ipHash,
    path: data.path,
    url: data.url,
    title: data.title,
    referrer: data.referrer,
    referrerDomain,
    utmSource: data.utmSource,
    utmMedium: data.utmMedium,
    utmCampaign: data.utmCampaign,
    utmTerm: data.utmTerm,
    utmContent: data.utmContent,
    deviceType: data.deviceType || uaInfo.deviceType,
    browser: data.browser || uaInfo.browser,
    browserVersion: data.browserVersion || uaInfo.browserVersion,
    os: data.os || uaInfo.os,
    osVersion: data.osVersion || uaInfo.osVersion,
    screenWidth: data.screenWidth,
    screenHeight: data.screenHeight,
    countryCode: data.countryCode,
    country: data.country,
    region: data.region,
    city: data.city,
    loadTime: data.loadTime,
    timeOnPage: data.timeOnPage,
    eventType: data.eventType || "pageview",
    eventData: data.eventData,
    userAgent: data.userAgent?.slice(0, 2048),
    source: data.source || "cloudflare",
    timestamp: new Date(data.timestamp),
  });
}

/**
 * Get page visits for a project with pagination
 */
export const getPageVisits = unstable_cache(
  async (
    projectId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      device?: string;
      country?: string;
      referrer?: string;
      limit?: number;
      offset?: number;
    } = {}
  ) => {
    const { startDate, endDate, device, country, referrer, limit = 20, offset = 0 } = options;

    const conditions = [eq(pageVisits.projectId, projectId)];

    if (startDate) {
      conditions.push(gte(pageVisits.timestamp, startDate));
    }
    if (endDate) {
      conditions.push(lte(pageVisits.timestamp, endDate));
    }
    if (device) {
      conditions.push(eq(pageVisits.deviceType, device));
    }
    if (country) {
      conditions.push(eq(pageVisits.countryCode, country));
    }
    if (referrer) {
      conditions.push(eq(pageVisits.referrerDomain, referrer));
    }

    const visits = await db.query.pageVisits.findMany({
      where: and(...conditions),
      orderBy: [desc(pageVisits.timestamp)],
      limit: limit + 1,
      offset,
    });

    const hasMore = visits.length > limit;
    const data = hasMore ? visits.slice(0, limit) : visits;

    return {
      visits: data,
      hasMore,
    };
  },
  ["page-visits"],
  { revalidate: 60, tags: ["page-visits"] }
);

/**
 * Get KPIs for the analytics dashboard
 */
export const getAnalyticsKPIs = unstable_cache(
  async (
    projectId: string,
    options: { startDate?: Date; endDate?: Date } = {}
  ) => {
    const { startDate, endDate } = options;

    const conditions = [eq(pageVisits.projectId, projectId)];

    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    if (startDate) {
      conditions.push(gte(pageVisits.timestamp, startDate));
    } else {
      conditions.push(gte(pageVisits.timestamp, defaultStartDate));
    }

    if (endDate) {
      conditions.push(lte(pageVisits.timestamp, endDate));
    }

    const visits = await db.query.pageVisits.findMany({
      where: and(...conditions),
      columns: {
        id: true,
        visitorId: true,
        deviceType: true,
        countryCode: true,
        timeOnPage: true,
        sessionId: true,
      },
    });

    const totalVisits = visits.length;
    const uniqueVisitors = new Set(visits.map((v) => v.visitorId)).size;
    const pageviews = visits.filter((v) => !v.sessionId || visits.filter((vv) => vv.sessionId === v.sessionId).length === 1).length;

    const timeOnPages = visits
      .filter((v) => v.timeOnPage !== null)
      .map((v) => v.timeOnPage as number);
    const avgTimeOnPage =
      timeOnPages.length > 0
        ? Math.round(timeOnPages.reduce((a, b) => a + b, 0) / timeOnPages.length)
        : 0;

    // Bounce rate: sessions with only 1 pageview
    const sessionCounts = new Map<string, number>();
    visits.forEach((v) => {
      const sid = v.sessionId || v.visitorId;
      sessionCounts.set(sid, (sessionCounts.get(sid) || 0) + 1);
    });
    const totalSessions = sessionCounts.size;
    const bouncedSessions = Array.from(sessionCounts.values()).filter((c) => c === 1).length;
    const bounceRate = totalSessions > 0 ? Math.round((bouncedSessions / totalSessions) * 100) : 0;

    // Top country and device
    const countryCount = new Map<string, number>();
    const deviceCount = new Map<string, number>();
    visits.forEach((v) => {
      if (v.countryCode) {
        countryCount.set(v.countryCode, (countryCount.get(v.countryCode) || 0) + 1);
      }
      if (v.deviceType) {
        deviceCount.set(v.deviceType, (deviceCount.get(v.deviceType) || 0) + 1);
      }
    });

    const topCountry = Array.from(countryCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    const topDevice = Array.from(deviceCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    return {
      totalVisits,
      uniqueVisitors,
      pageviews,
      avgTimeOnPage,
      bounceRate,
      topCountry,
      topDevice,
    };
  },
  ["analytics-kpis"],
  { revalidate: 300, tags: ["page-visits"] }
);

/**
 * Get timeline data for the chart
 */
export const getAnalyticsTimeline = unstable_cache(
  async (
    projectId: string,
    options: { startDate?: Date; endDate?: Date } = {}
  ) => {
    const { startDate, endDate } = options;

    const conditions = [eq(pageVisits.projectId, projectId)];

    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    if (startDate) {
      conditions.push(gte(pageVisits.timestamp, startDate));
    } else {
      conditions.push(gte(pageVisits.timestamp, defaultStartDate));
    }

    if (endDate) {
      conditions.push(lte(pageVisits.timestamp, endDate));
    }

    const timeline = await db
      .select({
        date: sql<string>`DATE(${pageVisits.timestamp})`,
        visits: dbCount(),
        uniqueVisitors: sql<number>`COUNT(DISTINCT ${pageVisits.visitorId})`,
        pageviews: dbCount(),
      })
      .from(pageVisits)
      .where(and(...conditions))
      .groupBy(sql`DATE(${pageVisits.timestamp})`)
      .orderBy(sql`DATE(${pageVisits.timestamp})`);

    return timeline;
  },
  ["analytics-timeline"],
  { revalidate: 300, tags: ["page-visits"] }
);

/**
 * Get device breakdown for the pie chart
 */
export const getDeviceBreakdown = unstable_cache(
  async (
    projectId: string,
    options: { startDate?: Date; endDate?: Date } = {}
  ) => {
    const { startDate, endDate } = options;

    const conditions = [eq(pageVisits.projectId, projectId)];

    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    if (startDate) {
      conditions.push(gte(pageVisits.timestamp, startDate));
    } else {
      conditions.push(gte(pageVisits.timestamp, defaultStartDate));
    }

    if (endDate) {
      conditions.push(lte(pageVisits.timestamp, endDate));
    }

    const breakdown = await db
      .select({
        deviceType: pageVisits.deviceType,
        count: dbCount(),
      })
      .from(pageVisits)
      .where(and(...conditions))
      .groupBy(pageVisits.deviceType)
      .orderBy(desc(dbCount()));

    const total = breakdown.reduce((sum, row) => sum + Number(row.count), 0);

    return breakdown.map((row) => ({
      deviceType: row.deviceType || "unknown",
      count: Number(row.count),
      percentage: total > 0 ? Math.round((Number(row.count) / total) * 100) : 0,
    }));
  },
  ["analytics-device-breakdown"],
  { revalidate: 300, tags: ["page-visits"] }
);

/**
 * Get geographic breakdown
 */
export const getGeoBreakdown = unstable_cache(
  async (
    projectId: string,
    options: { startDate?: Date; endDate?: Date } = {}
  ) => {
    const { startDate, endDate } = options;

    const conditions = [eq(pageVisits.projectId, projectId)];

    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    if (startDate) {
      conditions.push(gte(pageVisits.timestamp, startDate));
    } else {
      conditions.push(gte(pageVisits.timestamp, defaultStartDate));
    }

    if (endDate) {
      conditions.push(lte(pageVisits.timestamp, endDate));
    }

    const breakdown = await db
      .select({
        countryCode: pageVisits.countryCode,
        country: pageVisits.country,
        count: dbCount(),
      })
      .from(pageVisits)
      .where(and(...conditions))
      .groupBy(pageVisits.countryCode, pageVisits.country)
      .orderBy(desc(dbCount()))
      .limit(20);

    const total = breakdown.reduce((sum, row) => sum + Number(row.count), 0);

    return breakdown.map((row) => ({
      countryCode: row.countryCode || "unknown",
      country: row.country || "Unknown",
      count: Number(row.count),
      percentage: total > 0 ? Math.round((Number(row.count) / total) * 100) : 0,
    }));
  },
  ["analytics-geo-breakdown"],
  { revalidate: 300, tags: ["page-visits"] }
);

/**
 * Get referrer breakdown
 */
export const getReferrerBreakdown = unstable_cache(
  async (
    projectId: string,
    options: { startDate?: Date; endDate?: Date } = {}
  ) => {
    const { startDate, endDate } = options;

    const conditions = [eq(pageVisits.projectId, projectId)];

    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    if (startDate) {
      conditions.push(gte(pageVisits.timestamp, startDate));
    } else {
      conditions.push(gte(pageVisits.timestamp, defaultStartDate));
    }

    if (endDate) {
      conditions.push(lte(pageVisits.timestamp, endDate));
    }

    const breakdown = await db
      .select({
        referrerDomain: pageVisits.referrerDomain,
        count: dbCount(),
      })
      .from(pageVisits)
      .where(and(...conditions))
      .groupBy(pageVisits.referrerDomain)
      .orderBy(desc(dbCount()))
      .limit(20);

    const total = breakdown.reduce((sum, row) => sum + Number(row.count), 0);

    return breakdown.map((row) => ({
      referrerDomain: row.referrerDomain || "Direct",
      count: Number(row.count),
      percentage: total > 0 ? Math.round((Number(row.count) / total) * 100) : 0,
    }));
  },
  ["analytics-referrer-breakdown"],
  { revalidate: 300, tags: ["page-visits"] }
);

/**
 * Get UTM source breakdown
 */
export const getSourceBreakdown = unstable_cache(
  async (
    projectId: string,
    options: { startDate?: Date; endDate?: Date } = {}
  ) => {
    const { startDate, endDate } = options;

    const conditions = [eq(pageVisits.projectId, projectId)];

    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    if (startDate) {
      conditions.push(gte(pageVisits.timestamp, startDate));
    } else {
      conditions.push(gte(pageVisits.timestamp, defaultStartDate));
    }

    if (endDate) {
      conditions.push(lte(pageVisits.timestamp, endDate));
    }

    const breakdown = await db
      .select({
        source: pageVisits.utmSource,
        medium: pageVisits.utmMedium,
        count: dbCount(),
      })
      .from(pageVisits)
      .where(and(...conditions))
      .groupBy(pageVisits.utmSource, pageVisits.utmMedium)
      .orderBy(desc(dbCount()))
      .limit(20);

    const total = breakdown.reduce((sum, row) => sum + Number(row.count), 0);

    return breakdown.map((row) => ({
      source: row.source || "Direct",
      medium: row.medium || "None",
      count: Number(row.count),
      percentage: total > 0 ? Math.round((Number(row.count) / total) * 100) : 0,
    }));
  },
  ["analytics-source-breakdown"],
  { revalidate: 300, tags: ["page-visits"] }
);

/**
 * Get path/page breakdown
 */
export const getPathBreakdown = unstable_cache(
  async (
    projectId: string,
    options: { startDate?: Date; endDate?: Date } = {}
  ) => {
    const { startDate, endDate } = options;

    const conditions = [eq(pageVisits.projectId, projectId)];

    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    if (startDate) {
      conditions.push(gte(pageVisits.timestamp, startDate));
    } else {
      conditions.push(gte(pageVisits.timestamp, defaultStartDate));
    }

    if (endDate) {
      conditions.push(lte(pageVisits.timestamp, endDate));
    }

    const breakdown = await db
      .select({
        path: pageVisits.path,
        title: pageVisits.title,
        count: dbCount(),
        uniqueVisitors: sql<number>`COUNT(DISTINCT ${pageVisits.visitorId})`,
      })
      .from(pageVisits)
      .where(and(...conditions))
      .groupBy(pageVisits.path, pageVisits.title)
      .orderBy(desc(dbCount()))
      .limit(50);

    const total = breakdown.reduce((sum, row) => sum + Number(row.count), 0);

    return breakdown.map((row) => ({
      path: row.path || "/",
      title: row.title || row.path || "Untitled",
      views: Number(row.count),
      uniqueViews: Number(row.uniqueVisitors),
      percentage: total > 0 ? Math.round((Number(row.count) / total) * 100) : 0,
    }));
  },
  ["analytics-path-breakdown"],
  { revalidate: 300, tags: ["page-visits"] }
);

/**
 * Get OS breakdown
 */
export const getOsBreakdown = unstable_cache(
  async (
    projectId: string,
    options: { startDate?: Date; endDate?: Date } = {}
  ) => {
    const { startDate, endDate } = options;

    const conditions = [eq(pageVisits.projectId, projectId)];

    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    if (startDate) {
      conditions.push(gte(pageVisits.timestamp, startDate));
    } else {
      conditions.push(gte(pageVisits.timestamp, defaultStartDate));
    }

    if (endDate) {
      conditions.push(lte(pageVisits.timestamp, endDate));
    }

    const breakdown = await db
      .select({
        os: pageVisits.os,
        count: dbCount(),
      })
      .from(pageVisits)
      .where(and(...conditions))
      .groupBy(pageVisits.os)
      .orderBy(desc(dbCount()))
      .limit(20);

    const total = breakdown.reduce((sum, row) => sum + Number(row.count), 0);

    return breakdown.map((row) => ({
      os: row.os || "Unknown",
      count: Number(row.count),
      percentage: total > 0 ? Math.round((Number(row.count) / total) * 100) : 0,
    }));
  },
  ["analytics-os-breakdown"],
  { revalidate: 300, tags: ["page-visits"] }
);

/**
 * Get browser breakdown
 */
export const getBrowserBreakdown = unstable_cache(
  async (
    projectId: string,
    options: { startDate?: Date; endDate?: Date } = {}
  ) => {
    const { startDate, endDate } = options;

    const conditions = [eq(pageVisits.projectId, projectId)];

    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    if (startDate) {
      conditions.push(gte(pageVisits.timestamp, startDate));
    } else {
      conditions.push(gte(pageVisits.timestamp, defaultStartDate));
    }

    if (endDate) {
      conditions.push(lte(pageVisits.timestamp, endDate));
    }

    const breakdown = await db
      .select({
        browser: pageVisits.browser,
        count: dbCount(),
      })
      .from(pageVisits)
      .where(and(...conditions))
      .groupBy(pageVisits.browser)
      .orderBy(desc(dbCount()))
      .limit(20);

    const total = breakdown.reduce((sum, row) => sum + Number(row.count), 0);

    return breakdown.map((row) => ({
      browser: row.browser || "Unknown",
      count: Number(row.count),
      percentage: total > 0 ? Math.round((Number(row.count) / total) * 100) : 0,
    }));
  },
  ["analytics-browser-breakdown"],
  { revalidate: 300, tags: ["page-visits"] }
);
