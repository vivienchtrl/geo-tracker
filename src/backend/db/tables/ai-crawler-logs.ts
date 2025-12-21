import { pgTable, text, timestamp, uuid, integer, date, uniqueIndex, boolean } from "drizzle-orm/pg-core";
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
}));

