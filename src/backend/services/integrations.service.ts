import { db } from "@/lib/db";
import { integrations } from "@/backend/db/schema";
import { eq, and } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import type { CreateIntegrationInput, UpdateIntegrationInput } from "@/backend/validators/integrations.validators";

// READ (Cached)
export const getIntegrationsByProject = unstable_cache(
  async (projectId: string) => {
    return await db.query.integrations.findMany({
      where: (t, { eq }) => eq(t.projectId, projectId),
    });
  },
  ["project-integrations"],
  { revalidate: 3600, tags: ["integrations", "page"] }
);

export const getIntegrationByProvider = async (projectId: string, provider: string) => {
  return await db.query.integrations.findFirst({
    where: and(
      eq(integrations.projectId, projectId),
      eq(integrations.provider, provider)
    ),
  });
};

// WRITE (Direct DB)
export async function createOrUpdateIntegration(data: CreateIntegrationInput) {
  const existing = await getIntegrationByProvider(data.projectId, data.provider);

  if (existing) {
    return await db
      .update(integrations)
      .set({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        metadata: data.metadata,
        updatedAt: new Date(),
      })
      .where(eq(integrations.id, existing.id))
      .returning();
  }

  return await db.insert(integrations).values(data).returning();
}

export async function deleteIntegration(projectId: string, provider: string) {
  return await db
    .delete(integrations)
    .where(
      and(
        eq(integrations.projectId, projectId),
        eq(integrations.provider, provider)
      )
    )
    .returning();
}
