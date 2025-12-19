'use client'

import { useUser as useUserContext } from '../providers/user-provider'

export const useUser = () => {
  return useUserContext()
}

