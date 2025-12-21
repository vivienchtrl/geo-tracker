import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, Download } from "lucide-react"

// Components
import { DashboardTabs } from "./dashboard-tabs"

// Data
import { getDashboardDataForProject } from "./actions"
import { getDashboardAnalytics } from "@/backend/services/dashboard.service"
import { getProjectById } from "@/backend/services/project-service"
import { notFound } from "next/navigation"

// Constants for AI Source Filtering
const AI_SOURCES = [
  'chatgpt', 'openai', 
  'perplexity', 
  'gemini', 'bard',
  'deepseek',
  'mistral',
  'claude', 'anthropic',
  'bing'
]

interface ProjectDashboardPageProps {
  params: Promise<{ projectId: string }>
}

export default async function ProjectDashboardPage({ params }: ProjectDashboardPageProps) {
  const { projectId } = await params
  
  // Fetch project data
  const project = await getProjectById(projectId)
  if (!project) notFound()

  // Fetch Data in Parallel
  const [aiMetrics, analyticsData] = await Promise.all([
    getDashboardDataForProject(projectId),
    getDashboardAnalytics(projectId)
  ])

  // Filter Traffic for AI Tab
  const aiTrafficData = analyticsData.trafficSources.filter((ts) => {
    const source = ts.source.toLowerCase()
    return AI_SOURCES.some(ai => {
      if (ai === 'google') return false
      return source.includes(ai)
    })
  })

  return (
    <div className="flex flex-col min-h-full">
      {/* Header Section - Borders touch Sidebar and Edge */}
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

      {/* Dashboard Tabs - NO Lateral Padding to let internal borders touch edges */}
      <div className="flex-1">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardTabs
            aiMetrics={aiMetrics}
            aiTrafficData={aiTrafficData}
            analyticsHistory={analyticsData.analyticsHistory}
            gscHistory={analyticsData.gscHistory}
          />
        </Suspense>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
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

