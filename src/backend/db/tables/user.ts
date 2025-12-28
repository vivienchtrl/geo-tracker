import { pgSchema, pgTable, text, timestamp, uuid, pgPolicy } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

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
}).enableRLS();

// RLS Policies
export const usersSelectPolicy = pgPolicy("users_select_own", {
  for: "select",
  to: "authenticated",
  using: sql`auth.uid() = id`,
}).link(users);

export const usersInsertPolicy = pgPolicy("users_insert_own", {
  for: "insert",
  to: "authenticated",
  withCheck: sql`auth.uid() = id`,
}).link(users);

export const usersUpdatePolicy = pgPolicy("users_update_own", {
  for: "update",
  to: "authenticated",
  using: sql`auth.uid() = id`,
  withCheck: sql`auth.uid() = id`,
}).link(users);
