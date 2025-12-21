import { Suspense } from 'react'
import { IntegrationsClient } from '@/features/integrations/components/integrations-client'
import { getIntegrationStatusAction } from '@/features/integrations/actions'
import { getProjectById } from '@/backend/services/project-service'
import { Skeleton } from "@/components/ui/skeleton"
import { notFound } from 'next/navigation'

interface IntegrationsPageProps {
  params: Promise<{ projectId: string }>
}

export default async function IntegrationsPage({ params }: IntegrationsPageProps) {
  const { projectId } = await params
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">
          Connect your project to external services like Google Analytics and Search Console.
        </p>
      </div>

      <Suspense fallback={<IntegrationsSkeleton />}>
        <IntegrationsContent projectId={projectId} />
      </Suspense>
    </div>
  )
}

async function IntegrationsContent({ projectId }: { projectId: string }) {
  // Get project data
  const projectData = await getProjectById(projectId)
  if (!projectData) notFound()

  // Get integration status
  const status = await getIntegrationStatusAction(projectId)

  const fullStatus = {
    google: status.google || false,
    searchConsole: status.searchConsole || false,
    analytics: status.analytics || false,
    tracker: !!projectData.url,
    apiKey: projectData.url,
  }

  return <IntegrationsClient initialStatus={fullStatus} projectId={projectId} />
}

function IntegrationsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Skeleton className="h-[200px] w-full rounded-xl" />
      <Skeleton className="h-[200px] w-full rounded-xl" />
      <Skeleton className="h-[200px] w-full rounded-xl" />
    </div>
  )
}

