import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  index,
  date,
  boolean,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { project } from "./project";

/**
 * Page Visits Table
 *
 * Purpose: Store individual page visits with complete context
 * Volume: High (millions of records per month)
 * Retention: 90 days (then archived/deleted for GDPR compliance)
 *
 * Design Decisions:
 * - High-volume table optimized for write performance
 * - Heavily indexed for time-series queries
 * - Includes hashed IP (privacy-first approach)
 * - Stores visitor ID for session tracking
 * - JSONB metadata for extensibility without schema changes
 */
export const pageVisits = pgTable(
  "page_visits",
  {
    // Primary Keys
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .references(() => project.id, { onDelete: "cascade" })
      .notNull(),

    // Event Classification
    eventType: text("event_type", {
      enum: ["page_view", "scroll", "interaction", "form_submit"],
    }).notNull(),

    // Page Information
    path: text("path").notNull(), // /products, /blog/post-1
    title: text("title"), // Page title at time of visit
    url: text("url"), // Full URL for debugging
    hash: text("hash"), // URL hash/fragment

    // Referrer & Source
    referrer: text("referrer"), // Complete referrer URL
    referrerDomain: text("referrer_domain"), // Extracted domain (for filtering)
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    utmContent: text("utm_content"),
    utmTerm: text("utm_term"),

    // Visitor Identification
    visitorId: text("visitor_id"), // Client-generated UUID (localStorage-persisted)
    ipHash: text("ip_hash").notNull(), // SHA256 hash of IP + salt (privacy-first)

    // Bot Detection
    isBot: text("is_bot"), // null=human, 'gpt'|'claude'|'google'|'perplexity'|'bing'|'other'
    botName: text("bot_name"), // 'GPTBot', 'ClaudeBot', 'Googlebot-Extended'

    // User Agent & Headers
    userAgent: text("user_agent").notNull(),
    acceptLanguage: text("accept_language"),

    // Device Information (parsed from User-Agent)
    deviceType: text("device_type"), // 'mobile'|'tablet'|'desktop'|'bot'
    osName: text("os_name"), // 'Windows', 'macOS', 'Linux', 'iOS', 'Android'
    osVersion: text("os_version"),
    browserName: text("browser_name"), // 'Chrome', 'Safari', 'Firefox'
    browserVersion: text("browser_version"),
    browserEngine: text("browser_engine"), // 'Blink', 'WebKit', 'Gecko'

    // Geographic Information (IP-based geolocation)
    countryCode: text("country_code"), // 'US', 'FR', 'JP'
    country: text("country"),
    region: text("region"), // State/Province
    city: text("city"),
    timezone: text("timezone"), // 'America/New_York'
    latitude: text("latitude"), // Approximate (not precise)
    longitude: text("longitude"), // Approximate (not precise)
    isProxy: boolean("is_proxy").default(false), // VPN/Proxy detected
    isMobile: boolean("is_mobile").default(false), // Mobile connection

    // Performance Metrics
    pageLoadTime: integer("page_load_time"), // milliseconds

    // Custom Metadata (extensible JSON)
    metadata: jsonb("metadata"), // { theme, locale, customField, etc }

    // Temporal Data
    createdAt: timestamp("created_at").defaultNow().notNull(),
    date: date("date").notNull(), // YYYY-MM-DD for aggregations
  },
  (table) => ({
    // Composite index for time-series queries (critical for dashboard)
    projectCreatedAtIdx: index("page_visits_project_created_at_idx").on(
      table.projectId,
      table.createdAt
    ),

    // Bot activity tracking
    projectBotIdx: index("page_visits_project_bot_idx").on(
      table.projectId,
      table.isBot,
      table.createdAt
    ),

    // Geographic queries
    projectCountryIdx: index("page_visits_project_country_idx").on(
      table.projectId,
      table.countryCode,
      table.createdAt
    ),

    // Device analytics
    projectDeviceIdx: index("page_visits_project_device_idx").on(
      table.projectId,
      table.deviceType,
      table.createdAt
    ),

    // Visitor session tracking
    visitorIdIdx: index("page_visits_visitor_id_idx").on(table.visitorId),

    // Daily aggregation queries
    projectDateIdx: index("page_visits_project_date_idx").on(
      table.projectId,
      table.date
    ),

    // IP hash for privacy-based analytics
    projectIpHashIdx: index("page_visits_project_ip_hash_idx").on(
      table.projectId,
      table.ipHash
    ),
  })
);

