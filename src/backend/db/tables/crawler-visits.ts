/**
 * Crawler Visits Table (Raw Logs)
 *
 * Purpose: Store individual AI crawler visits with full context
 * Volume: High (potentially millions of records per month)
 * Retention: 90 days (configurable via cron job)
 *
 * Design Decisions:
 * - Separate from aggregated ai_crawler_logs (which is daily rollups)
 * - JSONB for headers (flexible schema)
 * - Efficient indexing for time-series queries
 * - IP always hashed for privacy compliance
 * - Stores response body snippets when site is mentioned
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  index,
  boolean,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { project } from "./project";

export const crawlerVisits = pgTable(
  "crawler_visits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .references(() => project.id, { onDelete: "cascade" })
      .notNull(),

    // Bot Information
    botName: text("bot_name").notNull(), // 'GPTBot', 'ClaudeBot', 'PerplexityBot'
    botCategory: text("bot_category", {
      enum: ["ai_crawler", "search_engine", "social_crawler", "monitoring", "other"],
    }).notNull(),
    botCompany: text("bot_company"), // 'OpenAI', 'Anthropic', 'Google', etc.

    // Visit type - distinguishes crawlers from user-triggered mentions
    visitType: text("visit_type", {
      enum: ["crawler", "user_mention", "search"],
    }).default("crawler"), // crawler = indexing, user_mention = cited in response, search = search index

    // Request Details
    userAgent: text("user_agent").notNull(),
    path: text("path").notNull(), // /products, /blog/post-1
    method: text("method").default("GET"), // GET, POST, HEAD

    // Response Details
    responseStatus: integer("response_status"), // 200, 404, 503
    responseTime: integer("response_time"), // milliseconds

    // Client Information (privacy-compliant)
    ipHash: text("ip_hash").notNull(), // SHA256(IP + salt)

    // Headers (JSONB for flexibility - filtered, not all headers)
    headers: jsonb("headers"), // { 'Accept': 'text/html', 'CF-Ray': '...' }

    // Body Snippets (when site is mentioned in AI response)
    requestBody: text("request_body"), // First 1000 chars, if POST
    responseBodySnippet: text("response_body_snippet"), // First 2000 chars

    // Site Mention Detection
    siteMentioned: boolean("site_mentioned").default(false),

    // Source tracking (which integration sent this)
    source: text("source").default("cloudflare"), // 'cloudflare', 'wordpress', 'vercel', 'custom'

    // Timestamps
    timestamp: timestamp("timestamp").notNull(), // When the visit occurred (from client)
    createdAt: timestamp("created_at").defaultNow().notNull(), // When we received it
  },
  (table) => ({
    // Primary query pattern: project + time range
    projectTimestampIdx: index("crawler_visits_project_timestamp_idx").on(
      table.projectId,
      table.timestamp
    ),
    // Bot filtering
    projectBotIdx: index("crawler_visits_project_bot_idx").on(
      table.projectId,
      table.botName,
      table.timestamp
    ),
    // Bot category filtering
    projectCategoryIdx: index("crawler_visits_project_category_idx").on(
      table.projectId,
      table.botCategory,
      table.timestamp
    ),
    // Status analysis
    projectStatusIdx: index("crawler_visits_project_status_idx").on(
      table.projectId,
      table.responseStatus,
      table.timestamp
    ),
    // Site mention queries
    projectMentionIdx: index("crawler_visits_project_mention_idx").on(
      table.projectId,
      table.siteMentioned,
      table.timestamp
    ),
    // Path analysis
    projectPathIdx: index("crawler_visits_project_path_idx").on(
      table.projectId,
      table.path,
      table.timestamp
    ),
    // Visit type filtering (crawler vs user_mention vs search)
    projectVisitTypeIdx: index("crawler_visits_project_visit_type_idx").on(
      table.projectId,
      table.visitType,
      table.timestamp
    ),
  })
).enableRLS();

// RLS Policies
export const crawlerVisitsSelectPolicy = pgPolicy("crawler_visits_select_access", {
  for: "select",
  to: "authenticated",
  using: sql`(
    auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = crawler_visits.project_id
      AND project_members.user_id = auth.uid()
    )
  )`,
}).link(crawlerVisits);

export const crawlerVisitsInsertPolicy = pgPolicy("crawler_visits_insert_service", {
  for: "insert",
  to: "service_role",
  withCheck: sql`true`,
}).link(crawlerVisits);

// Type exports
export type CrawlerVisit = typeof crawlerVisits.$inferSelect;
export type NewCrawlerVisit = typeof crawlerVisits.$inferInsert;
