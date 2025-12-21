import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/backend/services/user-service"
import { getProjectWithRole } from "@/backend/services/project-service"
import { ProjectProvider } from "@/features/project/providers/project-provider"

interface ProjectLayoutProps {
  children: React.ReactNode
  params: Promise<{ projectId: string }>
}

/**
 * Project-scoped layout.
 * Validates that:
 * 1. User is authenticated
 * 2. Project exists
 * 3. User has access to the project (owner or member)
 * 
 * Provides ProjectProvider context for all child routes.
 */
export default async function ProjectLayout({ 
  children, 
  params 
}: ProjectLayoutProps) {
  const { projectId } = await params
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/sign-in')
  }

  // Validate project access + get role
  const projectData = await getProjectWithRole(projectId, user.id)
  
  if (!projectData) {
    // User has no access or project doesn't exist
    notFound()
  }

  return (
    <ProjectProvider 
      project={projectData.project} 
      role={projectData.role}
    >
      {children}
    </ProjectProvider>
  )
}

