/**
 * Analytics Feature - Public API (Human Traffic)
 *
 * Export only what's needed by consumers
 * Keep internal implementation details hidden
 */

// Types
export type { AnalyticsContextType } from "./types";
export type {
  AnalyticsFilters,
  AnalyticsTab,
  AnalyticsKPIs,
  TimelineData,
  DeviceBreakdownData,
  GeoBreakdownData,
  ReferrerBreakdownData,
  SourceBreakdownData,
  TopPageData,
} from "./types";

// Provider
export { AnalyticsProvider } from "./providers/analytics-provider";

// Hooks
export {
  useAnalytics,
  useSelectedDevice,
  useSelectedCountry,
  useSelectedReferrer,
  useFilteredVisits,
  useAnalyticsLoading,
  useAnalyticsKPIs,
  useAnalyticsCharts,
  useAnalyticsPagination,
  useDeviceBreakdown,
  useGeoBreakdown,
  useReferrerBreakdown,
} from "./hooks/use-analytics";
