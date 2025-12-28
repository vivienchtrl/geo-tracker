import { pgTable, timestamp, uuid, integer, doublePrecision, date, uniqueIndex, index, pgPolicy } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { project } from "./project";

// Google Search Console Daily Metrics (Global)
export const searchConsoleMetrics = pgTable("search_console_metrics", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => project.id, { onDelete: 'cascade' }).notNull(),
  date: date("date").notNull(),

  clicks: integer("clicks").default(0),
  impressions: integer("impressions").default(0),
  ctr: doublePrecision("ctr").default(0),
  position: doublePrecision("position").default(0), // Average position

  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  projectDateUnique: uniqueIndex("search_console_project_date_unique").on(table.projectId, table.date),
  projectIdx: index("search_console_metrics_project_idx").on(table.projectId),
})).enableRLS();

// RLS Policies
export const searchConsoleMetricsSelectPolicy = pgPolicy("search_console_metrics_select_access", {
  for: "select",
  to: "authenticated",
  using: sql`(
    auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = search_console_metrics.project_id
      AND project_members.user_id = auth.uid()
    )
  )`,
}).link(searchConsoleMetrics);

export const searchConsoleMetricsInsertPolicy = pgPolicy("search_console_metrics_insert_service", {
  for: "insert",
  to: "service_role",
  withCheck: sql`true`,
}).link(searchConsoleMetrics);

export const searchConsoleMetricsUpdatePolicy = pgPolicy("search_console_metrics_update_service", {
  for: "update",
  to: "service_role",
  using: sql`true`,
}).link(searchConsoleMetrics);

