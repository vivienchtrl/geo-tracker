import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getKeywordsByProject } from "@/backend/services/keywords.service"
import { getProjectById } from "@/backend/services/project-service"
import { getDashboardAnalytics } from "@/backend/services/dashboard.service"
import { KeywordsManager } from "@/features/keywords/components/keywords-manager"
import { VisibilityChart } from "@/features/keywords/components/visibility-chart"
import { CompetitorsChart } from "@/features/keywords/components/competitors-chart"
import { Skeleton } from "@/components/ui/skeleton"

interface KeywordsPageProps {
  params: Promise<{ projectId: string }>
}

export default async function KeywordsPage({ params }: KeywordsPageProps) {
  const { projectId } = await params
  
  // Fetch data in parallel
  const [project, keywords, dashboardAnalytics] = await Promise.all([
    getProjectById(projectId),
    getKeywordsByProject(projectId),
    getDashboardAnalytics(projectId)
  ])

  if (!project) notFound()

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-8 py-12 border-b border-dashed border-border/80 bg-muted/5">
        <h1 className="text-4xl font-bold tracking-tighter uppercase">Keywords Strategy</h1>
        <div className="flex items-center gap-3 mt-3">
          <div className="h-px w-8 bg-primary/50" />
          <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em]">
            Manage vectors & Analyze Performance
          </p>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="grid lg:grid-cols-2 gap-0 border-b border-dashed border-border/80">
        <div className="border-r border-dashed border-border/80 p-8">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Visibility Metrics</h3>
            <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                <VisibilityChart data={dashboardAnalytics.models || []} />
            </Suspense>
        </div>
        <div className="p-8">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Competitor Share</h3>
             <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                <CompetitorsChart data={dashboardAnalytics.competitors || []} />
            </Suspense>
        </div>
      </div>

      {/* Manager Section */}
      <div className="flex-1">
        <KeywordsManager initialKeywords={keywords} />
      </div>
    </div>
  )
}

