import { pgTable, text, timestamp, uuid, uniqueIndex, integer, pgEnum, pgPolicy, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
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
  ownerIdx: index("projects_owner_idx").on(table.ownerId),
})).enableRLS();

// RLS Policies
export const projectsSelectPolicy = pgPolicy("projects_select_access", {
  for: "select",
  to: "authenticated",
  using: sql`(
    auth.uid() = owner_id
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = projects.id
      AND project_members.user_id = auth.uid()
    )
  )`,
}).link(project);

export const projectsInsertPolicy = pgPolicy("projects_insert_owner", {
  for: "insert",
  to: "authenticated",
  withCheck: sql`auth.uid() = owner_id`,
}).link(project);

export const projectsUpdatePolicy = pgPolicy("projects_update_owner", {
  for: "update",
  to: "authenticated",
  using: sql`auth.uid() = owner_id`,
  withCheck: sql`auth.uid() = owner_id`,
}).link(project);

export const projectsDeletePolicy = pgPolicy("projects_delete_owner", {
  for: "delete",
  to: "authenticated",
  using: sql`auth.uid() = owner_id`,
}).link(project);

