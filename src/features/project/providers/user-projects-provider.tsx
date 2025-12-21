'use client'

import { createContext, useContext } from 'react'
import type { ProjectWithRole } from '@/backend/services/project-service'

type UserProjectsContextType = {
  projects: ProjectWithRole[]
  isLoading: boolean
}

const UserProjectsContext = createContext<UserProjectsContextType | null>(null)

interface UserProjectsProviderProps {
  children: React.ReactNode
  projects: ProjectWithRole[]
}

export function UserProjectsProvider({ 
  children, 
  projects 
}: UserProjectsProviderProps) {
  return (
    <UserProjectsContext.Provider value={{ 
      projects, 
      isLoading: false 
    }}>
      {children}
    </UserProjectsContext.Provider>
  )
}

export const useUserProjects = () => {
  const context = useContext(UserProjectsContext)
  if (!context) {
    throw new Error('useUserProjects must be used within a UserProjectsProvider')
  }
  return context
}

