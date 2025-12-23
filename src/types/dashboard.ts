export type DateRange = '24h' | '7d' | '30d' | '90d' | 'all';

export interface DashboardFilters {
  // Time
  dateRange?: DateRange;
  startDate?: Date;
  endDate?: Date;

  // AI Monitoring
  llmModel?: string; // Filter by 'gpt-4', 'claude-3', etc.
  searchQuery?: string; // Filter by specific prompt/query
  sentiment?: 'positive' | 'neutral' | 'negative';
  
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
  // Detailed Analytics (from Geo-Tracker)
  deviceBreakdown?: { deviceType: string; count: number }[]
  locationBreakdown?: { name: string; code?: string; count: number }[]
  cityBreakdown?: { name: string; count: number }[]
  referrerBreakdown?: { referrer: string; count: number }[]
  socialBreakdown?: { referrer: string; count: number }[]
  botActivity?: { botName: string; botType: string; count: number }[]
  aiSearchStats?: { 
    mentions: { date: string; count: number; mentionedCount: number }[]
    sentiment: { label: string; count: number }[]
  }
}
