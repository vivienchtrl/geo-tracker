/**
 * AI Monitoring Dashboard Page
 *
 * Server Component that:
 * 1. Fetches all data in parallel
 * 2. Wraps in AIMonitoringProvider
 * 3. Renders AIMonitoringDashboard
 *
 * Supports URL filters via searchParams
 */

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DashboardFilters, DateRange } from "@/types/dashboard";
import { getAIMonitoringData, getPromptsData } from "@/features/ai-monitoring/actions";
import { AIMonitoringProvider } from "@/features/ai-monitoring/providers/ai-monitoring-provider";
import { AIMonitoringDashboard } from "@/features/ai-monitoring/components/ai-monitoring-dashboard";
import { Skeleton } from "@/components/ui/skeleton";

interface AIMonitoringPageProps {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AIMonitoringPage({
  params,
  searchParams,
}: AIMonitoringPageProps) {
  const { projectId } = await params;
  const searchParamsValue = await searchParams;

  // Construct filters from URL params
  const filters: DashboardFilters = {
    dateRange: (searchParamsValue.dateRange as DateRange) || "30d",
    keyword: searchParamsValue.keyword as string,
    llmModel: searchParamsValue.llmModel as string,
    competitor: searchParamsValue.competitor as string,
  };

  // Fetch all data in parallel
  const [aiMonitoringData, promptsData] = await Promise.all([
    getAIMonitoringData(projectId, filters),
    getPromptsData(projectId, filters, 20, 0),
  ]);

  if (!aiMonitoringData) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-8 py-12 border-b border-dashed border-border/80 bg-muted/5">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase">
            AI Intelligence Monitoring
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <div className="h-px w-8 bg-primary/50" />
            <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em]">
              360° Analysis of AI Search Visibility & LLM Mentions
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <Suspense fallback={<DashboardSkeleton />}>
        <AIMonitoringProvider
          projectId={projectId}
          initialData={{
            mentions: aiMonitoringData.mentions,
          }}
          initialFilters={filters}
        >
          <AIMonitoringDashboard
            projectId={projectId}
            keywords={aiMonitoringData.keywords}
            initialMentions={aiMonitoringData.mentions}
            mentionTimeline={aiMonitoringData.mentionTimeline}
            modelBreakdown={aiMonitoringData.modelBreakdown}
            competitorInsights={aiMonitoringData.competitorInsights}
            kpis={aiMonitoringData.kpis}
            initialPrompts={promptsData}
          />
        </AIMonitoringProvider>
      </Suspense>
    </div>
  );
}

/**
 * Loading skeleton
 */
function DashboardSkeleton() {
  return (
    <div className="space-y-4 p-8">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 md:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
      <Skeleton className="h-[400px] w-full" />
      <Skeleton className="h-[300px] w-full" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  );
}

