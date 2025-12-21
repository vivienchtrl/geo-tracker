import { pgTable, timestamp, uuid, integer, doublePrecision, date, uniqueIndex } from "drizzle-orm/pg-core";
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
}));

