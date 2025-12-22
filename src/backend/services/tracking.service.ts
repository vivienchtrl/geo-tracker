/**
 * Tracking Service
 *
 * Purpose: Handle page visit capture, bot detection, and data storage
 * Strategy: Privacy-first with IP hashing, server-side enrichment
 *
 * Flow:
 * 1. Validate input via Zod schema
 * 2. Verify project exists
 * 3. Detect bot from User-Agent
 * 4. Parse device/browser info
 * 5. Extract referrer domain
 * 6. Hash IP for privacy
 * 7. Store in database
 */

import { db } from "@/backend/db/db";
import { pageVisits } from "@/backend/db/tables/page-visits";
import { project } from "@/backend/db/tables/project";
import {
  capturePageVisitSchema,
  type CapturePageVisitInput,
} from "@/backend/validators/tracking.validators";
import { detectBot } from "@/features/tracking/utils/bot-detector";
import { parseUserAgent } from "@/features/tracking/utils/user-agent-parser";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import crypto from "crypto";

// ============================================================================
// TYPES
// ============================================================================

interface CaptureResult {
  success: boolean;
  message: string;
  id?: string;
}

interface ProjectValidation {
  exists: boolean;
  url?: string;
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Hash IP address for privacy (one-way SHA256)
 * Cannot be reversed, only used for grouping in analytics
 *
 * Security:
 * - Uses environment SALT for additional entropy
 * - Different salt per deployment prevents rainbow table attacks
 * - SHA256 is collision-resistant
 */
function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT || "geo-tracker-default-salt";
  return crypto.createHash("sha256").update(`${ip}${salt}`).digest("hex");
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return null;
  }
}

/**
 * Get today's date in YYYY-MM-DD format (UTC)
 */
function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

// ============================================================================
// PROJECT VALIDATION
// ============================================================================

/**
 * Validate project exists and get its URL
 * Cached for performance (project changes rarely)
 */
async function validateProject(projectId: string): Promise<ProjectValidation> {
  try {
    const result = await db.query.project.findFirst({
      where: eq(project.id, projectId),
      columns: { id: true, url: true },
    });

    return {
      exists: !!result,
      url: result?.url,
    };
  } catch {
    return { exists: false };
  }
}

// ============================================================================
// MAIN SERVICE FUNCTION
// ============================================================================

/**
 * Find project ID by domain/URL
 */
export async function getProjectIdByDomain(domain: string): Promise<string | null> {
  try {
    // We clean the domain to be sure (remove www, etc)
    const cleanDomain = domain.replace(/^www\./, "").toLowerCase();

    const result = await db.query.project.findFirst({
      where: (p, { or, ilike }) => 
        or(
          ilike(p.url, `%${cleanDomain}%`),
          ilike(p.url, `%${domain.toLowerCase()}%`)
        ),
      columns: { id: true },
    });

    return result?.id || null;
  } catch {
    return null;
  }
}

/**
 * Capture a page visit event
 *
 * Steps:
 * 1. Validate input schema
 * 2. Verify project exists
 * 3. Detect bot from User-Agent
 * 4. Parse device/browser info
 * 5. Extract referrer domain
 * 6. Hash IP for privacy
 * 7. Store in database
 *
 * Performance:
 * - Direct insert (no caching for writes)
 * - Aggregation happens via cron jobs
 * - Indexes optimized for time-series reads
 */
export async function capturePageVisit(
  data: CapturePageVisitInput,
  ipAddress: string
): Promise<CaptureResult> {
  try {
    // 1. Validate input
    const validation = capturePageVisitSchema.safeParse(data);
    if (!validation.success) {
      console.warn("[Tracker] Invalid input:", validation.error.issues);
      return {
        success: false,
        message: "Invalid tracking data",
      };
    }

    const payload = validation.data;

    // 2. Verify project exists
    const projectCheck = await validateProject(payload.projectId);
    if (!projectCheck.exists) {
      console.warn("[Tracker] Project not found:", payload.projectId);
      return {
        success: false,
        message: "Project not found",
      };
    }

    // 3. Detect bot from User-Agent
    const botDetection = detectBot(payload.userAgent);

    // 4. Parse User-Agent for device/browser info
    const deviceInfo = parseUserAgent(payload.userAgent);

    // 5. Extract referrer domain
    let referrerDomain: string | null = null;
    if (payload.referrer && payload.referrer !== "") {
      referrerDomain = extractDomain(payload.referrer);
    }

    // 6. Hash IP for privacy
    const ipHash = hashIp(ipAddress);

    // 7. Get today's date for aggregation
    const today = getTodayDateString();

    // 8. Insert into database
    const [result] = await db
      .insert(pageVisits)
      .values({
        projectId: payload.projectId,
        eventType: payload.eventType,
        path: payload.path,
        title: payload.title,
        url: payload.url,
        hash: payload.hash,
        referrer: payload.referrer || null,
        referrerDomain,
        utmSource: payload.utmSource,
        utmMedium: payload.utmMedium,
        utmCampaign: payload.utmCampaign,
        utmContent: payload.utmContent,
        utmTerm: payload.utmTerm,
        visitorId: payload.visitorId,
        ipHash,
        isBot: botDetection.botType,
        botName: botDetection.botName,
        userAgent: payload.userAgent,
        acceptLanguage: payload.acceptLanguage,
        deviceType: deviceInfo.deviceType || payload.deviceType,
        osName: deviceInfo.osName,
        osVersion: deviceInfo.osVersion,
        browserName: deviceInfo.browserName,
        browserVersion: deviceInfo.browserVersion,
        browserEngine: deviceInfo.browserEngine,
        // Geolocation fields left null (can be enriched via external service)
        countryCode: null,
        country: null,
        region: null,
        city: null,
        timezone: null,
        latitude: null,
        longitude: null,
        isProxy: false,
        isMobile: deviceInfo.deviceType === "mobile",
        pageLoadTime: payload.pageLoadTime,
        metadata: payload.metadata || {},
        date: today,
      })
      .returning({ id: pageVisits.id });

    return {
      success: true,
      message: "Visit tracked successfully",
      id: result?.id,
    };
  } catch (error) {
    console.error("[Tracker] Capture error:", error);
    return {
      success: false,
      message: "Failed to track visit",
    };
  }
}

// ============================================================================
// QUERY FUNCTIONS (for dashboard)
// ============================================================================

/**
 * Get recent page visits for a project
 */
export async function getRecentPageVisits(
  projectId: string,
  limit = 50,
  hoursBack = 24
) {
  const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  return db.query.pageVisits.findMany({
    where: and(
      eq(pageVisits.projectId, projectId),
      gte(pageVisits.createdAt, cutoffTime)
    ),
    orderBy: desc(pageVisits.createdAt),
    limit,
  });
}

/**
 * Get tracker statistics for a project
 */
export async function getTrackerStats(projectId: string) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [result] = await db
    .select({
      totalVisits: sql<number>`COUNT(*)`,
      uniqueVisitors: sql<number>`COUNT(DISTINCT ${pageVisits.visitorId})`,
      botVisits: sql<number>`COUNT(*) FILTER (WHERE ${pageVisits.isBot} IS NOT NULL)`,
      humanVisits: sql<number>`COUNT(*) FILTER (WHERE ${pageVisits.isBot} IS NULL)`,
    })
    .from(pageVisits)
    .where(
      and(
        eq(pageVisits.projectId, projectId),
        gte(pageVisits.createdAt, oneDayAgo)
      )
    );

  return result;
}

/**
 * Check if tracker has received any signals
 */
export async function hasTrackerSignal(projectId: string): Promise<boolean> {
  const result = await db.query.pageVisits.findFirst({
    where: eq(pageVisits.projectId, projectId),
    columns: { id: true },
  });

  return !!result;
}

/**
 * Get last tracker signal timestamp
 */
export async function getLastTrackerSignal(
  projectId: string
): Promise<Date | null> {
  const result = await db.query.pageVisits.findFirst({
    where: eq(pageVisits.projectId, projectId),
    orderBy: desc(pageVisits.createdAt),
    columns: { createdAt: true },
  });

  return result?.createdAt || null;
}

