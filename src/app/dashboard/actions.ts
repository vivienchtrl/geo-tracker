'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Keyword } from '../../../supabase/functions/scan-ai-mentions/actions/keywords'

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
  keywords: KeywordData[]
  searchDetails: SearchDetail[] // Adding this to support detailed view per search
}

export async function getDashboardData(): Promise<DashboardMetrics> {
  const cookieStore = await cookies()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient(cookieStore as any) 
  
  // 1. Get current user & project
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get the first project for now (or handling context if multiple projects exist)
  const { data: projects } = await supabase
    .from('projects')
    .select('id, url')
    .eq('owner_id', user.id)
    .limit(1)

  if (!projects || projects.length === 0) {
    return {
      overview: { totalScans: 0, mentionCount: 0, visibilityRate: 0, averageRank: 0, sentimentScore: 0 },
      models: [],
      competitors: [],
      recentMentions: [],
      keywords: [],
      searchDetails: []
    }
  }

  const project = projects[0]
  const projectUrl = new URL(project.url).hostname.replace('www.', '')

  // 2. Fetch AI Search results and Keywords
  // Parallel fetch for better performance
  const [scansResult, keywordsResult] = await Promise.all([
    supabase
      .from('ai_search')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('keywords')
      .select('*')
      .eq('project_id', project.id)
      .eq('is_active', true)
  ])

  const scans = scansResult.data || []
  const keywordsList = keywordsResult.data || []

  if (scans.length === 0) {
     return {
        overview: { totalScans: 0, mentionCount: 0, visibilityRate: 0, averageRank: 0, sentimentScore: 0 },
        models: [],
        competitors: [],
        recentMentions: [],
        keywords: keywordsList.map((k: Keyword) => ({
            id: k.id.toString() || '',
            term: k.term,
            totalScans: 0,
            visibilityRate: 0,
            avgRank: 0,
            sentimentScore: 0,
            competitors: [],
            history: []
        })),
        searchDetails: []
      }
  }

  // 3. Process Scans (Normalize Mentions)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scansWithMention = scans.map((scan: any) => {
    let isDomainMentioned = false
    if (Array.isArray(scan.urls_found)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      isDomainMentioned = scan.urls_found.some((u: any) => {
        const link = typeof u === 'string' ? u : u?.link
        if (!link || typeof link !== 'string') return false
        try {
          const urlHostname = new URL(link).hostname.replace('www.', '')
          return urlHostname === projectUrl || urlHostname.endsWith('.' + projectUrl)
        } catch {
          return false
        }
      })
    }
    if (!isDomainMentioned && scan.is_mentioned) {
        isDomainMentioned = true
    }
    return { ...scan, isDomainMentioned }
  })

  // --- Global Stats ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mentions = scansWithMention.filter((s: any) => s.isDomainMentioned)
  const mentionCount = mentions.length
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalRank = mentions.reduce((acc: number, curr: any) => acc + (curr.rank || 0), 0)
  const averageRank = mentionCount > 0 ? Math.round((totalRank / mentionCount) * 10) / 10 : 0

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalSentiment = mentions.reduce((acc: number, curr: any) => acc + (curr.sentiment_score || 0), 0)
  const sentimentScore = mentionCount > 0 ? Math.round(totalSentiment / mentionCount) : 0

  // --- Aggregation Maps ---
  const modelMap = new Map<string, { total: number; mentioned: number }>()
  const sentimentMap = new Map<string, { positive: number; neutral: number; negative: number }>()
  const globalCompetitorMap = new Map<string, { count: number; totalRank: number }>()

  // --- Keyword Aggregation ---
  const keywordStatsMap = new Map<string, {
    totalScans: number
    mentions: number
    totalRank: number
    totalSentiment: number
    competitors: Map<string, { count: number; totalRank: number }>
    history: { date: string; rank: number; isMentioned: boolean }[]
  }>()

  // Initialize keyword map
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  keywordsList.forEach((kw: any) => {
    keywordStatsMap.set(kw.id, {
        totalScans: 0,
        mentions: 0,
        totalRank: 0,
        totalSentiment: 0,
        competitors: new Map(),
        history: []
    })
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  scansWithMention.forEach((scan: any) => {
    // 1. Model Stats
    const modelName = scan.model_used.split(' (ICP:')[0] || scan.model_used
    if (!modelMap.has(modelName)) modelMap.set(modelName, { total: 0, mentioned: 0 })
    const modelStats = modelMap.get(modelName)!
    modelStats.total++
    if (scan.isDomainMentioned) modelStats.mentioned++

    // 2. Sentiment Stats
    if (!sentimentMap.has(modelName)) sentimentMap.set(modelName, { positive: 0, neutral: 0, negative: 0 })
    const sentimentStats = sentimentMap.get(modelName)!
    if (scan.sentiment_label === 'positive') sentimentStats.positive++
    else if (scan.sentiment_label === 'negative') sentimentStats.negative++
    else sentimentStats.neutral++

    // 3. Competitors (Global) & 4. Keyword Specific Stats
    const kwStats = keywordStatsMap.get(scan.keyword_id) // Get stats object for this scan's keyword

    if (kwStats) {
        kwStats.totalScans++
        if (scan.isDomainMentioned) {
            kwStats.mentions++
            kwStats.totalRank += (scan.rank || 0)
            kwStats.totalSentiment += (scan.sentiment_score || 0)
        }
        kwStats.history.push({
            date: scan.created_at,
            rank: scan.rank || 0,
            isMentioned: scan.isDomainMentioned
        })
    }

    if (Array.isArray(scan.urls_found)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      scan.urls_found.forEach((urlItem: any) => {
        try {
          const link = typeof urlItem === 'string' ? urlItem : urlItem?.link
          if (!link || typeof link !== 'string') return
          
          const hostname = new URL(link).hostname.replace('www.', '')
          
          if (hostname === projectUrl) return

          // Global Competitor
          if (!globalCompetitorMap.has(hostname)) globalCompetitorMap.set(hostname, { count: 0, totalRank: 0 })
          const globalComp = globalCompetitorMap.get(hostname)!
          globalComp.count++
          globalComp.totalRank += (typeof urlItem === 'object' ? (urlItem.rank || 0) : 0)

          // Keyword Specific Competitor
          if (kwStats) {
            if (!kwStats.competitors.has(hostname)) kwStats.competitors.set(hostname, { count: 0, totalRank: 0 })
            const kwComp = kwStats.competitors.get(hostname)!
            kwComp.count++
            kwComp.totalRank += (typeof urlItem === 'object' ? (urlItem.rank || 0) : 0)
          }

        } catch {
          // Ignore
        }
      })
    }
  })

  // --- Formatting Results ---

  // Models
  const models = Array.from(modelMap.entries()).map(([name, stats]) => ({
    name,
    total: stats.total,
    mentioned: stats.mentioned
  }))

  // Competitors (Global Top 10)
  const competitors = Array.from(globalCompetitorMap.entries())
    .map(([domain, stats]) => ({
      domain,
      count: stats.count,
      avgRank: Math.round((stats.totalRank / stats.count) * 10) / 10
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Sentiment Distribution - UNUSED but kept logic for now if needed, removed from return
  // const sentimentDistribution = Array.from(sentimentMap.entries()).map(([engine, stats]) => ({
  //   engine,
  //   positive: stats.positive,
  //   neutral: stats.neutral,
  //   negative: stats.negative
  // }))

  // Recent Mentions (First 10 for detailed view)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentMentions = scansWithMention.slice(0, 10).map((s: any) => ({
    id: s.id,
    query: s.query,
    engine: s.model_used.split(' (ICP:')[0] || s.model_used,
    response: s.response,
    sentimentLabel: s.sentiment_label || 'neutral',
    createdAt: new Date(s.created_at || Date.now()).toLocaleDateString()
  }))

  // Full Search Details (Limit to last 50 for performance, or implement pagination later)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const searchDetails = scansWithMention.slice(0, 50).map((s: any) => ({
    id: s.id,
    query: s.query,
    engine: s.model_used.split(' (ICP:')[0] || s.model_used,
    response: s.response,
    sentimentLabel: s.sentiment_label || 'neutral',
    rank: s.rank,
    isMentioned: s.isDomainMentioned,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    urlsFound: Array.isArray(s.urls_found) ? s.urls_found.map((u: any) => {
        const link = typeof u === 'string' ? u : u?.link
        return {
            title: (typeof u === 'object' ? u?.title : '') || '',
            link: typeof link === 'string' ? link : '',
            rank: (typeof u === 'object' ? u?.rank : 0) || 0
        }
    }) : [],
    createdAt: new Date(s.created_at || Date.now()).toLocaleString()
  }))

  // Keywords Data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const keywordsData: KeywordData[] = keywordsList.map((k: any) => {
    const stats = keywordStatsMap.get(k.id)!
    
    // Sort and slice top 5 competitors for this keyword
    const topCompetitors = Array.from(stats.competitors.entries())
        .map(([domain, data]) => ({
            domain,
            count: data.count,
            avgRank: Math.round((data.totalRank / data.count) * 10) / 10
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

  return {
    overview: {
      totalScans: scans.length,
      mentionCount,
      visibilityRate: Math.round((mentionCount / scans.length) * 100),
      averageRank,
      sentimentScore
    },
    models,
    competitors,
    recentMentions,
    keywords: keywordsData,
    searchDetails
  }
}
