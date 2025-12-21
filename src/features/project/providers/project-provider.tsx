'use client'

import { createContext, useContext } from 'react'
import type { Project } from '@/types/db'
import type { ProjectRole } from '@/backend/services/project-service'

type ProjectContextType = {
  project: Project
  role: ProjectRole
  isLoading: boolean
}

const ProjectContext = createContext<ProjectContextType | null>(null)

interface ProjectProviderProps {
  children: React.ReactNode
  project: Project
  role: ProjectRole
}

/**
 * Provides the CURRENT project context.
 * Used within /dashboard/[projectId]/* routes.
 * For the list of all user projects, use UserProjectsProvider.
 */
export function ProjectProvider({ 
  children, 
  project,
  role
}: ProjectProviderProps) {
  return (
    <ProjectContext.Provider value={{ 
      project, 
      role,
      isLoading: false 
    }}>
      {children}
    </ProjectContext.Provider>
  )
}

export const useProject = () => {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}
