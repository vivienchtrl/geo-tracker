'use client'

import { UserProvider } from '@/features/auth/providers/user-provider'
import { ProjectProvider } from '@/features/project/providers/project-provider'
import { PostHogProvider } from '@/features/analytics/providers/posthog-provider'
import type { DashboardContext } from '@/backend/services/dashboard.service'

type DashboardProvidersProps = {
  children: React.ReactNode
  initialData: DashboardContext
}

export function DashboardProviders({
  children,
  initialData
}: DashboardProvidersProps) {
  return (
    <PostHogProvider>
      <UserProvider user={initialData.user}>
        <ProjectProvider project={initialData.project}>
          {/* 
            TODO: Add Providers for Keywords/ICP if needed globally 
            For now, we just pass User/Project as they are strictly required for the Shell.
            Specific pages will consume the other data or we can add a 'DashboardStore' later.
          */}
          {children}
        </ProjectProvider>
      </UserProvider>
    </PostHogProvider>
  )
}
