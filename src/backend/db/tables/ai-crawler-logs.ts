import { pgTable, text, timestamp, uuid, integer, date, uniqueIndex, index, pgPolicy } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { project } from "./project";

// AI Crawler Logs
// Suit les passages des bots IA sur ton site (via analyse de logs ou Cloudflare headers si possible, sinon via ton script JS side - moins fiable pour les bots)
export const aiCrawlerLogs = pgTable("ai_crawler_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => project.id, { onDelete: 'cascade' }).notNull(),
  date: date("date").notNull(),

  botName: text("bot_name").notNull(), // 'GPTBot', 'Google-Extended', 'ClaudeBot', 'PerplexityBot'
  userAgent: text("user_agent"),

  // Volume
  requestsCount: integer("requests_count").default(0),
  blockedRequests: integer("blocked_requests").default(0), // Si blocked par robots.txt

  // Performance
  avgResponseTime: integer("avg_response_time"), // ms

  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  projectDateBotUnique: uniqueIndex("ai_crawl_project_date_bot_unique").on(table.projectId, table.date, table.botName),
  projectDateIdx: index("ai_crawler_logs_project_date_idx").on(table.projectId, table.date),
  projectBotIdx: index("ai_crawler_logs_project_bot_idx").on(table.projectId, table.botName),
})).enableRLS();

// RLS Policies
export const aiCrawlerLogsSelectPolicy = pgPolicy("ai_crawler_logs_select_access", {
  for: "select",
  to: "authenticated",
  using: sql`(
    auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = ai_crawler_logs.project_id
      AND project_members.user_id = auth.uid()
    )
  )`,
}).link(aiCrawlerLogs);

export const aiCrawlerLogsInsertPolicy = pgPolicy("ai_crawler_logs_insert_service", {
  for: "insert",
  to: "service_role",
  withCheck: sql`true`,
}).link(aiCrawlerLogs);

export const aiCrawlerLogsUpdatePolicy = pgPolicy("ai_crawler_logs_update_service", {
  for: "update",
  to: "service_role",
  using: sql`true`,
}).link(aiCrawlerLogs);

