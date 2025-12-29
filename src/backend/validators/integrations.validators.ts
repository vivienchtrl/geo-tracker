import { z } from "zod";

export const createIntegrationSchema = z.object({
    projectId: z.string().uuid("Invalid project ID"),
    provider: z.string().min(1, "Provider is required"),
    accessToken: z.string().min(1, "Access token is required"),
    refreshToken: z.string().min(1, "Refresh token is required"),
    expiresAt: z.coerce.date().optional().nullable(),
    metadata: z.record(z.string(), z.any()).optional().nullable().default({}),
});

export const updateIntegrationSchema = createIntegrationSchema.partial();

export type CreateIntegrationInput = z.infer<typeof createIntegrationSchema>;
export type UpdateIntegrationInput = z.infer<typeof updateIntegrationSchema>;
