import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { project } from "./project";

export const icpProfiles = pgTable("icp_profiles", {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").references(() => project.id, { onDelete: 'cascade' }).notNull(),
    name: text("name").notNull(),
    description: text("description"),
    country: text("country").notNull(),
    region: text("region"),
    city: text("city"),
    language: text("language").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});