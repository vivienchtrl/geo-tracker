'use client'

import { UserProvider } from '@/features/auth/providers/user-provider'
import { UserProjectsProvider } from '@/features/project/providers/user-projects-provider'
import { PostHogProvider } from '@/features/analytics/providers/posthog-provider'
import type { User } from '@/types/db'
import type { ProjectWithRole } from '@/backend/services/project-service'

type DashboardProvidersProps = {
  children: React.ReactNode
  user: User
  projects: ProjectWithRole[]
}

/**
 * Root-level providers for the dashboard.
 * Provides: User context + List of all user's projects
 * 
 * Note: Current project context is provided by [projectId]/layout.tsx
 */
export function DashboardProviders({
  children,
  user,
  projects
}: DashboardProvidersProps) {
  return (
    <PostHogProvider>
      <UserProvider user={user}>
        <UserProjectsProvider projects={projects}>
          {children}
        </UserProjectsProvider>
      </UserProvider>
    </PostHogProvider>
  )
}
