import { pgTable, uuid, text, timestamp, uniqueIndex, index, pgPolicy } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { project } from "./project";
import { users } from "./user";

export const projectMembers = pgTable(
  "project_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .references(() => project.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    role: text("role", { enum: ["owner", "editor", "viewer"] }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    projectUserUnique: uniqueIndex("project_members_project_user_unique").on(
      table.projectId,
      table.userId
    ),
    userIdx: index("project_members_user_idx").on(table.userId),
    projectRoleIdx: index("project_members_project_role_idx").on(table.projectId, table.role),
  })
).enableRLS();

// RLS Policies
export const projectMembersSelectPolicy = pgPolicy("project_members_select_access", {
  for: "select",
  to: "authenticated",
  using: sql`(
    auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)
    OR EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
    )
  )`,
}).link(projectMembers);

export const projectMembersInsertPolicy = pgPolicy("project_members_insert_owner", {
  for: "insert",
  to: "authenticated",
  withCheck: sql`auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)`,
}).link(projectMembers);

export const projectMembersUpdatePolicy = pgPolicy("project_members_update_owner", {
  for: "update",
  to: "authenticated",
  using: sql`auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)`,
}).link(projectMembers);

export const projectMembersDeletePolicy = pgPolicy("project_members_delete_owner", {
  for: "delete",
  to: "authenticated",
  using: sql`auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)`,
}).link(projectMembers);

