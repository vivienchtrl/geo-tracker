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
    <div className="space-y-4">
      <OverviewMetrics data={data.overview} />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <VisibilityChart data={data.models} />
        </div>
        <div className="col-span-3">
          <CompetitorsChart data={data.competitors} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
         <KeywordsTable data={data.keywords} />
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <RecentMentionsTable data={data.searchDetails} />
      </div>
    </div>
  );
}
