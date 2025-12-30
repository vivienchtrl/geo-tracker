/**
 * Crawler Visits Validators
 *
 * Zod schemas for crawler visit log ingestion
 * Used by the POST /api/v1/crawlers/log endpoint
 */

import { z } from "zod";

/**
 * Bot category enum
 */
export const botCategoryEnum = z.enum([
  "ai_crawler",
  "search_engine",
  "social_crawler",
  "monitoring",
  "other",
]);

/**
 * HTTP method enum
 */
export const httpMethodEnum = z.enum([
  "GET",
  "POST",
  "HEAD",
  "OPTIONS",
  "PUT",
  "DELETE",
  "PATCH",
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
 * Visit type enum - distinguishes crawlers from user-triggered mentions
 */
export const visitTypeEnum = z.enum([
  "crawler",      // Bot crawling for indexing/training
  "user_mention", // User asked AI to read this site (= mention in response)
  "search",       // AI search indexing
]);

/**
 * Schema for a single crawler visit log entry
 * Sent by external integrations (Cloudflare Workers, etc.)
 */
export const crawlerVisitSchema = z.object({
  // Required fields
  botName: z
    .string()
    .min(1, "Bot name is required")
    .max(100, "Bot name must be less than 100 characters"),
  userAgent: z
    .string()
    .min(1, "User agent is required")
    .max(2048, "User agent must be less than 2048 characters"),
  path: z
    .string()
    .min(1, "Path is required")
    .max(2048, "Path must be less than 2048 characters"),
  timestamp: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    { message: "Invalid timestamp format. Use ISO 8601." }
  ),

  // Optional request/response details
  method: httpMethodEnum.default("GET"),
  responseStatus: z
    .number()
    .int()
    .min(100, "Status must be >= 100")
    .max(599, "Status must be <= 599")
    .optional()
    .nullable(),
  responseTime: z
    .number()
    .int()
    .positive("Response time must be positive")
    .max(300000, "Response time must be < 5 minutes")
    .optional()
    .nullable(),

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

  // Headers (filtered, not all - JSONB in DB)
  headers: z.record(z.string(), z.string().nullable()).optional().nullable(),

  // Body snippets (size-limited for storage efficiency)
  requestBody: z
    .string()
    .max(1000, "Request body must be < 1000 chars")
    .optional()
    .nullable(),
  responseBodySnippet: z
    .string()
    .max(2000, "Response body must be < 2000 chars")
    .optional()
    .nullable(),

  // Site mention detection
  siteMentioned: z.boolean().optional().nullable().default(false),
  mentionContext: z
    .string()
    .max(500, "Mention context must be < 500 chars")
    .optional()
    .nullable(),

  // Bot category (optional, can be auto-detected)
  botCategory: botCategoryEnum.optional().nullable(),

  // Bot company (e.g., OpenAI, Anthropic, Google)
  botCompany: z.string().max(100).optional().nullable(),

  // Visit type - crawler, user_mention, or search
  visitType: visitTypeEnum.default("crawler"),

  // Source integration
  source: sourceEnum.default("cloudflare"),
});

/**
 * Schema for batch crawler visit logs (multiple entries at once)
 */
export const batchCrawlerVisitsSchema = z.object({
  visits: z
    .array(crawlerVisitSchema)
    .min(1, "At least one visit is required")
    .max(100, "Maximum 100 visits per batch"),
});

// Type exports
export type CrawlerVisitInput = z.infer<typeof crawlerVisitSchema>;
export type BatchCrawlerVisitsInput = z.infer<typeof batchCrawlerVisitsSchema>;
export type BotCategory = z.infer<typeof botCategoryEnum>;
export type HttpMethod = z.infer<typeof httpMethodEnum>;
export type IntegrationSource = z.infer<typeof sourceEnum>;
export type VisitType = z.infer<typeof visitTypeEnum>;
