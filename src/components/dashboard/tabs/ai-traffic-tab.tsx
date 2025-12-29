"use client"

import { DashboardMetrics } from "@/types/dashboard"
import { CompetitorsChart } from "@/features/keywords/components/competitors-chart"
import { RecentMentionsTable } from "@/features/ai-monitoring/components/recent-mentions-table"
import { BotActivityChart } from "@/features/analytics/components/bot-activity-chart"
import { AISearchMetricsChart } from "@/features/analytics/components/ai-search-metrics-chart"

interface AITrafficTabProps {
  aiMetrics: DashboardMetrics
}

export function AITrafficTab({ aiMetrics }: AITrafficTabProps) {
  return (
    <div className="flex flex-col gap-0 min-h-full">
      {/* AI Search Metrics & Bot Activity */}
      <div className="grid gap-0 lg:grid-cols-12 border-b border-dashed border-border/80">
        <div className="lg:col-span-8 border-r border-dashed border-border/80">
          <AISearchMetricsChart data={aiMetrics.aiSearchStats || { mentions: [] }} />
        </div>
        <div className="lg:col-span-4">
          <BotActivityChart data={aiMetrics.botActivity || []} />
        </div>
      </div>

      <div className="grid gap-0 md:grid-cols-2 border-b border-dashed border-border/80">
        <div className="h-full border-r border-dashed border-border/80">
          <CompetitorsChart data={aiMetrics.competitors} title="Competitors Mentioned by AI" />
        </div>
        <div className="h-full">
          <RecentMentionsTable data={aiMetrics.searchDetails} />
        </div>
      </div>
    </div>
  )
}
