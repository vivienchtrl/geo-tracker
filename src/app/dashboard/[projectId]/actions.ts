'use server'

import { db } from '@/backend/db/db'
import { keywords, aiSearch, project, crawlerVisits } from '@/backend/db/tables/schema'
import { eq, desc, and, gte, lte, ilike, SQL } from 'drizzle-orm'
import { getDashboardAnalytics } from '@/backend/services/dashboard.service'
import type { AiSearch, Keyword, CrawlerVisit } from '@/types/db'
import { DashboardFilters, getDateRangeDate, DashboardMetrics, KeywordData } from '@/types/dashboard'

/**
 * Get AI metrics data for a specific project
 * Fetches aiSearch and keywords directly
 */
async function getAiMetricsData(projectId: string, filters: DashboardFilters = {}) {
  // Build AI Search filters
  const aiConditions: SQL[] = [eq(aiSearch.projectId, projectId)];

  // Date Range
  if (filters.startDate && filters.endDate) {
    aiConditions.push(and(gte(aiSearch.createdAt, filters.startDate), lte(aiSearch.createdAt, filters.endDate))!);
  } else {
    const cutoff = getDateRangeDate(filters.dateRange || '30d');
    aiConditions.push(gte(aiSearch.createdAt, cutoff)!);
  }

  // AI Specific Filters
  if (filters.llmModel) {
    aiConditions.push(ilike(aiSearch.modelUsed, `%${filters.llmModel}%`));
  }
  if (filters.searchQuery) {
    aiConditions.push(ilike(aiSearch.query, `%${filters.searchQuery}%`));
  }

  // Build Crawler Visits Filters
  const crawlerConditions: SQL[] = [eq(crawlerVisits.projectId, projectId)];

  if (filters.startDate && filters.endDate) {
    crawlerConditions.push(and(gte(crawlerVisits.timestamp, filters.startDate), lte(crawlerVisits.timestamp, filters.endDate))!);
  } else {
    const cutoff = getDateRangeDate(filters.dateRange || '30d');
    crawlerConditions.push(gte(crawlerVisits.timestamp, cutoff)!);
  }

  const [keywordsList, aiSearchList, projectData, crawlerLogs] = await Promise.all([
    db.query.keywords.findMany({
      where: eq(keywords.projectId, projectId),
      orderBy: desc(keywords.createdAt)
    }),
    db.query.aiSearch.findMany({
      where: and(...aiConditions),
      orderBy: desc(aiSearch.createdAt)
    }),
    db.query.project.findFirst({
      where: eq(project.id, projectId)
    }),
    db.query.crawlerVisits.findMany({
      where: and(...crawlerConditions),
      orderBy: desc(crawlerVisits.timestamp),
      limit: 50
    })
  ])

  return { keywordsList, aiSearchList, projectUrl: projectData?.url || '', crawlerLogs }
}

/**
 * Get dashboard data for a specific project
 */
export async function getDashboardDataForProject(projectId: string, filters: DashboardFilters = {}): Promise<DashboardMetrics> {
  // Fetch AI-specific data and detailed analytics in parallel
  const [{ keywordsList, aiSearchList, projectUrl, crawlerLogs }, crawlerAnalytics] = await Promise.all([
    getAiMetricsData(projectId, filters),
    getDashboardAnalytics(projectId, filters)
  ])

  // Extract project hostname for comparison
  let projectHostname = ''
  try {
    projectHostname = new URL(projectUrl).hostname.replace('www.', '')
  } catch {
    // Invalid URL, skip competitor filtering
  }

  // Aggregation Maps
  const modelMap = new Map<string, { total: number; mentioned: number }>()
  const globalCompetitorMap = new Map<string, { count: number; totalRank: number }>()

  // Keyword Aggregation
  const keywordStatsMap = new Map<string, {
    totalScans: number
    mentions: number
    totalRank: number
    totalSentiment: number
    competitors: Map<string, { count: number; totalRank: number }>
    history: { date: string; rank: number; isMentioned: boolean }[]
  }>()

  // Initialize keyword map
  keywordsList.forEach((kw: Keyword) => {
    keywordStatsMap.set(kw.id, {
      totalScans: 0,
      mentions: 0,
      totalRank: 0,
      totalSentiment: 0,
      competitors: new Map(),
      history: []
    })
  })

  // Process AI search results
  aiSearchList.forEach((scan: AiSearch) => {
    // Model Stats
    const modelName = scan.modelUsed?.split(' (ICP:')[0] || scan.modelUsed || 'Unknown'
    if (!modelMap.has(modelName)) modelMap.set(modelName, { total: 0, mentioned: 0 })
    const modelStats = modelMap.get(modelName)!
    modelStats.total++
    if (scan.isMentioned) modelStats.mentioned++

    // Keyword Stats
    const kwStats = scan.keywordId ? keywordStatsMap.get(scan.keywordId) : undefined
    if (kwStats) {
      kwStats.totalScans++
      if (scan.isMentioned) {
        kwStats.mentions++
        kwStats.totalRank += (scan.rank || 0)
      }
      kwStats.history.push({
        date: scan.createdAt?.toISOString() || new Date().toISOString(),
        rank: scan.rank || 0,
        isMentioned: scan.isMentioned || false
      })
    }

    // Competitors
    const urlsFound = scan.urlsFound as Array<{ link?: string; rank?: number; title?: string } | string> | null
    if (Array.isArray(urlsFound)) {
      urlsFound.forEach((urlItem) => {
        try {
          const link = typeof urlItem === 'string' ? urlItem : urlItem?.link
          if (!link || typeof link !== 'string') return

          const hostname = new URL(link).hostname.replace('www.', '')
          if (hostname === projectHostname) return

          // Global Competitor
          if (!globalCompetitorMap.has(hostname)) {
            globalCompetitorMap.set(hostname, { count: 0, totalRank: 0 })
          }
          const globalComp = globalCompetitorMap.get(hostname)!
          globalComp.count++
          globalComp.totalRank += (typeof urlItem === 'object' ? (urlItem.rank || 0) : 0)

          // Keyword Specific Competitor
          if (kwStats) {
            if (!kwStats.competitors.has(hostname)) {
              kwStats.competitors.set(hostname, { count: 0, totalRank: 0 })
            }
            const kwComp = kwStats.competitors.get(hostname)!
            kwComp.count++
            kwComp.totalRank += (typeof urlItem === 'object' ? (urlItem.rank || 0) : 0)
          }
        } catch {
          // Ignore invalid URLs
        }
      })
    }
  })

  // Format Results
  const models = Array.from(modelMap.entries()).map(([name, stats]) => ({
    name,
    total: stats.total,
    mentioned: stats.mentioned
  }))

  const competitors = Array.from(globalCompetitorMap.entries())
    .map(([domain, stats]) => ({
      domain,
      count: stats.count,
      avgRank: stats.count > 0 ? Math.round((stats.totalRank / stats.count) * 10) / 10 : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const recentMentions = aiSearchList.slice(0, 10).map((s: AiSearch) => ({
    id: s.id,
    query: s.query,
    engine: s.modelUsed?.split(' (ICP:')[0] || s.modelUsed || 'Unknown',
    response: s.response || '',
    createdAt: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '',
    rank: s.rank || 0,
    isMentioned: s.isMentioned || false
  }))

  const searchDetails = aiSearchList.slice(0, 50).map((s: AiSearch) => {
    const urlsFound = s.urlsFound as Array<{ link?: string; rank?: number; title?: string } | string> | null
    return {
      id: s.id,
      query: s.query,
      engine: s.modelUsed?.split(' (ICP:')[0] || s.modelUsed || 'Unknown',
      response: s.response || '',
      rank: s.rank || 0,
      isMentioned: s.isMentioned || false,
      urlsFound: Array.isArray(urlsFound) ? urlsFound.map((u) => {
        const link = typeof u === 'string' ? u : u?.link
        return {
          title: (typeof u === 'object' ? u?.title : '') || '',
          link: typeof link === 'string' ? link : '',
          rank: (typeof u === 'object' ? u?.rank : 0) || 0
        }
      }) : [],
      createdAt: s.createdAt ? new Date(s.createdAt).toLocaleString() : ''
    }
  })

  const keywordsData: KeywordData[] = keywordsList.map((k: Keyword) => {
    const stats = keywordStatsMap.get(k.id)

    if (!stats) {
      return {
        id: k.id,
        term: k.term,
        keywords: k.keywords || '',
        keywordsTags: k.keywordsTags || '',
        totalScans: 0,
        visibilityRate: 0,
        avgRank: 0,
        competitors: [],
        history: []
      }
    }

    const topCompetitors = Array.from(stats.competitors.entries())
      .map(([domain, data]) => ({
        domain,
        count: data.count,
        avgRank: data.count > 0 ? Math.round((data.totalRank / data.count) * 10) / 10 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      id: k.id,
      term: k.term,
      keywords: k.keywords || '',
      keywordsTags: k.keywordsTags || '',
      totalScans: stats.totalScans,
      visibilityRate: stats.totalScans > 0 ? Math.round((stats.mentions / stats.totalScans) * 100) : 0,
      avgRank: stats.mentions > 0 ? Math.round((stats.totalRank / stats.mentions) * 10) / 10 : 0,
      competitors: topCompetitors,
      history: stats.history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }
  })

  // Calculate overview metrics
  const mentionedScans = aiSearchList.filter((s: AiSearch) => s.isMentioned)
  const totalScans = aiSearchList.length
  const mentionCount = mentionedScans.length

  return {
    overview: {
      totalScans,
      mentionCount,
      visibilityRate: totalScans > 0 ? Math.round((mentionCount / totalScans) * 100) : 0,
      averageRank: mentionCount > 0
        ? Math.round((mentionedScans.reduce((acc: number, curr: AiSearch) => acc + (curr.rank || 0), 0) / mentionCount) * 10) / 10
        : 0,
    },
    models,
    competitors,
    recentMentions,
    crawlerLogs: crawlerLogs.map((v: CrawlerVisit) => ({
      id: v.id,
      botName: v.botName,
      path: v.path,
      createdAt: v.createdAt ? new Date(v.createdAt).toLocaleString() : '',
      source: v.source || 'cloudflare'
    })),
    keywords: keywordsData,
    searchDetails,
    // Add detailed analytics from crawler visits
    deviceBreakdown: crawlerAnalytics.deviceBreakdown.map((d) => ({
      deviceType: d.deviceType || 'unknown',
      count: d.count
    })),
    referrerBreakdown: crawlerAnalytics.referrerBreakdown.map((r) => ({
      referrer: r.referrer || 'unknown',
      count: r.count
    })),
    socialBreakdown: crawlerAnalytics.socialBreakdown.map((s) => ({
      referrer: s.referrer || 'unknown',
      count: s.count
    })),
    botActivity: crawlerAnalytics.botActivity.map((b) => ({
      botName: b.botName || 'unknown',
      botType: b.botType || 'unknown',
      count: b.count
    })),
    aiSearchStats: {
      mentions: crawlerAnalytics.aiSearchStats.mentions.map((m) => ({
        date: m.date,
        count: m.count,
        mentionedCount: m.mentionedCount
      }))
    }
  }
}

/**
 * Get analytics data for the dashboard
 */
export async function getAnalyticsDataForProject(projectId: string, filters: DashboardFilters = {}) {
  return getDashboardAnalytics(projectId, filters)
}
