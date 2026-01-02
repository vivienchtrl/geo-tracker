/**
 * Analytics Feature Types (Human Traffic)
 *
 * Separate from db.ts to keep feature isolated
 * Imported by components, providers, and hooks
 */

import type { DashboardFilters } from "@/types/dashboard";
import type { PageVisit } from "@/types/db";

/**
 * Time period for analytics
 */
export type AnalyticsTimePeriod = "7d" | "30d" | "90d" | "12m";

/**
 * Path/Page breakdown data
 */
export type PathBreakdownData = {
  path: string;
  title: string;
  views: number;
  uniqueViews: number;
  percentage: number;
};

/**
 * OS breakdown data
 */
export type OsBreakdownData = {
  os: string;
  count: number;
  percentage: number;
};

/**
 * Browser breakdown data
 */
export type BrowserBreakdownData = {
  browser: string;
  count: number;
  percentage: number;
};

/**
 * Context type for AnalyticsProvider
 */
export type AnalyticsContextType = {
  // Filter State
  filters: AnalyticsFilters;
  selectedDevice?: string;
  selectedCountry?: string;
  selectedReferrer?: string;
  timePeriod: AnalyticsTimePeriod;

  // Data
  visits: PageVisit[];
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error?: string;

  // KPIs
  kpis: AnalyticsKPIs;

  // Chart Data
  timeline: TimelineData[];
  deviceBreakdown: DeviceBreakdownData[];
  geoBreakdown: GeoBreakdownData[];
  referrerBreakdown: ReferrerBreakdownData[];
  sourceBreakdown: SourceBreakdownData[];
  pathBreakdown: PathBreakdownData[];
  osBreakdown: OsBreakdownData[];
  browserBreakdown: BrowserBreakdownData[];

  // Filter Actions
  updateFilters: (filters: Partial<AnalyticsFilters>) => void;
  selectDevice: (deviceType?: string) => void;
  selectCountry: (countryCode?: string) => void;
  selectReferrer: (referrerDomain?: string) => void;
  setTimePeriod: (period: AnalyticsTimePeriod) => void;

  // Data Actions
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
};

/**
 * Filters specific to Analytics
 */
export type AnalyticsFilters = Pick<
  DashboardFilters,
  "dateRange" | "startDate" | "endDate"
> & {
  device?: string;
  country?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

/**
 * KPI metrics for analytics dashboard
 */
export type AnalyticsKPIs = {
  totalVisits: number;
  uniqueVisitors: number;
  pageviews: number;
  avgTimeOnPage: number;
  bounceRate: number;
  topCountry: string;
  topDevice: string;
};

/**
 * Timeline chart data
 */
export type TimelineData = {
  date: string;
  visits: number;
  uniqueVisitors: number;
  pageviews: number;
};

/**
 * Device breakdown chart data
 */
export type DeviceBreakdownData = {
  deviceType: string;
  count: number;
  percentage: number;
};

/**
 * Geographic breakdown data
 */
export type GeoBreakdownData = {
  countryCode: string;
  country: string;
  count: number;
  percentage: number;
};

/**
 * Referrer breakdown data
 */
export type ReferrerBreakdownData = {
  referrerDomain: string;
  count: number;
  percentage: number;
};

/**
 * Source/UTM breakdown data
 */
export type SourceBreakdownData = {
  source: string;
  medium: string;
  count: number;
  percentage: number;
};

/**
 * Tab type for Analytics dashboard
 */
export type AnalyticsTab = "overview" | "pages" | "sources" | "geo" | "devices";

/**
 * Top pages data
 */
export type TopPageData = {
  path: string;
  title: string;
  views: number;
  uniqueViews: number;
  avgTimeOnPage: number;
};
