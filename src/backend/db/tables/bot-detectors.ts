import { pgTable, text, timestamp, boolean, pgPolicy } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Bot Detectors Reference Table
 *
 * Purpose: Store bot detection patterns and metadata for easy reference and updates
 * Access: Cached heavily (24-hour cache) as patterns don't change frequently
 *
 * Design:
 * - Small reference table (only ~50-100 rows)
 * - Used for bot pattern matching and categorization
 * - Can be updated without redeploying code
 * - Provides metadata about each bot type
 */
export const botDetectors = pgTable(
  "bot_detectors",
  {
    // Bot identifier (e.g., 'gpt', 'claude', 'google')
    id: text("id").primaryKey(),

    // Display name
    name: text("name").notNull(), // 'OpenAI GPT Bot'

    // User-Agent detection pattern (regex string or substring)
    userAgentPattern: text("user_agent_pattern").notNull(),

    // Categorization
    category: text("category", {
      enum: ["ai_crawler", "search_engine", "social_crawler", "monitoring", "other"],
    }).notNull(),

    // Type of bot
    isBrowser: boolean("is_browser").default(false), // AI browser (Claude Web, etc)
    isSearchEngine: boolean("is_search_engine").default(false),

    // Metadata
    description: text("description"),
    documentationUrl: text("documentation_url"),
    respectsRobotsTxt: boolean("respects_robots_txt").default(true),

    // Maintenance
    isActive: boolean("is_active").default(true),
    updatedAt: timestamp("updated_at").defaultNow(),
  }
).enableRLS();

// RLS Policies (Public read for authenticated users)
export const botDetectorsSelectPolicy = pgPolicy("bot_detectors_select_public", {
  for: "select",
  to: "authenticated",
  using: sql`true`,
}).link(botDetectors);

export const botDetectorsInsertPolicy = pgPolicy("bot_detectors_insert_service", {
  for: "insert",
  to: "service_role",
  withCheck: sql`true`,
}).link(botDetectors);

export const botDetectorsUpdatePolicy = pgPolicy("bot_detectors_update_service", {
  for: "update",
  to: "service_role",
  using: sql`true`,
}).link(botDetectors);

export const botDetectorsDeletePolicy = pgPolicy("bot_detectors_delete_service", {
  for: "delete",
  to: "service_role",
  using: sql`true`,
}).link(botDetectors);

