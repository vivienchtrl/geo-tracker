import { pgTable, timestamp, uuid, integer, doublePrecision, date, uniqueIndex } from "drizzle-orm/pg-core";
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
}));

