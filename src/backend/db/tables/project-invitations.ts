import { pgTable, uuid, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { project } from "./project";
import { isNull } from "drizzle-orm";

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
  })
);

