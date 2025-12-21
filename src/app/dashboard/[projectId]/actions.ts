'use server'

import { db } from '@/backend/db/db'
import { keywords, aiSearch, project, pageVisits } from '@/backend/db/tables/schema'
import { eq, desc, isNotNull, and } from 'drizzle-orm'
import { getDashboardAnalytics } from '@/backend/services/dashboard.service'
import type { AiSearch, Keyword, PageVisit } from '@/types/db'

export type KeywordData = {
  id: string
  term: string
  totalScans: number
  visibilityRate: number
  avgRank: number
  sentimentScore: number
  competitors: {
    domain: string
    count: number
    avgRank: number
  }[]
  history: {
    date: string
    rank: number
    isMentioned: boolean
  }[]
}

export type SearchDetail = {
  id: string
  query: string
  engine: string
  response: string
  sentimentLabel: string
  rank: number
  isMentioned: boolean
  urlsFound: {
    title: string
    link: string
    rank: number
  }[]
  createdAt: string
}

export type DashboardMetrics = {
  overview: {
    totalScans: number
    mentionCount: number
    visibilityRate: number
    averageRank: number
    sentimentScore: number
  }
  models: {
    name: string
    total: number
    mentioned: number
  }[]
  competitors: {
    domain: string
    count: number
    avgRank: number
  }[]
  recentMentions: {
    id: string
    query: string
    engine: string
    response: string
    sentimentLabel: string
    createdAt: string
  }[]
  crawlerLogs: {
    id: string
    botName: string
    path: string
    createdAt: string
    source: string
  }[]
  keywords: KeywordData[]
  searchDetails: SearchDetail[]
}

/**
 * Get AI metrics data for a specific project
 * Fetches aiSearch and keywords directly
 */
async function getAiMetricsData(projectId: string) {
  const [keywordsList, aiSearchList, projectData, crawlerVisits] = await Promise.all([
    db.query.keywords.findMany({
      where: eq(keywords.projectId, projectId),
      orderBy: desc(keywords.createdAt)
    }),
    db.query.aiSearch.findMany({
      where: eq(aiSearch.projectId, projectId),
      orderBy: desc(aiSearch.createdAt)
    }),
    db.query.project.findFirst({
      where: eq(project.id, projectId)
    }),
    db.query.pageVisits.findMany({
      where: and(
        eq(pageVisits.projectId, projectId),
        isNotNull(pageVisits.isBot)
      ),
      orderBy: desc(pageVisits.createdAt),
      limit: 20
    })
  ])

  return { keywordsList, aiSearchList, projectUrl: projectData?.url || '', crawlerVisits }
}

/**
 * Get dashboard data for a specific project
 */
export async function getDashboardDataForProject(projectId: string): Promise<DashboardMetrics> {
  // Fetch AI-specific data
  const { keywordsList, aiSearchList, projectUrl, crawlerVisits } = await getAiMetricsData(projectId)

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
        kwStats.totalSentiment += (scan.sentimentScore || 0)
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
    sentimentLabel: s.sentimentLabel || 'neutral',
    createdAt: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ''
  }))

  const searchDetails = aiSearchList.slice(0, 50).map((s: AiSearch) => {
    const urlsFound = s.urlsFound as Array<{ link?: string; rank?: number; title?: string } | string> | null
    return {
      id: s.id,
      query: s.query,
      engine: s.modelUsed?.split(' (ICP:')[0] || s.modelUsed || 'Unknown',
      response: s.response || '',
      sentimentLabel: s.sentimentLabel || 'neutral',
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
        totalScans: 0,
        visibilityRate: 0,
        avgRank: 0,
        sentimentScore: 0,
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
      totalScans: stats.totalScans,
      visibilityRate: stats.totalScans > 0 ? Math.round((stats.mentions / stats.totalScans) * 100) : 0,
      avgRank: stats.mentions > 0 ? Math.round((stats.totalRank / stats.mentions) * 10) / 10 : 0,
      sentimentScore: stats.mentions > 0 ? Math.round(stats.totalSentiment / stats.mentions) : 0,
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
      sentimentScore: mentionCount > 0 
        ? Math.round(mentionedScans.reduce((acc: number, curr: AiSearch) => acc + (curr.sentimentScore || 0), 0) / mentionCount) 
        : 0
    },
    models,
    competitors,
    recentMentions,
    crawlerLogs: crawlerVisits.map((v: PageVisit) => ({
      id: v.id,
      botName: v.botName || v.isBot || 'Unknown Bot',
      path: v.path,
      createdAt: v.createdAt ? new Date(v.createdAt).toLocaleString() : '',
      source: (v.metadata as any)?.source || 'javascript'
    })),
    keywords: keywordsData,
    searchDetails
  }
}

/**
 * Get analytics data (GSC, GA4, Traffic) for the dashboard
 * This is separate from AI metrics
 */
export async function getAnalyticsDataForProject(projectId: string) {
  return getDashboardAnalytics(projectId)
}
