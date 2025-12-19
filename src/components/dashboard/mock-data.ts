
export interface AEOMetrics {
  totalMentions: number;
  sentimentScore: number; // 0-100
  shareOfVoice: number; // percentage
  citationCount: number;
  mentionsChange: number; // percentage change
  sentimentChange: number;
  shareOfVoiceChange: number;
  citationChange: number;
}

export interface DailyVisibility {
  date: string;
  chatgpt: number;
  perplexity: number;
  google: number; // SGE/Overviews
  claude: number;
}

export interface SentimentData {
  engine: string;
  positive: number;
  neutral: number;
  negative: number;
}

export interface SourceData {
  source: string;
  count: number;
  fill: string;
}

export interface RecentMention {
  id: string;
  query: string;
  engine: 'ChatGPT' | 'Perplexity' | 'Google SGE' | 'Claude';
  answerSummary: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  date: string;
}

export interface GeoData {
  country: string;
  code: string; // ISO Code for flags/maps
  visitors: number;
  percentage: number;
}

export const geoData: GeoData[] = [
  { country: "United States", code: "US", visitors: 450, percentage: 45 },
  { country: "United Kingdom", code: "GB", visitors: 120, percentage: 12 },
  { country: "Germany", code: "DE", visitors: 85, percentage: 8.5 },
  { country: "France", code: "FR", visitors: 70, percentage: 7 },
  { country: "Canada", code: "CA", visitors: 65, percentage: 6.5 },
  { country: "India", code: "IN", visitors: 50, percentage: 5 },
  { country: "Australia", code: "AU", visitors: 40, percentage: 4 },
];

export interface GSCData {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export const gscData: GSCData[] = [
  { date: "2024-01-01", clicks: 120, impressions: 2500, ctr: 4.8, position: 12.5 },
  { date: "2024-01-02", clicks: 135, impressions: 2700, ctr: 5.0, position: 12.1 },
  { date: "2024-01-03", clicks: 110, impressions: 2300, ctr: 4.7, position: 12.8 },
  { date: "2024-01-04", clicks: 145, impressions: 2900, ctr: 5.0, position: 11.9 },
  { date: "2024-01-05", clicks: 160, impressions: 3200, ctr: 5.0, position: 11.5 },
  { date: "2024-01-06", clicks: 150, impressions: 3000, ctr: 5.0, position: 11.8 },
  { date: "2024-01-07", clicks: 175, impressions: 3500, ctr: 5.0, position: 11.2 },
];

export interface TrafficData {
  date: string;
  sessions: number;
  aiReferrals: number; // Trafic venant des IA
}

export const trafficData: TrafficData[] = [
  { date: "2024-01-01", sessions: 450, aiReferrals: 45 },
  { date: "2024-01-02", sessions: 480, aiReferrals: 52 },
  { date: "2024-01-03", sessions: 420, aiReferrals: 38 },
  { date: "2024-01-04", sessions: 520, aiReferrals: 65 },
  { date: "2024-01-05", sessions: 580, aiReferrals: 75 },
  { date: "2024-01-06", sessions: 550, aiReferrals: 70 },
  { date: "2024-01-07", sessions: 600, aiReferrals: 85 },
];

export const aeoMetrics: AEOMetrics = {
  totalMentions: 1248,
  sentimentScore: 78,
  shareOfVoice: 32,
  citationCount: 456,
  mentionsChange: 12,
  sentimentChange: 4,
  shareOfVoiceChange: -2,
  citationChange: 8,
};

export const visibilityData: DailyVisibility[] = [
  { date: "2024-01-01", chatgpt: 45, perplexity: 30, google: 55, claude: 20 },
  { date: "2024-01-05", chatgpt: 50, perplexity: 35, google: 58, claude: 25 },
  { date: "2024-01-10", chatgpt: 55, perplexity: 40, google: 60, claude: 28 },
  { date: "2024-01-15", chatgpt: 60, perplexity: 45, google: 65, claude: 35 },
  { date: "2024-01-20", chatgpt: 58, perplexity: 42, google: 62, claude: 32 },
  { date: "2024-01-25", chatgpt: 65, perplexity: 48, google: 70, claude: 38 },
  { date: "2024-01-30", chatgpt: 70, perplexity: 55, google: 75, claude: 45 },
];

export const sentimentData: SentimentData[] = [
  { engine: "ChatGPT", positive: 65, neutral: 25, negative: 10 },
  { engine: "Perplexity", positive: 55, neutral: 35, negative: 10 },
  { engine: "Google SGE", positive: 70, neutral: 20, negative: 10 },
  { engine: "Claude", positive: 60, neutral: 30, negative: 10 },
];

export const sourceData: SourceData[] = [
  { source: "Documentation", count: 450, fill: "var(--color-documentation)" },
  { source: "Blog Posts", count: 320, fill: "var(--color-blog)" },
  { source: "Case Studies", count: 150, fill: "var(--color-case-studies)" },
  { source: "Pricing Page", count: 80, fill: "var(--color-pricing)" },
  { source: "Other", count: 50, fill: "var(--color-other)" },
];

export const recentMentions: RecentMention[] = [
  {
    id: "1",
    query: "best geo aeo tracking software",
    engine: "Perplexity",
    answerSummary: "Mentioned as a top contender for granular tracking.",
    sentiment: "Positive",
    date: "2024-02-14",
  },
  {
    id: "2",
    query: "how to track llm mentions",
    engine: "ChatGPT",
    answerSummary: "Listed as a recommended tool for marketing teams.",
    sentiment: "Positive",
    date: "2024-02-14",
  },
  {
    id: "3",
    query: "geo tracker vs competitors",
    engine: "Google SGE",
    answerSummary: "Comparison highlights robust API but higher price.",
    sentiment: "Neutral",
    date: "2024-02-13",
  },
  {
    id: "4",
    query: "ai search optimization tools",
    engine: "Claude",
    answerSummary: "Brief mention in the tools list.",
    sentiment: "Neutral",
    date: "2024-02-12",
  },
  {
    id: "5",
    query: "geo tracker reviews",
    engine: "Perplexity",
    answerSummary: "Summarized G2 reviews, generally positive.",
    sentiment: "Positive",
    date: "2024-02-10",
  },
];

