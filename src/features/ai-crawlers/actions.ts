/**
 * AI Crawlers Server Actions
 *
 * Server actions for:
 * - API key management (create, revoke)
 * - Crawler visits data fetching
 */

"use server";

import { revalidateTag } from "next/cache";
import { getCurrentUser } from "@/backend/services/user-service";
import { getProjectWithRole } from "@/backend/services/project-service";
import {
  createApiKey,
  revokeApiKey,
  getApiKeysByProject,
} from "@/backend/services/api-keys.service";
import { getCrawlerVisits } from "@/backend/services/crawler-visits.service";

/**
 * Create a new API key for a project
 * Only project owners can create keys
 */
export async function createApiKeyAction(
  projectId: string,
  name: string,
  description?: string
): Promise<{
  success: boolean;
  plainKey?: string;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const projectData = await getProjectWithRole(projectId, user.id);
    if (!projectData) {
      return { success: false, error: "Project not found" };
    }

    if (projectData.role !== "owner") {
      return { success: false, error: "Only owners can create API keys" };
    }

    const result = await createApiKey({
      projectId,
      name,
      description: description || null,
      scopes: ["crawlers:write"],
      expiresAt: null,
    });

    revalidateTag("api-keys", "max");
    revalidateTag("project-api-keys", "max");

    return {
      success: true,
      plainKey: result.plainKey,
    };
  } catch (error) {
    console.error("[CREATE_API_KEY]", error);
    return { success: false, error: "Failed to create API key" };
  }
}

/**
 * Revoke an API key
 * Only project owners can revoke keys
 */
export async function revokeApiKeyAction(
  projectId: string,
  keyId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const projectData = await getProjectWithRole(projectId, user.id);
    if (!projectData) {
      return { success: false, error: "Project not found" };
    }

    if (projectData.role !== "owner") {
      return { success: false, error: "Only owners can revoke API keys" };
    }

    const result = await revokeApiKey(keyId, projectId);
    if (!result) {
      return { success: false, error: "API key not found" };
    }

    revalidateTag("api-keys", "max");
    revalidateTag("project-api-keys", "max");

    return { success: true };
  } catch (error) {
    console.error("[REVOKE_API_KEY]", error);
    return { success: false, error: "Failed to revoke API key" };
  }
}

/**
 * Get all API keys for a project
 * For use in settings page
 */
export async function getApiKeysAction(projectId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const projectData = await getProjectWithRole(projectId, user.id);
    if (!projectData) {
      throw new Error("Project not found");
    }

    // Only owners can view API keys
    if (projectData.role !== "owner") {
      return [];
    }

    return await getApiKeysByProject(projectId);
  } catch (error) {
    console.error("[GET_API_KEYS]", error);
    return [];
  }
}

/**
 * Clear the plaintext key after user has copied it
 * This is for security - plaintext is only shown once
 */
export async function clearPlaintextKeyAction(
  projectId: string,
  keyId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const projectData = await getProjectWithRole(projectId, user.id);
    if (!projectData) {
      return { success: false, error: "Project not found" };
    }

    if (projectData.role !== "owner") {
      return { success: false, error: "Only owners can manage API keys" };
    }

    const { clearPlaintextKey } = await import("@/backend/services/api-keys.service");
    await clearPlaintextKey(keyId, projectId);

    revalidateTag("api-keys", "max");
    revalidateTag("project-api-keys", "max");

    return { success: true };
  } catch (error) {
    console.error("[CLEAR_PLAINTEXT_KEY]", error);
    return { success: false, error: "Failed to clear key" };
  }
}

/**
 * Get crawler visits for a project
 * For use in dashboard with load more
 */
export async function getCrawlerVisitsAction(
  projectId: string,
  options: {
    startDate?: Date;
    endDate?: Date;
    botName?: string;
    botCategory?: string;
    limit?: number;
    offset?: number;
  } = {}
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const projectData = await getProjectWithRole(projectId, user.id);
    if (!projectData) {
      throw new Error("Project not found");
    }

    return await getCrawlerVisits(projectId, options);
  } catch (error) {
    console.error("[GET_CRAWLER_VISITS]", error);
    return { visits: [], hasMore: false };
  }
}
