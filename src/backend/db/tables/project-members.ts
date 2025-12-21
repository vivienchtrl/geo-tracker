import { pgTable, uuid, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
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
  })
);

