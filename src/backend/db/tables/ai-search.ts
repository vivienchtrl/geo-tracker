import { jsonb, pgTable, text, timestamp, uuid, boolean, integer } from "drizzle-orm/pg-core";
import { project } from "./project";
import { keywords } from "./keywords";

export const aiSearch = pgTable("ai_search", {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").references(() => project.id, { onDelete: 'cascade' }).notNull(),
    keywordId: uuid("keyword_id").references(() => keywords.id, { onDelete: 'cascade' }).notNull(),
    query: text("query").notNull(),
    response: text("response").notNull(),
    modelUsed: text("model_used").notNull(),
    urlsFound: jsonb("urls_found"),
    isMentioned: boolean("is_mentioned").default(false),
    sentimentScore: integer("sentiment_score"),
    sentimentLabel: text("sentiment_label"),
    rank: integer("rank"),
    createdAt: timestamp("created_at").defaultNow(),
});
