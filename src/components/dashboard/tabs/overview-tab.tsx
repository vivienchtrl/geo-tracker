import { OverviewMetrics } from "@/features/analytics/components/overview-metrics";
import { VisibilityChart } from "@/features/keywords/components/visibility-chart";
import { CompetitorsChart } from "@/features/keywords/components/competitors-chart";
import { RecentMentionsTable } from "@/features/mentions/components/recent-mentions-table";
import { CrawlerLogsTable } from "@/features/crawler/components/crawler-logs-table";
import { KeywordsTable } from "@/features/keywords/components/keywords-table";
import { DashboardMetrics, KeywordData } from "@/types/dashboard";

interface OverviewTabProps {
  data: DashboardMetrics;
}

export function OverviewTab({ data }: OverviewTabProps) {
  return (
    <div className="flex flex-col gap-0 min-h-full">
      <OverviewMetrics data={data.overview} />
      
      <div className="grid gap-0 lg:grid-cols-12 border-b border-dashed border-border/80">
        <div className="lg:col-span-8 border-r border-dashed border-border/80">
          <VisibilityChart data={data.models} />
        </div>
        <div className="lg:col-span-4">
          <CompetitorsChart data={data.competitors} />
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-12 border-b border-dashed border-border/80">
        <div className="lg:col-span-12">
          <CrawlerLogsTable data={data.crawlerLogs} />
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-12 border-b border-dashed border-border/80">
        <div className="lg:col-span-5 border-r border-dashed border-border/80">
          <KeywordsTable data={data.keywords as KeywordData[]} />
        </div>
        <div className="lg:col-span-7">
          <RecentMentionsTable data={data.searchDetails} />
        </div>
      </div>
    </div>
  );
}
