import { pgTable, text, timestamp, uuid, index, pgPolicy } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { project } from "./project";

export const icpProfiles = pgTable("icp_profiles", {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").references(() => project.id, { onDelete: 'cascade' }).notNull(),
    name: text("name").notNull(),
    description: text("description"),
    country: text("country").notNull(),
    region: text("region"),
    city: text("city"),
    language: text("language").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
    projectIdx: index("icp_profiles_project_idx").on(table.projectId),
})).enableRLS();

// RLS Policies
export const icpProfilesSelectPolicy = pgPolicy("icp_profiles_select_access", {
  for: "select",
  to: "authenticated",
  using: sql`(
    auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = icp_profiles.project_id
      AND project_members.user_id = auth.uid()
    )
  )`,
}).link(icpProfiles);

export const icpProfilesInsertPolicy = pgPolicy("icp_profiles_insert_access", {
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
}).link(icpProfiles);

export const icpProfilesUpdatePolicy = pgPolicy("icp_profiles_update_access", {
  for: "update",
  to: "authenticated",
  using: sql`(
    auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = icp_profiles.project_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('owner', 'editor')
    )
  )`,
}).link(icpProfiles);

export const icpProfilesDeletePolicy = pgPolicy("icp_profiles_delete_access", {
  for: "delete",
  to: "authenticated",
  using: sql`(
    auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = icp_profiles.project_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('owner', 'editor')
    )
  )`,
}).link(icpProfiles);