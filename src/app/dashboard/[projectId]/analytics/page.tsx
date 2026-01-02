/**
 * Analytics Dashboard Page (Human Traffic)
 *
 * Server component that fetches data and renders the dashboard
 * Displays human visitor traffic analytics
 */

import { notFound } from "next/navigation";
import { getCurrentUser } from "@/backend/services/user-service";
import { getProjectWithRole } from "@/backend/services/project-service";
import {
  getPageVisits,
  getAnalyticsKPIs,
  getAnalyticsTimeline,
  getDeviceBreakdown,
  getGeoBreakdown,
  getReferrerBreakdown,
  getSourceBreakdown,
  getPathBreakdown,
  getOsBreakdown,
  getBrowserBreakdown,
} from "@/backend/services/page-visits.service";
import { AnalyticsProvider } from "@/features/analytics/providers/analytics-provider";
import { AnalyticsDashboard } from "@/features/analytics/components/analytics-dashboard";

interface AnalyticsPageProps {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{
    period?: "7d" | "30d" | "90d" | "12m";
    startDate?: string;
    endDate?: string;
    device?: string;
    country?: string;
    referrer?: string;
  }>;
}

function getDateRangeFromPeriod(period: string = "30d"): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case "7d":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "90d":
      startDate.setDate(startDate.getDate() - 90);
      break;
    case "12m":
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30);
  }

  return { startDate, endDate };
}

export default async function AnalyticsPage({
  params,
  searchParams,
}: AnalyticsPageProps) {
  const { projectId } = await params;
  const search = await searchParams;

  const user = await getCurrentUser();
  if (!user) notFound();

  const projectData = await getProjectWithRole(projectId, user.id);
  if (!projectData) notFound();

  // Parse date filters - use period or explicit dates
  const period = search.period || "30d";
  const dateRange = getDateRangeFromPeriod(period);
  const startDate = search.startDate ? new Date(search.startDate) : dateRange.startDate;
  const endDate = search.endDate ? new Date(search.endDate) : dateRange.endDate;

  // Fetch all data in parallel
  const [
    visitsData,
    kpis,
    timeline,
    deviceBreakdown,
    geoBreakdown,
    referrerBreakdown,
    sourceBreakdown,
    pathBreakdown,
    osBreakdown,
    browserBreakdown,
  ] = await Promise.all([
    getPageVisits(projectId, {
      startDate,
      endDate,
      device: search.device,
      country: search.country,
      referrer: search.referrer,
      limit: 20,
    }),
    getAnalyticsKPIs(projectId, { startDate, endDate }),
    getAnalyticsTimeline(projectId, { startDate, endDate }),
    getDeviceBreakdown(projectId, { startDate, endDate }),
    getGeoBreakdown(projectId, { startDate, endDate }),
    getReferrerBreakdown(projectId, { startDate, endDate }),
    getSourceBreakdown(projectId, { startDate, endDate }),
    getPathBreakdown(projectId, { startDate, endDate }),
    getOsBreakdown(projectId, { startDate, endDate }),
    getBrowserBreakdown(projectId, { startDate, endDate }),
  ]);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-8 py-12 border-b border-dashed border-border/80 bg-muted/5">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase">
            Analytics
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <div className="h-px w-8 bg-primary/50" />
            <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em]">
              Human Visitor Traffic
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Content wrapped in Provider */}
      <AnalyticsProvider
        projectId={projectId}
        initialData={{
          visits: visitsData.visits,
          hasMore: visitsData.hasMore,
          kpis,
          timeline,
          deviceBreakdown,
          geoBreakdown,
          referrerBreakdown,
          sourceBreakdown,
          pathBreakdown,
          osBreakdown,
          browserBreakdown,
        }}
        initialFilters={{
          startDate,
          endDate,
          device: search.device,
          country: search.country,
          referrer: search.referrer,
        }}
        initialTimePeriod={period as "7d" | "30d" | "90d" | "12m"}
      >
        <AnalyticsDashboard />
      </AnalyticsProvider>
    </div>
  );
}
