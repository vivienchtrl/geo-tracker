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
import { pgEnum } from "drizzle-orm/pg-core";

export const keywordsTagsEnum = pgEnum("keywords_tags", ["brand", "generic", "commercial", "informational", "navigational", "transactional"]);

export const keywords = pgTable("keywords", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => project.id, {
    onDelete: "cascade",
  }).notNull(),
  term: text("term").notNull(),
  keywords: text("keywords").notNull(),
  keywordsTags: keywordsTagsEnum("keywords_tags").default("generic"),
  isActive: boolean("is_active").default(true),
  ranking: integer("ranking"),
  createdAt: timestamp("created_at").defaultNow(),
});
