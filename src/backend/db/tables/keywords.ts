import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  index,
  pgEnum,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { project } from "./project";

export const keywordsTagsEnum = pgEnum("keywords_tags", ["brand", "generic", "commercial", "informational", "navigational", "transactional"]);

export const keywords = pgTable("keywords", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => project.id, {
    onDelete: "cascade",
  }).notNull(),
  term: text("term").notNull(),
  keywords: text("keywords").notNull(),
  keywordsTags: keywordsTagsEnum("keywords_tags").default("generic"),
  isActive: boolean("is_active").default(true),
  ranking: integer("ranking"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  projectIdx: index("keywords_project_idx").on(table.projectId),
  projectActiveIdx: index("keywords_project_active_idx").on(table.projectId, table.isActive),
})).enableRLS();

// RLS Policies
export const keywordsSelectPolicy = pgPolicy("keywords_select_access", {
  for: "select",
  to: "authenticated",
  using: sql`(
    auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = keywords.project_id
      AND project_members.user_id = auth.uid()
    )
  )`,
}).link(keywords);

export const keywordsInsertPolicy = pgPolicy("keywords_insert_access", {
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
}).link(keywords);

export const keywordsUpdatePolicy = pgPolicy("keywords_update_access", {
  for: "update",
  to: "authenticated",
  using: sql`(
    auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = keywords.project_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('owner', 'editor')
    )
  )`,
}).link(keywords);

export const keywordsDeletePolicy = pgPolicy("keywords_delete_access", {
  for: "delete",
  to: "authenticated",
  using: sql`(
    auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = keywords.project_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('owner', 'editor')
    )
  )`,
}).link(keywords);
