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
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="ai-tracking">AI Traffic</TabsTrigger>
        <TabsTrigger value="general-traffic">General Traffic</TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview">
        <OverviewTab data={aiMetrics} />
      </TabsContent>

      {/* AI Traffic Tab */}
      <TabsContent value="ai-tracking">
        <AITrafficTab 
          aiTraffic={aiTrafficData} 
          aiMetrics={aiMetrics} 
        />
      </TabsContent>

      {/* General Traffic Tab */}
      <TabsContent value="general-traffic">
        <GeneralTrafficTab 
          analyticsHistory={analyticsHistory}
          gscHistory={gscHistory}
        />
      </TabsContent>
    </Tabs>
  )
}

