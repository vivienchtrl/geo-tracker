import { jsonb, pgTable, text, timestamp, uuid, boolean, integer, index, pgPolicy } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { project } from "./project";
import { keywords } from "./keywords";

export const aiSearch = pgTable("ai_search", {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").references(() => project.id, { onDelete: 'cascade' }).notNull(),
    keywordId: uuid("keyword_id").references(() => keywords.id, { onDelete: 'cascade' }).notNull(),
    query: text("query").notNull(),
    response: text("response").notNull(),
    modelUsed: text("model_used").notNull(),
    urlsFound: jsonb("urls_found"),
    isMentioned: boolean("is_mentioned").default(false),
    rank: integer("rank"),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
    projectCreatedAtIdx: index("ai_search_project_created_at_idx").on(table.projectId, table.createdAt),
    projectMentionedIdx: index("ai_search_project_mentioned_idx").on(table.projectId, table.isMentioned),
    keywordIdx: index("ai_search_keyword_idx").on(table.keywordId),
    projectModelIdx: index("ai_search_project_model_idx").on(table.projectId, table.modelUsed),
})).enableRLS();

// RLS Policies
export const aiSearchSelectPolicy = pgPolicy("ai_search_select_access", {
  for: "select",
  to: "authenticated",
  using: sql`(
    auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = ai_search.project_id
      AND project_members.user_id = auth.uid()
    )
  )`,
}).link(aiSearch);

export const aiSearchInsertPolicy = pgPolicy("ai_search_insert_access", {
  for: "insert",
  to: "authenticated",
  withCheck: sql`(
    auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = project_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('owner', 'editor')
    )
  )`,
}).link(aiSearch);

export const aiSearchDeletePolicy = pgPolicy("ai_search_delete_access", {
  for: "delete",
  to: "authenticated",
  using: sql`(
    auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = ai_search.project_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('owner', 'editor')
    )
  )`,
}).link(aiSearch);
