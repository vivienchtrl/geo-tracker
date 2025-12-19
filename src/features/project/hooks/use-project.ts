'use client'

import { useProject as useProjectContext } from '../providers/project-provider'

export const useProject = () => {
  return useProjectContext()
}

