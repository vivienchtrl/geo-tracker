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
    <div className="flex flex-col gap-4 md:gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground">
            Unified analytics for AI Engines, Google Search, and Web Traffic.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Data
          </Button>
        </div>
      </div>

      {/* Dashboard Tabs - Client Component for hydration stability */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardTabs
          aiMetrics={aiMetrics}
          aiTrafficData={aiTrafficData}
          analyticsHistory={analyticsData.analyticsHistory}
          gscHistory={analyticsData.gscHistory}
        />
      </Suspense>
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

