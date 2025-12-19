import { db } from "@/lib/db"
import { project, users, keywords, icpProfiles, aiSearch, searchConsoleMetrics, analyticsMetrics, trafficSources } from "@/backend/db/schema"
import { eq, desc, and, gte } from "drizzle-orm"
import { unstable_cache } from "next/cache"
import type { User, Project, Keyword, IcpProfile, AiSearch, SearchConsoleMetric, AnalyticsMetric, TrafficSource } from "@/types/db"

export type DashboardContext = {
  user: User
  project: Project
  keywords: Keyword[]
  icpProfiles: IcpProfile[]
  aiSearch: AiSearch[] // Derniers scans pour les métriques rapides
}

export type DashboardAnalytics = {
  gscHistory: SearchConsoleMetric[]
  analyticsHistory: AnalyticsMetric[]
  trafficSources: TrafficSource[]
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

      // 2. Fetch Project & Related Data in Parallel
      // This is the "Big Query" that powers the entire initial view
      const [projectResult] = await Promise.all([
        db.query.project.findFirst({
          where: eq(project.ownerId, userId)
        })
      ])

      if (!projectResult) return null

      // 3. Once we have the project ID, fetch its sub-resources
      // We do this in a second parallel batch
      const [keywordsResult, icpResult, aiSearchResult] = await Promise.all([
        db.query.keywords.findMany({
          where: eq(keywords.projectId, projectResult.id),
          orderBy: desc(keywords.createdAt)
        }),
        db.query.icpProfiles.findMany({
          where: eq(icpProfiles.projectId, projectResult.id),
          orderBy: desc(icpProfiles.createdAt)
        }),
        db.query.aiSearch.findMany({
          where: eq(aiSearch.projectId, projectResult.id),
          orderBy: desc(aiSearch.createdAt),
          limit: 10 // On limite aux 10 derniers pour l'aperçu rapide (le reste sera paginé ailleurs)
        })
      ])

      return {
        user: userResult,
        project: projectResult,
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
 * Fetches analytics data (GSC, GA4, Traffic Sources) for the dashboard.
 * Cached separately as it might update less frequently or be heavier.
 */
export const getDashboardAnalytics = async (projectId: string): Promise<DashboardAnalytics> => {
  return await unstable_cache(
    async () => {
      // Calculate date 30 days ago
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const dateStr = thirtyDaysAgo.toISOString().split('T')[0] // YYYY-MM-DD

      const [gsc, analytics, traffic] = await Promise.all([
        db.query.searchConsoleMetrics.findMany({
          where: and(
            eq(searchConsoleMetrics.projectId, projectId),
            gte(searchConsoleMetrics.date, dateStr)
          ),
          orderBy: (t, { asc }) => asc(t.date)
        }),
        db.query.analyticsMetrics.findMany({
          where: and(
            eq(analyticsMetrics.projectId, projectId),
            gte(analyticsMetrics.date, dateStr)
          ),
          orderBy: (t, { asc }) => asc(t.date)
        }),
        db.query.trafficSources.findMany({
          where: and(
             eq(trafficSources.projectId, projectId),
             gte(trafficSources.date, dateStr)
          )
        })
      ])

      return {
        gscHistory: gsc,
        analyticsHistory: analytics,
        trafficSources: traffic
      }
    },
    [`dashboard-analytics-${projectId}`],
    {
      revalidate: 3600,
      tags: [`dashboard-analytics-${projectId}`, 'dashboard', 'analytics']
    }
  )()
}
