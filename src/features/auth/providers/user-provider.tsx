'use client'

import { createContext, useContext } from 'react'
import type { User } from '@/types/db'

type UserContextType = {
  user: User | null
  isLoading: boolean
}

const UserContext = createContext<UserContextType | null>(null)

export function UserProvider({ 
  children, 
  user 
}: { 
  children: React.ReactNode
  user: User | null 
}) {
  return (
    <UserContext.Provider value={{ user, isLoading: false }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
