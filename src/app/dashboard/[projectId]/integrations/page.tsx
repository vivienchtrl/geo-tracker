import { Suspense } from 'react'
import { IntegrationsClient } from '@/features/integrations/components/integrations-client'
import { getIntegrationStatusAction, checkTrackerSignalAction } from '@/features/integrations/actions'
import { getProjectById } from '@/backend/services/project-service'
import { Skeleton } from "@/components/ui/skeleton"
import { notFound } from 'next/navigation'

interface IntegrationsPageProps {
  params: Promise<{ projectId: string }>
}

export default async function IntegrationsPage({ params }: IntegrationsPageProps) {
  const { projectId } = await params
  const project = await getProjectById(projectId)
  if (!project) notFound()
  
  return (
    <div className="flex flex-col min-h-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-8 py-12 border-b border-dashed border-border/80 bg-muted/5">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase">Integrations</h1>
          <div className="flex items-center gap-3 mt-3">
            <div className="h-px w-8 bg-primary/50" />
            <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em]">
              Connect your data ecosystem
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <Suspense fallback={<IntegrationsSkeleton />}>
          <IntegrationsContent projectId={projectId} />
        </Suspense>
      </div>
    </div>
  )
}

async function IntegrationsContent({ projectId }: { projectId: string }) {
  // Get integration status and tracker signal in parallel
  const [status, trackerSignal] = await Promise.all([
    getIntegrationStatusAction(projectId),
    checkTrackerSignalAction(projectId),
  ])

  const fullStatus = {
    google: status.google || false,
    searchConsole: status.searchConsole || false,
    analytics: status.analytics || false,
    tracker: trackerSignal.hasSignal || false,
    lastSignal: trackerSignal.lastSignal,
  }

  return <IntegrationsClient initialStatus={fullStatus} projectId={projectId} />
}

function IntegrationsSkeleton() {
  return (
    <div className="grid gap-0 md:grid-cols-2 lg:grid-cols-3 border-b border-dashed border-border/80">
      <Skeleton className="h-[300px] w-full rounded-none border-r border-dashed border-border/80" />
      <Skeleton className="h-[300px] w-full rounded-none border-r border-dashed border-border/80" />
      <Skeleton className="h-[300px] w-full rounded-none" />
    </div>
  )
}

