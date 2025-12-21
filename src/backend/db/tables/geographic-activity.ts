import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  date,
  uniqueIndex,
} from "drizzle-orm/pg-core";
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
  })
);

