/**
 * Page Visits Table (Human Traffic)
 *
 * Purpose: Store individual human visitor page views
 * Volume: High (potentially millions of records per month)
 * Retention: 90 days (configurable via cron job)
 *
 * Design Decisions:
 * - Separate from crawler_visits (bot traffic)
 * - JSONB for headers and UTM params (flexible schema)
 * - Efficient indexing for time-series queries
 * - IP always hashed for privacy compliance
 * - Session tracking via visitor_id
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  index,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { project } from "./project";

export const pageVisits = pgTable(
  "page_visits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .references(() => project.id, { onDelete: "cascade" })
      .notNull(),

    // Visitor Identification (privacy-compliant)
    visitorId: text("visitor_id").notNull(), // Hashed fingerprint or cookie ID
    sessionId: text("session_id"), // Optional session grouping
    ipHash: text("ip_hash").notNull(), // SHA256(IP + salt)

    // Page Information
    path: text("path").notNull(), // /products, /blog/post-1
    url: text("url"), // Full URL
    title: text("title"), // Page title
    referrer: text("referrer"), // Where they came from
    referrerDomain: text("referrer_domain"), // Extracted domain

    // UTM Parameters
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    utmTerm: text("utm_term"),
    utmContent: text("utm_content"),

    // Device Information
    deviceType: text("device_type"), // 'desktop', 'mobile', 'tablet'
    browser: text("browser"), // 'Chrome', 'Firefox', 'Safari'
    browserVersion: text("browser_version"),
    os: text("os"), // 'Windows', 'macOS', 'iOS', 'Android'
    osVersion: text("os_version"),
    screenWidth: integer("screen_width"),
    screenHeight: integer("screen_height"),

    // Geolocation (from Cloudflare or IP lookup)
    countryCode: text("country_code"), // 'US', 'FR'
    country: text("country"),
    region: text("region"),
    city: text("city"),

    // Performance Metrics
    loadTime: integer("load_time"), // Page load time in ms
    timeOnPage: integer("time_on_page"), // Time spent in seconds

    // Event Type
    eventType: text("event_type").default("pageview"), // 'pageview', 'scroll', 'click', 'form_submit'
    eventData: jsonb("event_data"), // Additional event-specific data

    // User Agent (raw)
    userAgent: text("user_agent"),

    // Source tracking (which integration sent this)
    source: text("source").default("cloudflare"), // 'cloudflare', 'wordpress', 'vercel', 'custom'

    // Timestamps
    timestamp: timestamp("timestamp").notNull(), // When the visit occurred (from client)
    createdAt: timestamp("created_at").defaultNow().notNull(), // When we received it
  },
  (table) => ({
    // Primary query pattern: project + time range
    projectTimestampIdx: index("page_visits_project_timestamp_idx").on(
      table.projectId,
      table.timestamp
    ),
    // Visitor tracking
    projectVisitorIdx: index("page_visits_project_visitor_idx").on(
      table.projectId,
      table.visitorId,
      table.timestamp
    ),
    // Session tracking
    projectSessionIdx: index("page_visits_project_session_idx").on(
      table.projectId,
      table.sessionId,
      table.timestamp
    ),
    // Path analysis
    projectPathIdx: index("page_visits_project_path_idx").on(
      table.projectId,
      table.path,
      table.timestamp
    ),
    // Device analysis
    projectDeviceIdx: index("page_visits_project_device_idx").on(
      table.projectId,
      table.deviceType,
      table.timestamp
    ),
    // Geographic analysis
    projectCountryIdx: index("page_visits_project_country_idx").on(
      table.projectId,
      table.countryCode,
      table.timestamp
    ),
    // Referrer analysis
    projectReferrerIdx: index("page_visits_project_referrer_idx").on(
      table.projectId,
      table.referrerDomain,
      table.timestamp
    ),
    // UTM analysis
    projectUtmIdx: index("page_visits_project_utm_idx").on(
      table.projectId,
      table.utmSource,
      table.utmMedium,
      table.timestamp
    ),
  })
).enableRLS();

// RLS Policies
export const pageVisitsSelectPolicy = pgPolicy("page_visits_select_access", {
  for: "select",
  to: "authenticated",
  using: sql`(
    auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = page_visits.project_id
      AND project_members.user_id = auth.uid()
    )
  )`,
}).link(pageVisits);

export const pageVisitsInsertPolicy = pgPolicy("page_visits_insert_service", {
  for: "insert",
  to: "service_role",
  withCheck: sql`true`,
}).link(pageVisits);

// Type exports
export type PageVisit = typeof pageVisits.$inferSelect;
export type NewPageVisit = typeof pageVisits.$inferInsert;
