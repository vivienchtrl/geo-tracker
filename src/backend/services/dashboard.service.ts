import { db } from "@/backend/db/db"
import { project, users, keywords, icpProfiles, aiSearch, projectMembers } from "@/backend/db/tables/schema"
import { eq, desc } from "drizzle-orm"
import { unstable_cache } from "next/cache"
import type { User, Project, Keyword, IcpProfile, AiSearch } from "@/types/db"
import { DashboardFilters } from "@/types/dashboard"
import { getTrafficByDevice, getTrafficByReferrer, getBotActivity, getAISearchStats, getTrafficBySocial } from "./analytics.service"

export type DashboardContext = {
  user: User
  project: Project
  projects: Project[]
  role: 'owner' | 'editor' | 'viewer'
  keywords: Keyword[]
  icpProfiles: IcpProfile[]
  aiSearch: AiSearch[] // Derniers scans pour les métriques rapides
}

export type DashboardAnalytics = {
  competitors: never[]
  models: never[]
  dashboardAnalytics: never[]
  // Detailed analytics from crawler visits
  deviceBreakdown: Awaited<ReturnType<typeof getTrafficByDevice>>
  referrerBreakdown: Awaited<ReturnType<typeof getTrafficByReferrer>>
  socialBreakdown: Awaited<ReturnType<typeof getTrafficBySocial>>
  botActivity: Awaited<ReturnType<typeof getBotActivity>>
  aiSearchStats: Awaited<ReturnType<typeof getAISearchStats>>
}

/**
 * Aggregates all critical data required for the Dashboard shell.
 * Uses strict caching tags for precise invalidation.
 */
export const getDashboardContext = async (userId: string): Promise<DashboardContext | null> => {
  return await unstable_cache(
    async () => {
      // 1. Fetch User (Critical)
      const userResult = await db.query.users.findFirst({
        where: eq(users.id, userId)
      })

      if (!userResult) return null

      // 2. Fetch All Projects User has access to (Owned OR Member)
      const [ownedProjects, memberProjects] = await Promise.all([
        db.query.project.findMany({
          where: eq(project.ownerId, userId)
        }),
        db.select({
          project: project,
          role: projectMembers.role
        })
        .from(projectMembers)
        .innerJoin(project, eq(projectMembers.projectId, project.id))
        .where(eq(projectMembers.userId, userId))
      ])

      // Combine and Deduplicate Projects
      const allProjectsMap = new Map<string, Project>();
      const rolesMap = new Map<string, 'owner' | 'editor' | 'viewer'>();

      // Add owned projects
      ownedProjects.forEach(p => {
        allProjectsMap.set(p.id, p);
        rolesMap.set(p.id, 'owner');
      });

      // Add member projects (might overlap if owner is also in members table)
      memberProjects.forEach(row => {
        allProjectsMap.set(row.project.id, row.project);
        // If not already set as owner, use the member role
        if (!rolesMap.has(row.project.id) || rolesMap.get(row.project.id) !== 'owner') {
             rolesMap.set(row.project.id, row.role as 'owner' | 'editor' | 'viewer');
        }
      });

      const allProjects = Array.from(allProjectsMap.values());

      if (allProjects.length === 0) return null

      // Default to the first project found (or logic to pick last active)
      // For now, we pick the first one.
      // TODO: Implement "last active project" logic via User preferences or separate DB table
      const currentProject = allProjects[0];
      const currentRole = rolesMap.get(currentProject.id) || 'viewer';

      // 3. Once we have the project ID, fetch its sub-resources
      // We do this in a second parallel batch
      const [keywordsResult, icpResult, aiSearchResult] = await Promise.all([
        db.query.keywords.findMany({
          where: eq(keywords.projectId, currentProject.id),
          orderBy: desc(keywords.createdAt)
        }),
        db.query.icpProfiles.findMany({
          where: eq(icpProfiles.projectId, currentProject.id),
          orderBy: desc(icpProfiles.createdAt)
        }),
        db.query.aiSearch.findMany({
          where: eq(aiSearch.projectId, currentProject.id),
          orderBy: desc(aiSearch.createdAt),
          limit: 10 // On limite aux 10 derniers pour l'aperçu rapide (le reste sera paginé ailleurs)
        })
      ])

      return {
        user: userResult,
        project: currentProject,
        projects: allProjects,
        role: currentRole,
        keywords: keywordsResult,
        icpProfiles: icpResult,
        aiSearch: aiSearchResult
      }
    },
    [`dashboard-context-${userId}`], // Unique Cache Key per user
    {
      revalidate: 3600, // Default cache: 1 hour
      // Tags for invalidation: Update ANY of these => Refresh Dashboard
      tags: [
        `dashboard-${userId}`, 
        'dashboard', 
        'user', 
        'project',
        'keywords',
        'icp-profiles',
        'ai-search'
      ] 
    }
  )()
}

/**
 * Fetches analytics data (Traffic Sources) for the dashboard.
 * Cached separately as it might update less frequently or be heavier.
 */
export const getDashboardAnalytics = async (projectId: string, filters: DashboardFilters = {}): Promise<DashboardAnalytics> => {
  const cacheKey = `dashboard-analytics-${projectId}-${JSON.stringify(filters)}`;

  return await unstable_cache(
    async () => {
      const [device, referrers, social, bots, aiStats] = await Promise.all([
        getTrafficByDevice(projectId, filters),
        getTrafficByReferrer(projectId, filters),
        getTrafficBySocial(projectId, filters),
        getBotActivity(projectId, filters),
        getAISearchStats(projectId, filters)
      ])

      return {
        deviceBreakdown: device,
        referrerBreakdown: referrers,
        socialBreakdown: social,
        botActivity: bots,
        aiSearchStats: aiStats,
        competitors: [],
        models: [],
        dashboardAnalytics: []
      }
    },
    [cacheKey],
    {
      revalidate: 3600,
      tags: [`dashboard-analytics-${projectId}`, 'dashboard', 'analytics', 'crawler-visits', 'ai-search']
    }
  )()
}
