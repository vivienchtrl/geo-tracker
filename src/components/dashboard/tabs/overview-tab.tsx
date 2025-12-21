import { OverviewMetrics } from "@/components/dashboard/charts/overview-metrics";
import { VisibilityChart } from "@/components/dashboard/charts/visibility-chart";
import { CompetitorsChart } from "@/components/dashboard/charts/competitors-chart";
import { RecentMentionsTable } from "@/components/dashboard/charts/recent-mentions-table";
import { KeywordsTable } from "@/components/dashboard/charts/keywords-table";
import { DashboardMetrics } from "@/app/dashboard/actions";

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
        <div className="lg:col-span-5 border-r border-dashed border-border/80">
          <KeywordsTable data={data.keywords} />
        </div>
        <div className="lg:col-span-7">
          <RecentMentionsTable data={data.searchDetails} />
        </div>
      </div>
    </div>
  );
}
