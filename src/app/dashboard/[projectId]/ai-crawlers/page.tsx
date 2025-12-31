/**
 * AI Crawlers Dashboard Page
 *
 * Server component that fetches data and renders the dashboard
 * Displays crawler activity from LLM bots (GPT, Claude, Perplexity, etc.)
 */

import { notFound } from "next/navigation";
import { getCurrentUser } from "@/backend/services/user-service";
import { getProjectWithRole } from "@/backend/services/project-service";
import {
  getCrawlerVisits,
  getCrawlerKPIs,
  getCrawlerTimeline,
  getMentionsTimeline,
  getBotBreakdown,
} from "@/backend/services/crawler-visits.service";
import { AICrawlersProvider } from "@/features/ai-crawlers/providers/ai-crawlers-provider";
import { AICrawlersDashboard } from "@/features/ai-crawlers/components/ai-crawlers-dashboard";

interface AICrawlersPageProps {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{
    days?: string;
    botName?: string;
    botCategory?: string;
  }>;
}

export default async function AICrawlersPage({
  params,
  searchParams,
}: AICrawlersPageProps) {
  const { projectId } = await params;
  const search = await searchParams;

  const user = await getCurrentUser();
  if (!user) notFound();

  const projectData = await getProjectWithRole(projectId, user.id);
  if (!projectData) notFound();

  // Parse days filter (default to 7)
  const days = search.days ? parseInt(search.days, 10) : 7;

  // Calculate start date from days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Fetch all data in parallel
  const [visitsData, kpis, timeline, mentionsTimeline, botBreakdown] = await Promise.all([
    getCrawlerVisits(projectId, {
      startDate,
      botName: search.botName,
      botCategory: search.botCategory,
      limit: 20,
    }),
    getCrawlerKPIs(projectId, { startDate }),
    getCrawlerTimeline(projectId, { days }),
    getMentionsTimeline(projectId, { days }),
    getBotBreakdown(projectId, { startDate }),
  ]);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-8 py-12 border-b border-dashed border-border/80 bg-muted/5">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase">
            AI Crawlers
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <div className="h-px w-8 bg-primary/50" />
            <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em]">
              Monitor LLM Bots Crawling Your Website
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Content wrapped in Provider */}
      <AICrawlersProvider
        projectId={projectId}
        initialData={{
          visits: visitsData.visits,
          hasMore: visitsData.hasMore,
          kpis, 
          timeline,
          mentionsTimeline,
          botBreakdown,
        }}
        initialFilters={{
          botName: search.botName,
          botCategory: search.botCategory,
        }}
      >
        <AICrawlersDashboard />
      </AICrawlersProvider>
    </div>
  );
}
