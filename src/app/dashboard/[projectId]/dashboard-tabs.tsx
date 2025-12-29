'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OverviewTab } from "@/components/dashboard/tabs/overview-tab"
import { AITrafficTab } from "@/components/dashboard/tabs/ai-traffic-tab"
import { AudienceTab } from "./audience-tab"
import type { DashboardMetrics } from "@/types/dashboard"

interface DashboardTabsProps {
  aiMetrics: DashboardMetrics
}

export function DashboardTabs({
  aiMetrics,
}: DashboardTabsProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-0 flex flex-col">
      <div className="px-8 py-4 border-b border-dashed border-border/80 bg-muted/5">
        <TabsList className="bg-transparent border-dashed border border-border/60 p-1">
          <TabsTrigger value="overview" className="uppercase text-[10px] tracking-widest font-bold px-8">Overview</TabsTrigger>
          <TabsTrigger value="ai-tracking" className="uppercase text-[10px] tracking-widest font-bold px-8">AI Intelligence</TabsTrigger>
          <TabsTrigger value="audience" className="uppercase text-[10px] tracking-widest font-bold px-8">Audience & Tech</TabsTrigger>
        </TabsList>
      </div>

      {/* Tabs Content - Each Tab component will manage its own grid borders */}
      <TabsContent value="overview" className="outline-none flex-1">
        <OverviewTab data={aiMetrics} />
      </TabsContent>

      <TabsContent value="ai-tracking" className="outline-none flex-1">
        <AITrafficTab
          aiMetrics={aiMetrics}
        />
      </TabsContent>

      <TabsContent value="audience" className="outline-none flex-1">
        <AudienceTab data={aiMetrics} />
      </TabsContent>
    </Tabs>
  )
}
