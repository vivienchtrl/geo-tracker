import { pgTable, text, primaryKey, timestamp, boolean } from "drizzle-orm/pg-core";

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
);

