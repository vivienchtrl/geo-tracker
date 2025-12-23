import { pgTable, text, timestamp, uuid, uniqueIndex, integer, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./user";

export const llmServiceEnum = pgEnum("llm_service", ["chatgpt", "perplexity", "grok", "mistral", "anthropic", "gemini"]);

export const project = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text("name").notNull(),
  title: text("title"),
  description: text("description"),
  url: text("url").notNull(), // Domaine principal
  enabledLlm: llmServiceEnum("enabled_llm").array().default(['chatgpt', 'perplexity']), // Services LLM sélectionnés
  dailyLimit: integer("daily_limit").default(50), // Limite de prompts par jour
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  ownerUnique: uniqueIndex("projects_owner_unique").on(table.ownerId),
}));

