import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getProjectById } from "@/backend/services/project-service"
import { getIcpProfilesByProject } from "@/backend/services/icp-profiles"
import { getDashboardAnalytics } from "@/backend/services/dashboard.service"
import { IcpManager } from "@/features/icp/components/icp-manager"
import { DeviceBreakdown } from "@/features/analytics/components/device-breakdown"
import { ReferrerBreakdown } from "@/features/analytics/components/referrer-breakdown"

interface AudiencePageProps {
  params: Promise<{ projectId: string }>
}

export default async function AudiencePage({ params }: AudiencePageProps) {
  const { projectId } = await params
  
  // Fetch data
  const [project, icpProfiles, dashboardAnalytics] = await Promise.all([
    getProjectById(projectId),
    getIcpProfilesByProject(projectId),
    getDashboardAnalytics(projectId)
  ])

  if (!project) notFound()

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-8 py-12 border-b border-dashed border-border/80 bg-muted/5">
        <h1 className="text-4xl font-bold tracking-tighter uppercase">Audience & Targeting</h1>
        <div className="flex items-center gap-3 mt-3">
          <div className="h-px w-8 bg-primary/50" />
          <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em]">
            Geographic Traffic & ICP Configuration
          </p>
        </div>
      </div>

      {/* Geographical & Traffic Stats Section */}
      <div className="flex flex-col gap-0 border-b border-dashed border-border/80">
        {/* Device & Referrers */}
        <div className="grid lg:grid-cols-12 gap-0 border-b border-dashed border-border/80">
          <div className="lg:col-span-4 border-r border-dashed border-border/80">
            <DeviceBreakdown data={dashboardAnalytics.deviceBreakdown || []} />
          </div>
          <div className="lg:col-span-8">
            <ReferrerBreakdown data={dashboardAnalytics.referrerBreakdown || []} />
          </div>
        </div>

      {/* ICP Settings Section */}
      <div className="flex-1 bg-muted/5">
         <div className="px-8 py-6 border-b border-dashed border-border/80">
            <h2 className="text-xl font-bold uppercase tracking-tight">Ideal Customer Profiles (ICP)</h2>
         </div>
         <IcpManager initialIcpProfiles={icpProfiles} />
      </div>
      </div>
    </div>
  )
}

