'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OverviewTab } from "@/components/dashboard/tabs/overview-tab"
import { AITrafficTab } from "@/components/dashboard/tabs/ai-traffic-tab"
import { GeneralTrafficTab } from "@/components/dashboard/tabs/general-traffic-tab"
import type { DashboardMetrics } from "./actions"
import type { AnalyticsMetric, SearchConsoleMetric, TrafficSource } from "@/types/db"

interface DashboardTabsProps {
  aiMetrics: DashboardMetrics
  aiTrafficData: TrafficSource[]
  analyticsHistory: AnalyticsMetric[]
  gscHistory: SearchConsoleMetric[]
}

export function DashboardTabs({
  aiMetrics,
  aiTrafficData,
  analyticsHistory,
  gscHistory
}: DashboardTabsProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-0 flex flex-col">
      <div className="px-8 py-4 border-b border-dashed border-border/80 bg-muted/5">
        <TabsList className="bg-transparent border-dashed border border-border/60 p-1">
          <TabsTrigger value="overview" className="uppercase text-[10px] tracking-widest font-bold px-8">Overview</TabsTrigger>
          <TabsTrigger value="ai-tracking" className="uppercase text-[10px] tracking-widest font-bold px-8">AI Traffic</TabsTrigger>
          <TabsTrigger value="general-traffic" className="uppercase text-[10px] tracking-widest font-bold px-8">General Traffic</TabsTrigger>
        </TabsList>
      </div>

      {/* Tabs Content - Each Tab component will manage its own grid borders */}
      <TabsContent value="overview" className="outline-none flex-1">
        <OverviewTab data={aiMetrics} />
      </TabsContent>

      <TabsContent value="ai-tracking" className="outline-none flex-1">
        <AITrafficTab 
          aiTraffic={aiTrafficData} 
          aiMetrics={aiMetrics} 
        />
      </TabsContent>

      <TabsContent value="general-traffic" className="outline-none flex-1">
        <GeneralTrafficTab 
          analyticsHistory={analyticsHistory}
          gscHistory={gscHistory}
        />
      </TabsContent>
    </Tabs>
  )
}

