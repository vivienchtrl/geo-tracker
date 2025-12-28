import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  date,
  uniqueIndex,
  index,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { project } from "./project";

/**
 * Geographic Activity Table
 *
 * Purpose: Daily geographic summaries of visitor activity
 * Volume: Medium (50-300 rows per project per day depending on audience)
 * Retention: Long-term (multiple years for trend analysis)
 *
 * Design:
 * - Pre-aggregated daily data by country/region/city
 * - Used for geographic heatmaps and audience analysis
 * - Unique constraint ensures clean aggregation
 * - Includes VPN/proxy percentage for security insights
 */
export const geographicActivity = pgTable(
  "geographic_activity",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .references(() => project.id, { onDelete: "cascade" })
      .notNull(),
    date: date("date").notNull(), // YYYY-MM-DD

    // Location hierarchy
    countryCode: text("country_code").notNull(), // 'US', 'FR', 'JP'
    country: text("country"),
    region: text("region"), // State/Province/Region
    city: text("city"),

    // Metrics (aggregated from raw events)
    visitors: integer("visitors").default(0), // Unique visitor count
    visits: integer("visits").default(0), // Total page views
    bounceRate: text("bounce_rate"), // "45.5" percentage
    avgSessionDuration: text("avg_session_duration"), // "02:30" format

    // Security metrics
    isProxyPct: text("is_proxy_pct"), // "5.2" - percentage of visits from VPN/proxy

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    // Unique constraint: one row per project/date/country
    projectDateCountryUnique: uniqueIndex(
      "geographic_activity_project_date_country_unique"
    ).on(table.projectId, table.date, table.countryCode),

    // Performance indexes
    projectDateIdx: index("geographic_activity_project_date_idx").on(table.projectId, table.date),
    projectIdx: index("geographic_activity_project_idx").on(table.projectId),
    projectCountryIdx: index("geographic_activity_project_country_idx").on(table.projectId, table.countryCode),
  })
).enableRLS();

// RLS Policies
export const geographicActivitySelectPolicy = pgPolicy("geographic_activity_select_access", {
  for: "select",
  to: "authenticated",
  using: sql`(
    auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = geographic_activity.project_id
      AND project_members.user_id = auth.uid()
    )
  )`,
}).link(geographicActivity);

export const geographicActivityInsertPolicy = pgPolicy("geographic_activity_insert_service", {
  for: "insert",
  to: "service_role",
  withCheck: sql`true`,
}).link(geographicActivity);

export const geographicActivityUpdatePolicy = pgPolicy("geographic_activity_update_service", {
  for: "update",
  to: "service_role",
  using: sql`true`,
}).link(geographicActivity);

