import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, Download } from "lucide-react"

// Components
import { DashboardTabs } from "./dashboard-tabs"
import { DashboardFilterBar } from "@/components/dashboard/dashboard-filter-bar"

// Data
import { getDashboardDataForProject } from "./actions"
import { getDashboardAnalytics } from "@/backend/services/dashboard.service"
import { getProjectById } from "@/backend/services/project-service"
import { notFound } from "next/navigation"
import { DashboardFilters, DateRange } from "@/types/dashboard"

interface ProjectDashboardPageProps {
  params: Promise<{ projectId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProjectDashboardPage({ params, searchParams }: ProjectDashboardPageProps) {
  const { projectId } = await params
  const searchParamsValue = await searchParams
  
  // Construct filters from URL params
  const filters: DashboardFilters = {
    dateRange: (searchParamsValue.dateRange as DateRange) || '30d',
    device: searchParamsValue.device as string,
    country: searchParamsValue.country as string,
    llmModel: searchParamsValue.llmModel as string,
    referrer: searchParamsValue.referrer as string,
    utmCampaign: searchParamsValue.utmCampaign as string,
  }

  // Fetch project data
  const project = await getProjectById(projectId)
  if (!project) notFound()

  // Fetch Data in Parallel using filters
  const [aiMetrics] = await Promise.all([
    getDashboardDataForProject(projectId, filters),
    getDashboardAnalytics(projectId, filters)
  ])

  return (
    <div className="flex flex-col min-h-full">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-8 py-12 border-b border-dashed border-border/80 bg-muted/5">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase">{project.name}</h1>
          <div className="flex items-center gap-3 mt-3">
            <div className="h-px w-8 bg-primary/50" />
            <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em]">
              Unified Intelligence Analytics
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="dashed" size="sm" className="uppercase text-[10px] font-bold tracking-widest px-6 h-9">
            <Download className="mr-2 h-3.5 w-3.5" />
            Export
          </Button>
          <Button size="sm" className="uppercase text-[10px] font-bold tracking-widest px-6 h-9">
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Sync
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <DashboardFilterBar />

      {/* Dashboard Tabs */}
      <div className="flex-1">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardTabs
            aiMetrics={aiMetrics}
          />
        </Suspense>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4 p-8">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
      <Skeleton className="h-[400px] w-full" />
    </div>
  )
}
