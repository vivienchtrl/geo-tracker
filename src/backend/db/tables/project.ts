import { pgTable, text, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./user";

    export const project = pgTable("projects", {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
    name: text("name").notNull(),
    url: text("url").notNull(), // Domaine principal
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  }, (table) => ({
    ownerUnique: uniqueIndex("projects_owner_unique").on(table.ownerId),
  }));

