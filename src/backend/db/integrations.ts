
import { pgTable, text, timestamp, uuid, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
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
}));


