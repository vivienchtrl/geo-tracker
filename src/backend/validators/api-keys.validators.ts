/**
 * API Keys Validators
 *
 * Zod schemas for API key operations
 */

import { z } from "zod";

/**
 * Schema for creating a new API key
 */
export const createApiKeySchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .nullable(),
  scopes: z
    .array(z.string())
    .default(["crawlers:write"]),
  expiresAt: z.coerce.date().optional().nullable(),
});

/**
 * Schema for updating an API key (only name and description can be updated)
 */
export const updateApiKeySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .nullable(),
});

/**
 * Schema for revoking an API key
 */
export const revokeApiKeySchema = z.object({
  keyId: z.string().uuid("Invalid key ID"),
  projectId: z.string().uuid("Invalid project ID"),
});

// Type exports
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type UpdateApiKeyInput = z.infer<typeof updateApiKeySchema>;
export type RevokeApiKeyInput = z.infer<typeof revokeApiKeySchema>;
