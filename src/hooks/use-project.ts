import { useProject as useNewProject } from '@/features/project/hooks/use-project'

interface ProjectContext {
  projectId: string | null
  ownerId: string | null
  isLoading: boolean
  error: string | null
}

/**
 * @deprecated Use @/features/project/hooks/use-project instead
 */
export function useProject(): ProjectContext {
  const { project, isLoading } = useNewProject()

  return {
    projectId: project?.id || null,
    ownerId: project?.ownerId || null,
    isLoading,
    error: null
  }
}
