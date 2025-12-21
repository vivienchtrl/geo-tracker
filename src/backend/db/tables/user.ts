import { pgSchema, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

const authSchema = pgSchema('auth');

const authUsers = authSchema.table('users', {
	id: uuid('id').primaryKey(),
});

export const users = pgTable("users", {
  id: uuid("id").references(() => authUsers.id, { onDelete: 'cascade' }).primaryKey(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
