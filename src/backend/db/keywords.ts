import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { project } from "./project";

export const keywords = pgTable("keywords", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => project.id, {
    onDelete: "cascade",
  }).notNull(),
  term: text("term").notNull(),
  tags: jsonb("tags").$type<string[]>(), // ex: ["brand", "generic"]
  isActive: boolean("is_active").default(true),
  ranking: integer("ranking"),
  createdAt: timestamp("created_at").defaultNow(),
});
