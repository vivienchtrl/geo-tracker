'use client'

import { createContext, useContext } from 'react'
import type { Project } from '@/types/db'

type ProjectContextType = {
  project: Project | null
  isLoading: boolean
}

const ProjectContext = createContext<ProjectContextType | null>(null)

export function ProjectProvider({ 
  children, 
  project 
}: { 
  children: React.ReactNode
  project: Project | null 
}) {
  return (
    <ProjectContext.Provider value={{ project, isLoading: false }}>
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
