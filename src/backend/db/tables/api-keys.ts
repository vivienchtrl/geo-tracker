/**
 * API Keys Table
 *
 * Purpose: Store hashed API keys for external integrations (Cloudflare Workers, etc.)
 * Security: Keys are SHA256 hashed - never store plain text
 *
 * Design Decisions:
 * - Prefix stored separately for identification (gtr_live_xxx...)
 * - Hash uses SHA256 with salt for security
 * - lastUsedAt tracks activity for auditing
 * - revokedAt for soft-delete (maintain audit trail)
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  boolean,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { project } from "./project";

export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .references(() => project.id, { onDelete: "cascade" })
      .notNull(),

    // Identification
    name: text("name").notNull(), // User-friendly name: "Production Cloudflare"
    prefix: text("prefix").notNull(), // First 16 chars for display: "gtr_live_abc..."

    // Security - NEVER store plain key (except for auto-generated default keys)
    keyHash: text("key_hash").notNull(), // SHA256(key + salt)
    plaintextKey: text("plaintext_key"), // Only for auto-generated keys, cleared after first view

    // Scopes (for future extensibility)
    scopes: text("scopes")
      .array()
      .default(["crawlers:write"])
      .notNull(),

    // Optional description
    description: text("description"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    lastUsedAt: timestamp("last_used_at"), // Updated on each API call
    expiresAt: timestamp("expires_at"), // Optional expiration
    revokedAt: timestamp("revoked_at"), // Soft-delete for audit trail

    // Status
    isActive: boolean("is_active").default(true).notNull(),
  },
  (table) => ({
    // Fast lookup by prefix (for display in UI)
    prefixIdx: index("api_keys_prefix_idx").on(table.prefix),
    // Project lookup
    projectIdx: index("api_keys_project_idx").on(table.projectId),
    // Hash lookup (for authentication)
    hashIdx: index("api_keys_hash_idx").on(table.keyHash),
    // Active keys per project
    projectActiveIdx: index("api_keys_project_active_idx").on(
      table.projectId,
      table.isActive
    ),
  })
).enableRLS();

// RLS Policies
export const apiKeysSelectPolicy = pgPolicy("api_keys_select_access", {
  for: "select",
  to: "authenticated",
  using: sql`(
    auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = api_keys.project_id
      AND project_members.user_id = auth.uid()
    )
  )`,
}).link(apiKeys);

export const apiKeysInsertPolicy = pgPolicy("api_keys_insert_owner", {
  for: "insert",
  to: "authenticated",
  withCheck: sql`auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)`,
}).link(apiKeys);

export const apiKeysUpdatePolicy = pgPolicy("api_keys_update_owner", {
  for: "update",
  to: "authenticated",
  using: sql`auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)`,
}).link(apiKeys);

export const apiKeysDeletePolicy = pgPolicy("api_keys_delete_owner", {
  for: "delete",
  to: "authenticated",
  using: sql`auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)`,
}).link(apiKeys);

// Type exports
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
