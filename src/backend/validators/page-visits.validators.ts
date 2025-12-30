/**
 * Page Visits Validators (Human Traffic)
 *
 * Zod schemas for page visit log ingestion
 * Used by the POST /api/v1/visits/log endpoint
 */

import { z } from "zod";

/**
 * Event type enum
 */
export const eventTypeEnum = z.enum([
  "pageview",
  "scroll",
  "click",
  "form_submit",
  "engagement",
  "custom",
]);

/**
 * Device type enum
 */
export const deviceTypeEnum = z.enum([
  "desktop",
  "mobile",
  "tablet",
  "unknown",
]);

/**
 * Integration source enum
 */
export const sourceEnum = z.enum([
  "cloudflare",
  "wordpress",
  "vercel",
  "custom",
]);

/**
 * Schema for a single page visit log entry
 * Sent by external integrations (Cloudflare Workers, etc.)
 */
export const pageVisitSchema = z.object({
  // Required fields
  visitorId: z
    .string()
    .min(1, "Visitor ID is required")
    .max(100, "Visitor ID must be less than 100 characters"),
  path: z
    .string()
    .min(1, "Path is required")
    .max(2048, "Path must be less than 2048 characters"),
  timestamp: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    { message: "Invalid timestamp format. Use ISO 8601." }
  ),

  // Optional session tracking
  sessionId: z
    .string()
    .max(100, "Session ID must be less than 100 characters")
    .optional()
    .nullable(),

  // Page information
  url: z.string().max(2048).optional().nullable(),
  title: z.string().max(500).optional().nullable(),
  referrer: z.string().max(2048).optional().nullable(),

  // UTM Parameters
  utmSource: z.string().max(100).optional().nullable(),
  utmMedium: z.string().max(100).optional().nullable(),
  utmCampaign: z.string().max(200).optional().nullable(),
  utmTerm: z.string().max(200).optional().nullable(),
  utmContent: z.string().max(200).optional().nullable(),

  // Device information (optional - can be parsed from userAgent)
  deviceType: deviceTypeEnum.optional().nullable(),
  browser: z.string().max(50).optional().nullable(),
  browserVersion: z.string().max(20).optional().nullable(),
  os: z.string().max(50).optional().nullable(),
  osVersion: z.string().max(20).optional().nullable(),
  screenWidth: z.number().int().positive().max(10000).optional().nullable(),
  screenHeight: z.number().int().positive().max(10000).optional().nullable(),

  // Client information (IP will be hashed server-side)
  ipAddress: z
    .string()
    .max(45, "IP address too long")
    .optional()
    .nullable(),

  // Geolocation (from Cloudflare headers or IP lookup)
  countryCode: z
    .string()
    .length(2, "Country code must be 2 characters")
    .optional()
    .nullable(),
  country: z.string().max(100).optional().nullable(),
  region: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),

  // Performance metrics
  loadTime: z
    .number()
    .int()
    .positive()
    .max(300000, "Load time must be < 5 minutes")
    .optional()
    .nullable(),
  timeOnPage: z
    .number()
    .int()
    .positive()
    .max(86400, "Time on page must be < 24 hours")
    .optional()
    .nullable(),

  // Event information
  eventType: eventTypeEnum.default("pageview"),
  eventData: z.record(z.string(), z.unknown()).optional().nullable(),

  // User agent
  userAgent: z
    .string()
    .max(2048, "User agent must be less than 2048 characters")
    .optional()
    .nullable(),

  // Source integration
  source: sourceEnum.default("cloudflare"),
});

/**
 * Schema for batch page visit logs (multiple entries at once)
 */
export const batchPageVisitsSchema = z.object({
  visits: z
    .array(pageVisitSchema)
    .min(1, "At least one visit is required")
    .max(100, "Maximum 100 visits per batch"),
});

// Type exports
export type PageVisitInput = z.infer<typeof pageVisitSchema>;
export type BatchPageVisitsInput = z.infer<typeof batchPageVisitsSchema>;
export type EventType = z.infer<typeof eventTypeEnum>;
export type DeviceType = z.infer<typeof deviceTypeEnum>;
export type IntegrationSource = z.infer<typeof sourceEnum>;
