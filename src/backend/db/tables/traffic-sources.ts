import { pgTable, text, timestamp, uuid, integer, date, uniqueIndex } from "drizzle-orm/pg-core";
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
}));
