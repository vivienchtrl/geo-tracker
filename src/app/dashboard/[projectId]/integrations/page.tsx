import { Suspense } from 'react'
import { IntegrationsClient } from '@/features/integrations/components/integrations-client'
import { getProjectWithRole } from '@/backend/services/project-service'
import { getApiKeysByProject } from '@/backend/services/api-keys.service'
import { getCurrentUser } from '@/backend/services/user-service'
import { Skeleton } from "@/components/ui/skeleton"
import { notFound } from 'next/navigation'

interface IntegrationsPageProps {
  params: Promise<{ projectId: string }>
}

export default async function IntegrationsPage({ params }: IntegrationsPageProps) {
  const { projectId } = await params

  const user = await getCurrentUser()
  if (!user) notFound()

  const projectData = await getProjectWithRole(projectId, user.id)
  if (!projectData) notFound()

  const { role } = projectData
  const isOwner = role === 'owner'

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-8 py-12 border-b border-dashed border-border/80 bg-muted/5">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase">Integrations</h1>
          <div className="flex items-center gap-3 mt-3">
            <div className="h-px w-8 bg-primary/50" />
            <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em]">
              Cloudflare & WordPress AI Tracking
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <Suspense fallback={<IntegrationsSkeleton />}>
          <IntegrationsContent projectId={projectId} isOwner={isOwner} />
        </Suspense>
      </div>
    </div>
  )
}

async function IntegrationsContent({ projectId, isOwner }: { projectId: string; isOwner: boolean }) {
  const apiKeys = isOwner ? await getApiKeysByProject(projectId) : []

  return <IntegrationsClient projectId={projectId} apiKeys={apiKeys} isOwner={isOwner} />
}

function IntegrationsSkeleton() {
  return (
    <div className="border-b border-dashed border-border/80 p-8 space-y-6">
      <Skeleton className="h-24 w-full rounded-none" />
      <Skeleton className="h-48 w-full rounded-none" />
      <Skeleton className="h-64 w-full rounded-none" />
    </div>
  )
}
