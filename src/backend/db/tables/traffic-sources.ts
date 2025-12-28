import { pgTable, text, timestamp, uuid, integer, date, uniqueIndex, index, pgPolicy } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { project } from "./project";

// Aggregation quotidienne du trafic par source
export const trafficSources = pgTable("traffic_sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => project.id, { onDelete: 'cascade' }).notNull(),
  date: date("date").notNull(),

  source: text("source").notNull(), // 'tiktok.com', 'google', 'newsletter', 'direct'
  medium: text("medium"), // 'organic', 'referral', 'cpc'... (Optionnel mais utile pour le filtrage)

  // Metrics
  visits: integer("visits").default(0), // Total page views
  visitors: integer("visitors").default(0), // Unique visitors

  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  // Unicité : Une ligne par Projet + Date + Source + Medium
  projectDateSourceUnique: uniqueIndex("traffic_project_date_source_unique").on(table.projectId, table.date, table.source, table.medium),
  projectDateIdx: index("traffic_sources_project_date_idx").on(table.projectId, table.date),
  projectSourceIdx: index("traffic_sources_project_source_idx").on(table.projectId, table.source),
})).enableRLS();

// RLS Policies
export const trafficSourcesSelectPolicy = pgPolicy("traffic_sources_select_access", {
  for: "select",
  to: "authenticated",
  using: sql`(
    auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = traffic_sources.project_id
      AND project_members.user_id = auth.uid()
    )
  )`,
}).link(trafficSources);

export const trafficSourcesInsertPolicy = pgPolicy("traffic_sources_insert_service", {
  for: "insert",
  to: "service_role",
  withCheck: sql`true`,
}).link(trafficSources);

export const trafficSourcesUpdatePolicy = pgPolicy("traffic_sources_update_service", {
  for: "update",
  to: "service_role",
  using: sql`true`,
}).link(trafficSources);
