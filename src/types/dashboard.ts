export type DateRange = '24h' | '7d' | '30d' | '90d' | 'all';

export interface DashboardFilters {
  // Time
  dateRange?: DateRange;
  startDate?: Date;
  endDate?: Date;

  // AI Monitoring
  keyword?: string; // keywordId for filtering
  llmModel?: string; // Filter by single model (legacy)
  llmModels?: string[]; // Filter by multiple models (multi-select)
  searchQuery?: string; // Filter by specific prompt/query
  sentiment?: 'positive' | 'neutral' | 'negative';
  competitor?: string; // competitor domain for filtering

  // Traffic / Analytics
  device?: string; // 'mobile', 'desktop'
  country?: string; // 'US', 'FR'
  referrer?: string; // 'google.com'
  utmCampaign?: string;
  browser?: string;
  os?: string;
}

export const getDateRangeDate = (range: DateRange = '30d'): Date => {
  const date = new Date();
  switch (range) {
    case '24h':
      date.setHours(date.getHours() - 24);
      break;
    case '7d':
      date.setDate(date.getDate() - 7);
      break;
    case '30d':
      date.setDate(date.getDate() - 30);
      break;
    case '90d':
      date.setDate(date.getDate() - 90);
      break;
    case 'all':
      date.setFullYear(2000); // Far past
      break;
    default:
      date.setDate(date.getDate() - 30);
  }
  return date;
};

// Dashboard Metrics Types
export type KeywordData = {
  id: string
  term: string
  keywords: string
  keywordsTags: string
  totalScans: number
  visibilityRate: number
  avgRank: number
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
  // Detailed Analytics (from Geo-Tracker)
  deviceBreakdown?: { deviceType: string; count: number }[]
  locationBreakdown?: { name: string; code?: string; count: number }[]
  cityBreakdown?: { name: string; count: number }[]
  referrerBreakdown?: { referrer: string; count: number }[]
  socialBreakdown?: { referrer: string; count: number }[]
  botActivity?: { botName: string; botType: string; count: number }[]
  aiSearchStats?: { 
    mentions: { date: string; count: number; mentionedCount: number }[]
  }
}

/**
 * AI Monitoring Dashboard Types
 */

export type AIMonitoringState = {
  filters: DashboardFilters
  selectedKeyword?: string // keywordId
  selectedModels?: string[] // modelNames (multi-select)
  selectedCompetitor?: string // domain
}

export type AIMetricCard = {
  label: string
  value: string | number
  suffix?: string
  change?: {
    value: number
    trend: 'up' | 'down' | 'stable'
  }
  icon?: React.ReactNode
}

export type AIKeywordMetric = {
  keyword: string
  totalScans: number
  mentions: number
  visibilityRate: number
  avgRank: number
  history: Array<{
    date: string
    isMentioned: boolean
    rank: number
  }>
}

export type AIModelMetric = {
  model: string
  totalScans: number
  mentions: number
  mentionRate: number
  avgRank: number
}

export type AICompetitorInsight = {
  domain: string
  mentions: number
  avgRank: number
  modelsFound: string[]
}

