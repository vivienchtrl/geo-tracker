"use client";

/**
 * Analytics Provider (Human Traffic)
 *
 * Manages:
 * - Filter state (device, country, referrer, date range)
 * - Visits data with pagination
 * - KPIs and chart data
 * - Smooth transitions without page reloads
 *
 * Strategy:
 * - useTransition() for async filter updates
 * - useCallback() to prevent unnecessary re-renders
 * - Context to share state with all child components
 */

import React, {
  createContext,
  useCallback,
  useState,
  useTransition,
  useMemo,
} from "react";
import type { PageVisit } from "@/types/db";
import type {
  AnalyticsContextType,
  AnalyticsFilters,
  AnalyticsKPIs,
  TimelineData,
  DeviceBreakdownData,
  GeoBreakdownData,
  ReferrerBreakdownData,
  SourceBreakdownData,
  PathBreakdownData,
  OsBreakdownData,
  BrowserBreakdownData,
  AnalyticsTimePeriod,
} from "../types";
import { getPageVisitsAction } from "../actions";

export const AnalyticsContext = createContext<AnalyticsContextType | null>(
  null
);

interface AnalyticsProviderProps {
  children: React.ReactNode;
  projectId: string;
  initialData: {
    visits: PageVisit[];
    hasMore: boolean;
    kpis: AnalyticsKPIs;
    timeline: TimelineData[];
    deviceBreakdown: DeviceBreakdownData[];
    geoBreakdown: GeoBreakdownData[];
    referrerBreakdown: ReferrerBreakdownData[];
    sourceBreakdown: SourceBreakdownData[];
    pathBreakdown: PathBreakdownData[];
    osBreakdown: OsBreakdownData[];
    browserBreakdown: BrowserBreakdownData[];
  };
  initialFilters?: AnalyticsFilters;
  initialTimePeriod?: AnalyticsTimePeriod;
}

/**
 * Provider component
 * Wraps dashboard to provide context to all children
 */
export function AnalyticsProvider({
  children,
  projectId,
  initialData,
  initialFilters = {},
  initialTimePeriod = "30d",
}: AnalyticsProviderProps) {
  // State: Filters
  const [filters, setFilters] = useState<AnalyticsFilters>(initialFilters);
  const [selectedDevice, setSelectedDevice] = useState<string | undefined>();
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>();
  const [selectedReferrer, setSelectedReferrer] = useState<string | undefined>();
  const [timePeriod, setTimePeriod] = useState<AnalyticsTimePeriod>(initialTimePeriod);

  // State: Data
  const [visits, setVisits] = useState<PageVisit[]>(initialData.visits);
  const [hasMore, setHasMore] = useState(initialData.hasMore);
  const [kpis, setKpis] = useState<AnalyticsKPIs>(initialData.kpis);
  const [timeline, setTimeline] = useState<TimelineData[]>(initialData.timeline);
  const [deviceBreakdown, setDeviceBreakdown] = useState<DeviceBreakdownData[]>(
    initialData.deviceBreakdown
  );
  const [geoBreakdown, setGeoBreakdown] = useState<GeoBreakdownData[]>(
    initialData.geoBreakdown
  );
  const [referrerBreakdown, setReferrerBreakdown] = useState<ReferrerBreakdownData[]>(
    initialData.referrerBreakdown
  );
  const [sourceBreakdown, setSourceBreakdown] = useState<SourceBreakdownData[]>(
    initialData.sourceBreakdown
  );
  const [pathBreakdown, setPathBreakdown] = useState<PathBreakdownData[]>(
    initialData.pathBreakdown
  );
  const [osBreakdown, setOsBreakdown] = useState<OsBreakdownData[]>(
    initialData.osBreakdown
  );
  const [browserBreakdown, setBrowserBreakdown] = useState<BrowserBreakdownData[]>(
    initialData.browserBreakdown
  );

  // State: Loading
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Transition for smooth UI updates
  const [isPending, startTransition] = useTransition();

  /**
   * Update filters
   * Triggers refetch of data
   */
  const updateFilters = useCallback(
    (newFilters: Partial<AnalyticsFilters>) => {
      startTransition(async () => {
        setIsLoading(true);
        setError(undefined);

        try {
          setFilters((prev) => ({
            ...prev,
            ...newFilters,
          }));
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to update filters"
          );
        } finally {
          setIsLoading(false);
        }
      });
    },
    []
  );

  /**
   * Select device (for drill-down)
   */
  const selectDevice = useCallback((deviceType?: string) => {
    setSelectedDevice(deviceType);
    setSelectedCountry(undefined);
    setSelectedReferrer(undefined);
  }, []);

  /**
   * Select country (for drill-down)
   */
  const selectCountry = useCallback((countryCode?: string) => {
    setSelectedCountry(countryCode);
    setSelectedDevice(undefined);
    setSelectedReferrer(undefined);
  }, []);

  /**
   * Select referrer (for drill-down)
   */
  const selectReferrer = useCallback((referrerDomain?: string) => {
    setSelectedReferrer(referrerDomain);
    setSelectedDevice(undefined);
    setSelectedCountry(undefined);
  }, []);

  /**
   * Load more visits (pagination)
   */
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setError(undefined);

    try {
      const result = await getPageVisitsAction(projectId, {
        startDate: filters.startDate,
        endDate: filters.endDate,
        device: filters.device,
        country: filters.country,
        referrer: filters.referrer,
        offset: visits.length,
        limit: 20,
      });

      setVisits((prev) => [...prev, ...result.visits]);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load more visits"
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [projectId, filters, visits.length, isLoadingMore, hasMore]);

  /**
   * Refetch all data
   * Called manually or on filter change
   */
  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      const result = await getPageVisitsAction(projectId, {
        startDate: filters.startDate,
        endDate: filters.endDate,
        device: filters.device,
        country: filters.country,
        referrer: filters.referrer,
        limit: 20,
        offset: 0,
      });

      setVisits(result.visits);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refetch data");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, filters]);

  /**
   * Memoize context value to prevent unnecessary re-renders
   */
  const contextValue = useMemo<AnalyticsContextType>(
    () => ({
      filters,
      selectedDevice,
      selectedCountry,
      selectedReferrer,
      timePeriod,
      visits,
      hasMore,
      isLoading: isLoading || isPending,
      isLoadingMore,
      error,
      kpis,
      timeline,
      deviceBreakdown,
      geoBreakdown,
      referrerBreakdown,
      sourceBreakdown,
      pathBreakdown,
      osBreakdown,
      browserBreakdown,
      updateFilters,
      selectDevice,
      selectCountry,
      selectReferrer,
      setTimePeriod,
      loadMore,
      refetch,
    }),
    [
      filters,
      selectedDevice,
      selectedCountry,
      selectedReferrer,
      timePeriod,
      visits,
      hasMore,
      isLoading,
      isPending,
      isLoadingMore,
      error,
      kpis,
      timeline,
      deviceBreakdown,
      geoBreakdown,
      referrerBreakdown,
      sourceBreakdown,
      pathBreakdown,
      osBreakdown,
      browserBreakdown,
      updateFilters,
      selectDevice,
      selectCountry,
      selectReferrer,
      loadMore,
      refetch,
    ]
  );

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}
