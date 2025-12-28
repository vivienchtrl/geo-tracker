import { pgTable, text, timestamp, uuid, jsonb, uniqueIndex, index, pgPolicy } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { project } from "./project";

export const integrations = pgTable("integrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => project.id, { onDelete: 'cascade' }).notNull(),

  provider: text("provider").notNull(), // 'google', 'search_console', 'analytics_4'

  // OAuth Tokens
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiresAt: timestamp("expires_at"),

  // Metadata spécifique (ex: quel Property ID GA4 on track ?)
  metadata: jsonb("metadata"), // { ga4_property_id: '123', gsc_site_url: 'https://...' }

  connectedAt: timestamp("connected_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  projectProviderUnique: uniqueIndex("integrations_project_provider_unique").on(table.projectId, table.provider),
  projectIdx: index("integrations_project_idx").on(table.projectId),
})).enableRLS();

// RLS Policies (Owner only - sensitive OAuth tokens)
export const integrationsSelectPolicy = pgPolicy("integrations_select_owner", {
  for: "select",
  to: "authenticated",
  using: sql`auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)`,
}).link(integrations);

export const integrationsInsertPolicy = pgPolicy("integrations_insert_owner", {
  for: "insert",
  to: "authenticated",
  withCheck: sql`auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)`,
}).link(integrations);

export const integrationsUpdatePolicy = pgPolicy("integrations_update_owner", {
  for: "update",
  to: "authenticated",
  using: sql`auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)`,
}).link(integrations);

export const integrationsDeletePolicy = pgPolicy("integrations_delete_owner", {
  for: "delete",
  to: "authenticated",
  using: sql`auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)`,
}).link(integrations);


