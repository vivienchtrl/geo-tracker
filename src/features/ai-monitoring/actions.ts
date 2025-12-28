/**
 * AI Monitoring Server Actions
 *
 * Purpose: Fetch all data needed for AI Monitoring dashboard
 * Strategy: Parallel requests, caching via unstable_cache
 *
 * Called from:
 * - Page server component
 * - Client components via useAction hook
 */

"use server";

import { getCurrentUser } from "@/backend/services/user-service";
import { getProjectWithRole } from "@/backend/services/project-service";
import { 
  getAIMentions,
  getAIModelBreakdown,
  getAICompetitorInsights,
  getAIMentionTimeline,
  getAIMonitoringKPIs,
} from "@/backend/services/ai-monitoring.service";
import { db } from "@/backend/db/db";
import { keywords as keywordsTable } from "@/backend/db/tables/schema";
import { eq } from "drizzle-orm";
import { DashboardFilters } from "@/types/dashboard";

/**
 * Get all data for AI Monitoring dashboard
 * This is the main entry point called from the page
 */
export async function getAIMonitoringData(
  projectId: string,
  filters: DashboardFilters = {}
) {
  // 1. Verify user has access to project
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const projectData = await getProjectWithRole(projectId, user.id);
  if (!projectData) {
    throw new Error("Project not found");
  }

  // 2. Fetch all data in parallel
  const [
    keywords,
    mentions,
    mentionTimeline,
    modelBreakdown,
    competitorInsights,
    kpis,
  ] = await Promise.all([
    // Keywords
    db.query.keywords.findMany({
      where: eq(keywordsTable.projectId, projectId),
    }),

    // AI Mentions
    getAIMentions(projectId, filters),

    // Timeline Data
    getAIMentionTimeline(projectId, filters),

    // Models
    getAIModelBreakdown(projectId, filters),

    // Competitors
    getAICompetitorInsights(projectId, filters),

    // KPIs
    getAIMonitoringKPIs(projectId, filters),
  ]);

  return {
    projectId,
    role: projectData.role,
    keywords,
    mentions,
    mentionTimeline,
    modelBreakdown,
    competitorInsights,
    kpis,
  };
}

/**
 * Get specific keyword metrics for drill-down
 */
export async function getKeywordMetrics(
  projectId: string,
  keywordId: string,
  filters: DashboardFilters = {}
) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const projectData = await getProjectWithRole(projectId, user.id);
  if (!projectData) {
    throw new Error("Project not found");
  }

  // Fetch keyword-specific data
  const mentions = await getAIMentions(projectId, {
    ...filters,
    keyword: keywordId,
  });

  return {
    mentions,
  };
}

/**
 * Get specific model metrics for drill-down
 */
export async function getModelMetrics(
  projectId: string,
  modelName: string,
  filters: DashboardFilters = {}
) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const projectData = await getProjectWithRole(projectId, user.id);
  if (!projectData) {
    throw new Error("Project not found");
  }

  // Fetch model-specific data
  const mentions = await getAIMentions(projectId, {
    ...filters,
    llmModel: modelName,
  });

  return {
    mentions,
  };
}

/**
 * Get specific competitor metrics for drill-down
 */
export async function getCompetitorMetrics(
  projectId: string,
  competitorDomain: string,
  filters: DashboardFilters = {}
) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const projectData = await getProjectWithRole(projectId, user.id);
  if (!projectData) {
    throw new Error("Project not found");
  }

  // Note: We already have competitor mentions in main data
  // This could fetch more detailed competitor analysis
  return {
    domain: competitorDomain,
  };
}


/**
 * Get query detail data for inline display
 */
export async function getQueryDetailData(projectId: string, queryId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const projectData = await getProjectWithRole(projectId, user.id);
  if (!projectData) {
    throw new Error("Project not found");
  }

  const { getQueryDetail } = await import("@/backend/services/ai-monitoring.service");

  return await getQueryDetail(projectId, queryId);
}

/**
 * Get prompts/queries with pagination
 * Supports "Load More" functionality
 */
export async function getPromptsData(
  projectId: string,
  filters: DashboardFilters = {},
  limit = 20,
  offset = 0
) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const projectData = await getProjectWithRole(projectId, user.id);
  if (!projectData) {
    throw new Error("Project not found");
  }

  const { getAllQueries } = await import("@/backend/services/ai-monitoring.service");

  return await getAllQueries(projectId, filters, limit, offset);
}


