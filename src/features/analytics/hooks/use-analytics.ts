/**
 * Analytics Custom Hooks (Human Traffic)
 *
 * Purpose: Provide easy access to analytics context and data
 * Usage: const { visits, kpis, loadMore } = useAnalytics()
 */

import { useContext } from "react";
import { AnalyticsContext } from "../providers/analytics-provider";
import type { AnalyticsContextType } from "../types";

/**
 * Main hook to access Analytics context
 * Must be used within AnalyticsProvider
 */
export function useAnalytics(): AnalyticsContextType {
  const context = useContext(AnalyticsContext);

  if (!context) {
    throw new Error("useAnalytics must be used within AnalyticsProvider");
  }

  return context;
}

/**
 * Hook to get selected device
 */
export function useSelectedDevice(): string | undefined {
  const { selectedDevice } = useAnalytics();
  return selectedDevice;
}

/**
 * Hook to get selected country
 */
export function useSelectedCountry(): string | undefined {
  const { selectedCountry } = useAnalytics();
  return selectedCountry;
}

/**
 * Hook to get selected referrer
 */
export function useSelectedReferrer(): string | undefined {
  const { selectedReferrer } = useAnalytics();
  return selectedReferrer;
}

/**
 * Hook to filter visits based on current selection
 */
export function useFilteredVisits() {
  const { visits, selectedDevice, selectedCountry, selectedReferrer } =
    useAnalytics();

  return visits.filter((visit) => {
    // Filter by device if selected
    if (selectedDevice && visit.deviceType !== selectedDevice) {
      return false;
    }

    // Filter by country if selected
    if (selectedCountry && visit.countryCode !== selectedCountry) {
      return false;
    }

    // Filter by referrer if selected
    if (selectedReferrer && visit.referrerDomain !== selectedReferrer) {
      return false;
    }

    return true;
  });
}

/**
 * Hook to get loading state
 */
export function useAnalyticsLoading(): boolean {
  const { isLoading } = useAnalytics();
  return isLoading;
}

/**
 * Hook to get KPIs
 */
export function useAnalyticsKPIs() {
  const { kpis } = useAnalytics();
  return kpis;
}

/**
 * Hook to get chart data
 */
export function useAnalyticsCharts() {
  const { timeline, deviceBreakdown, geoBreakdown, referrerBreakdown, sourceBreakdown } =
    useAnalytics();
  return { timeline, deviceBreakdown, geoBreakdown, referrerBreakdown, sourceBreakdown };
}

/**
 * Hook for pagination
 */
export function useAnalyticsPagination() {
  const { hasMore, isLoadingMore, loadMore } = useAnalytics();
  return { hasMore, isLoadingMore, loadMore };
}

/**
 * Hook for device breakdown only
 */
export function useDeviceBreakdown() {
  const { deviceBreakdown } = useAnalytics();
  return deviceBreakdown;
}

/**
 * Hook for geo breakdown only
 */
export function useGeoBreakdown() {
  const { geoBreakdown } = useAnalytics();
  return geoBreakdown;
}

/**
 * Hook for referrer breakdown only
 */
export function useReferrerBreakdown() {
  const { referrerBreakdown } = useAnalytics();
  return referrerBreakdown;
}
