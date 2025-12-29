/**
 * Analytics Server Actions (Human Traffic)
 *
 * Server actions for:
 * - Page visits data fetching
 * - Analytics aggregations
 */

"use server";

import { getCurrentUser } from "@/backend/services/user-service";
import { getProjectWithRole } from "@/backend/services/project-service";
import { getPageVisits } from "@/backend/services/page-visits.service";

/**
 * Get page visits for a project
 * For use in dashboard with load more
 */
export async function getPageVisitsAction(
  projectId: string,
  options: {
    startDate?: Date;
    endDate?: Date;
    device?: string;
    country?: string;
    referrer?: string;
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

    return await getPageVisits(projectId, options);
  } catch (error) {
    console.error("[GET_PAGE_VISITS]", error);
    return { visits: [], hasMore: false };
  }
}
