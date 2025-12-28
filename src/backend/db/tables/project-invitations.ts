import { pgTable, uuid, text, timestamp, uniqueIndex, index, pgPolicy } from "drizzle-orm/pg-core";
import { sql, isNull } from "drizzle-orm";
import { project } from "./project";

export const projectInvitations = pgTable(
  "project_invitations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .references(() => project.id, { onDelete: "cascade" })
      .notNull(),
    email: text("email").notNull(),
    role: text("role", { enum: ["owner", "editor", "viewer"] })
      .notNull()
      .default("editor"),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    acceptedAt: timestamp("accepted_at"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    projectEmailUnique: uniqueIndex("project_invitations_project_email_unique")
      .on(table.projectId, table.email)
      .where(isNull(table.acceptedAt)),
    emailIdx: index("project_invitations_email_idx").on(table.email),
    projectIdx: index("project_invitations_project_idx").on(table.projectId),
  })
).enableRLS();

// RLS Policies
export const projectInvitationsSelectPolicy = pgPolicy("project_invitations_select_access", {
  for: "select",
  to: "authenticated",
  using: sql`(
    auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)
    OR email = (SELECT email FROM users WHERE id = auth.uid())
  )`,
}).link(projectInvitations);

export const projectInvitationsInsertPolicy = pgPolicy("project_invitations_insert_owner", {
  for: "insert",
  to: "authenticated",
  withCheck: sql`auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)`,
}).link(projectInvitations);

export const projectInvitationsUpdatePolicy = pgPolicy("project_invitations_update_access", {
  for: "update",
  to: "authenticated",
  using: sql`(
    auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)
    OR email = (SELECT email FROM users WHERE id = auth.uid())
  )`,
}).link(projectInvitations);

export const projectInvitationsDeletePolicy = pgPolicy("project_invitations_delete_owner", {
  for: "delete",
  to: "authenticated",
  using: sql`auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)`,
}).link(projectInvitations);

