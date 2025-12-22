/**
 * Tracking Validators
 *
 * Purpose: Define the data contract for tracker events
 * Strategy: Strict input validation to prevent abuse and ensure data quality
 *
 * Design Decisions:
 * - Minimal required fields (reduce payload size)
 * - Server enriches with IP, geolocation, device parsing
 * - Metadata is open schema for extensibility
 * - Size limits prevent abuse and storage bloat
 */

import { z } from "zod";

/**
 * Schema for page visit event from client
 *
 * What's validated:
 * - Project ID format (must be UUID)
 * - Event type (enum of specific values)
 * - Path safety (no injection attacks)
 * - URL format (valid URL syntax)
 * - Size limits (prevent abuse)
 *
 * What's NOT validated here (server handles):
 * - User-Agent authenticity (we trust browser's report)
 * - IP validity (any string accepted, validation happens on server)
 * - Geolocation data (looked up server-side)
 * - Device type (calculated from User-Agent)
 */
export const capturePageVisitSchema = z.object({
  // ===== REQUIRED FIELDS =====

  /**
   * Project ID (must exist in database)
   * Validated server-side against projects table
   */
  projectId: z
    .string()
    .uuid("Invalid project ID format")
    .describe("Unique identifier of the website project"),

  /**
   * Event type classification
   * Limited to specific types to prevent spam
   */
  eventType: z
    .enum(["page_view", "scroll", "interaction", "form_submit"])
    .default("page_view")
    .describe("Type of event being tracked"),

  /**
   * Page path (URL pathname)
   * Examples: "/products", "/blog/post-1", "/"
   */
  path: z
    .string()
    .min(1, "Path cannot be empty")
    .max(2048, "Path too long")
    .describe("URL path of the page"),

  /**
   * User-Agent header (required for bot detection)
   * Server re-validates by extracting from headers (client hint only)
   */
  userAgent: z
    .string()
    .min(1, "User-Agent required")
    .max(1024, "User-Agent too long")
    .describe("Browser User-Agent string"),

  // ===== OPTIONAL FIELDS =====

  /**
   * Page title (optional)
   * Useful for identifying content type
   */
  title: z
    .string()
    .max(512, "Page title too long")
    .optional()
    .describe("Page title at time of visit"),

  /**
   * Full URL (optional, for verification)
   * Server may validate matches hostname
   */
  url: z
    .string()
    .max(2048, "URL too long")
    .optional()
    .describe("Full URL including query parameters"),

  /**
   * URL hash/fragment (optional)
   * Example: "#section-1" from single-page apps
   */
  hash: z
    .string()
    .max(256)
    .optional()
    .describe("URL hash/fragment"),

  /**
   * Referrer (optional, but valuable for traffic analysis)
   * Must be valid URL format to prevent injection
   */
  referrer: z
    .string()
    .max(2048, "Referrer too long")
    .optional()
    .or(z.literal(""))
    .describe("Page referrer URL"),

  // ===== UTM PARAMETERS (OPTIONAL) =====
  utmSource: z
    .string()
    .max(256)
    .optional()
    .describe("UTM source parameter"),

  utmMedium: z
    .string()
    .max(256)
    .optional()
    .describe("UTM medium parameter"),

  utmCampaign: z
    .string()
    .max(256)
    .optional()
    .describe("UTM campaign parameter"),

  utmContent: z
    .string()
    .max(256)
    .optional()
    .describe("UTM content parameter"),

  utmTerm: z
    .string()
    .max(256)
    .optional()
    .describe("UTM term parameter"),

  // ===== CLIENT-SIDE IDENTIFICATION =====

  /**
   * Visitor ID (optional, from client localStorage)
   * Client-generated UUID persisted to track repeat visitors
   * Privacy: Anonymous, cannot be reversed to identify user
   */
  visitorId: z
    .string()
    .uuid("Invalid visitor ID format")
    .optional()
    .describe("Anonymous visitor identifier (from client)"),

  /**
   * Device type (optional hint from client detection)
   * Server re-calculates from User-Agent
   */
  deviceType: z
    .enum(["mobile", "tablet", "desktop"])
    .optional()
    .describe("Device type hint from client"),

  /**
   * Accept-Language header (optional)
   * Useful for localization analysis
   */
  acceptLanguage: z
    .string()
    .max(256)
    .optional()
    .describe("Accept-Language header value"),

  // ===== PERFORMANCE METRICS (OPTIONAL) =====

  /**
   * Page load time (optional, from client)
   * Milliseconds measured by client
   */
  pageLoadTime: z
    .number()
    .int()
    .positive("Page load time must be positive")
    .optional()
    .describe("Page load time in milliseconds"),

  // ===== CUSTOM METADATA (EXTENSIBLE) =====

  /**
   * Custom metadata for extensibility
   * Stored as JSONB, allowing arbitrary fields
   * Size limited to prevent abuse
   *
   * Examples:
   * {
   *   theme: "dark",
   *   locale: "en-US",
   *   customField: "value"
   * }
   */
  metadata: z
    .record(z.string(), z.any())
    .refine(
      (obj) => JSON.stringify(obj).length < 8192,
      "Metadata too large (max 8KB)"
    )
    .optional()
    .describe("Custom metadata (extensible)"),
});

/**
 * Inferred TypeScript type from Zod schema
 * Use for type safety in services and actions
 */
export type CapturePageVisitInput = z.infer<typeof capturePageVisitSchema>;

/**
 * Geolocation result schema (internal use)
 * Not exposed to client, used by server-side service
 */
export const geolocationResultSchema = z.object({
  countryCode: z.string().length(2),
  country: z.string(),
  region: z.string().optional(),
  city: z.string().optional(),
  timezone: z.string(),
  latitude: z.string(),
  longitude: z.string(),
  isProxy: z.boolean(),
  isMobile: z.boolean(),
  asn: z.string().optional(),
});

export type GeolocationResult = z.infer<typeof geolocationResultSchema>;

/**
 * Rate limiting schema (internal use)
 * Used to track abuse attempts
 */
export const rateLimitingSchema = z.object({
  ip: z.string(),
  projectId: z.string().uuid(),
  timestamp: z.date(),
  eventsInWindow: z.number().int().positive(),
});

export type RateLimitingData = z.infer<typeof rateLimitingSchema>;

