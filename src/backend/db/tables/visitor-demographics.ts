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
 * Visitor Demographics Table
 *
 * Purpose: Daily aggregated summaries of device and browser information
 * Volume: Medium (1-10 rows per project per day)
 * Retention: Long-term (multiple years for trend analysis)
 *
 * Design:
 * - Pre-aggregated daily data for fast dashboard queries
 * - Denormalized for easy querying without joins
 * - Separate rows for device type, OS, and browser combinations
 * - Unique constraint ensures one row per dimension per day
 */
export const visitorDemographics = pgTable(
  "visitor_demographics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .references(() => project.id, { onDelete: "cascade" })
      .notNull(),
    date: date("date").notNull(), // YYYY-MM-DD

    // Device Category
    deviceType: text("device_type", {
      enum: ["mobile", "tablet", "desktop", "bot"],
    }).notNull(),

    // Operating System
    osName: text("os_name"), // 'Windows', 'macOS', 'iOS', 'Android'
    osVersion: text("os_version"),

    // Browser
    browserName: text("browser_name"), // 'Chrome', 'Safari', 'Firefox'
    browserVersion: text("browser_version"),

    // Metrics (aggregated from raw events)
    visitors: integer("visitors").default(0), // Unique visitor count
    visits: integer("visits").default(0), // Total page views
    avgSessionDuration: text("avg_session_duration"), // "02:30" format
    bounceRate: text("bounce_rate"), // "45.5" percentage

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    // Unique constraint: one row per project/date/device combination
    projectDateDeviceUnique: uniqueIndex(
      "visitor_demographics_project_date_device_unique"
    ).on(table.projectId, table.date, table.deviceType),

    // Unique constraint: one row per project/date/OS combination
    projectDateOsUnique: uniqueIndex(
      "visitor_demographics_project_date_os_unique"
    ).on(table.projectId, table.date, table.osName),

    // Unique constraint: one row per project/date/browser combination
    projectDateBrowserUnique: uniqueIndex(
      "visitor_demographics_project_date_browser_unique"
    ).on(table.projectId, table.date, table.browserName),

    // Performance indexes
    projectDateIdx: index("visitor_demographics_project_date_idx").on(table.projectId, table.date),
    projectIdx: index("visitor_demographics_project_idx").on(table.projectId),
  })
).enableRLS();

// RLS Policies
export const visitorDemographicsSelectPolicy = pgPolicy("visitor_demographics_select_access", {
  for: "select",
  to: "authenticated",
  using: sql`(
    auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = visitor_demographics.project_id
      AND project_members.user_id = auth.uid()
    )
  )`,
}).link(visitorDemographics);

export const visitorDemographicsInsertPolicy = pgPolicy("visitor_demographics_insert_service", {
  for: "insert",
  to: "service_role",
  withCheck: sql`true`,
}).link(visitorDemographics);

export const visitorDemographicsUpdatePolicy = pgPolicy("visitor_demographics_update_service", {
  for: "update",
  to: "service_role",
  using: sql`true`,
}).link(visitorDemographics);

