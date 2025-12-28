/**
 * API Keys Service
 *
 * CRUD operations for API keys with secure hashing
 * Used for external integration authentication (Cloudflare Workers, etc.)
 */

import { db } from "@/backend/db/db";
import { apiKeys } from "@/backend/db/tables/api-keys";
import { eq, and, isNull } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import {
  generateApiKey,
  hashApiKey,
  isValidApiKeyFormat,
} from "@/lib/crypto/api-key";
import type { CreateApiKeyInput, UpdateApiKeyInput } from "@/backend/validators/api-keys.validators";

/**
 * Get all active API keys for a project (for display in settings)
 * Returns keys with prefix only (never full key or hash)
 */
export const getApiKeysByProject = unstable_cache(
  async (projectId: string) => {
    const keys = await db.query.apiKeys.findMany({
      where: and(
        eq(apiKeys.projectId, projectId),
        eq(apiKeys.isActive, true),
        isNull(apiKeys.revokedAt)
      ),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
      columns: {
        id: true,
        name: true,
        prefix: true,
        description: true,
        scopes: true,
        createdAt: true,
        lastUsedAt: true,
        expiresAt: true,
        plaintextKey: true, // Only for auto-generated keys, shown once
      },
    });
    return keys;
  },
  ["project-api-keys"],
  { revalidate: 60, tags: ["api-keys"] }
);

/**
 * Create a new API key
 * Returns the plain key ONCE (never stored in plain text)
 */
export async function createApiKey(data: CreateApiKeyInput): Promise<{
  id: string;
  plainKey: string;
  prefix: string;
  name: string;
}> {
  const { plainKey, keyHash, prefix } = generateApiKey();

  const [newKey] = await db
    .insert(apiKeys)
    .values({
      projectId: data.projectId,
      name: data.name,
      prefix,
      keyHash,
      description: data.description,
      scopes: data.scopes,
      expiresAt: data.expiresAt,
    })
    .returning({
      id: apiKeys.id,
      name: apiKeys.name,
    });

  return {
    id: newKey.id,
    plainKey, // Return ONCE, never stored
    prefix,
    name: newKey.name,
  };
}

/**
 * Update an API key (name/description only)
 */
export async function updateApiKey(
  keyId: string,
  projectId: string,
  data: UpdateApiKeyInput
) {
  const [updated] = await db
    .update(apiKeys)
    .set({
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
    })
    .where(
      and(
        eq(apiKeys.id, keyId),
        eq(apiKeys.projectId, projectId),
        eq(apiKeys.isActive, true)
      )
    )
    .returning();

  return updated;
}

/**
 * Revoke an API key (soft delete for audit trail)
 */
export async function revokeApiKey(keyId: string, projectId: string) {
  const [revoked] = await db
    .update(apiKeys)
    .set({
      isActive: false,
      revokedAt: new Date(),
    })
    .where(
      and(
        eq(apiKeys.id, keyId),
        eq(apiKeys.projectId, projectId),
        eq(apiKeys.isActive, true)
      )
    )
    .returning({
      id: apiKeys.id,
      name: apiKeys.name,
    });

  return revoked;
}

/**
 * Validate an API key from request header
 * Returns project ID if valid, null if invalid
 */
export async function validateApiKey(plainKey: string): Promise<{
  valid: boolean;
  projectId?: string;
  keyId?: string;
  error?: string;
  status?: number;
}> {
  // Check format
  if (!plainKey || !isValidApiKeyFormat(plainKey)) {
    return { valid: false, error: "Invalid API key format", status: 401 };
  }

  // Hash and lookup
  const keyHash = hashApiKey(plainKey);

  const key = await db.query.apiKeys.findFirst({
    where: eq(apiKeys.keyHash, keyHash),
    columns: {
      id: true,
      projectId: true,
      isActive: true,
      revokedAt: true,
      expiresAt: true,
    },
  });

  if (!key) {
    return { valid: false, error: "API key not found", status: 401 };
  }

  if (!key.isActive || key.revokedAt) {
    return { valid: false, error: "API key has been revoked", status: 403 };
  }

  if (key.expiresAt && key.expiresAt < new Date()) {
    return { valid: false, error: "API key has expired", status: 403 };
  }

  return {
    valid: true,
    projectId: key.projectId,
    keyId: key.id,
  };
}

/**
 * Update lastUsedAt timestamp for a key
 * Called after successful API request
 */
export async function updateKeyLastUsed(keyId: string) {
  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, keyId));
}

/**
 * Get API key by ID (for detail view, owner only)
 */
export async function getApiKeyById(keyId: string, projectId: string) {
  return await db.query.apiKeys.findFirst({
    where: and(
      eq(apiKeys.id, keyId),
      eq(apiKeys.projectId, projectId)
    ),
    columns: {
      id: true,
      name: true,
      prefix: true,
      description: true,
      scopes: true,
      createdAt: true,
      lastUsedAt: true,
      expiresAt: true,
      revokedAt: true,
      isActive: true,
    },
  });
}

/**
 * Count active API keys for a project
 */
export async function countApiKeys(projectId: string): Promise<number> {
  const keys = await db.query.apiKeys.findMany({
    where: and(
      eq(apiKeys.projectId, projectId),
      eq(apiKeys.isActive, true),
      isNull(apiKeys.revokedAt)
    ),
    columns: { id: true },
  });
  return keys.length;
}

/**
 * Clear the plaintext key after user has seen it
 * For security - auto-generated keys are only viewable once
 */
export async function clearPlaintextKey(keyId: string, projectId: string) {
  await db
    .update(apiKeys)
    .set({ plaintextKey: null })
    .where(
      and(
        eq(apiKeys.id, keyId),
        eq(apiKeys.projectId, projectId)
      )
    );
}
