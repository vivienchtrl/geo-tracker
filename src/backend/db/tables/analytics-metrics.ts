import { pgTable, timestamp, uuid, integer, doublePrecision, date, uniqueIndex, index, pgPolicy } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { project } from "./project";

// Google Analytics 4 Daily Metrics
export const analyticsMetrics = pgTable("analytics_metrics", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => project.id, { onDelete: 'cascade' }).notNull(),
  date: date("date").notNull(), // YYYY-MM-DD

  // Traffic
  sessions: integer("sessions").default(0),
  totalUsers: integer("total_users").default(0),
  activeUsers: integer("active_users").default(0),
  newUsers: integer("new_users").default(0),

  // Engagement
  screenPageViews: integer("screen_page_views").default(0),
  engagementRate: doublePrecision("engagement_rate").default(0), // 0.55 = 55%
  averageSessionDuration: doublePrecision("average_session_duration").default(0), // seconds
  bounceRate: doublePrecision("bounce_rate").default(0),

  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  projectDateUnique: uniqueIndex("analytics_project_date_unique").on(table.projectId, table.date),
  projectIdx: index("analytics_metrics_project_idx").on(table.projectId),
})).enableRLS();

// RLS Policies
export const analyticsMetricsSelectPolicy = pgPolicy("analytics_metrics_select_access", {
  for: "select",
  to: "authenticated",
  using: sql`(
    auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = analytics_metrics.project_id
      AND project_members.user_id = auth.uid()
    )
  )`,
}).link(analyticsMetrics);

export const analyticsMetricsInsertPolicy = pgPolicy("analytics_metrics_insert_service", {
  for: "insert",
  to: "service_role",
  withCheck: sql`true`,
}).link(analyticsMetrics);

export const analyticsMetricsUpdatePolicy = pgPolicy("analytics_metrics_update_service", {
  for: "update",
  to: "service_role",
  using: sql`true`,
}).link(analyticsMetrics);

