"use client"

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useProject } from '@/hooks/use-project'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { projectId, isLoading, error } = useProject()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !projectId) {
      router.push('/auth/sign-in')
    }
  }, [isLoading, projectId, router])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={() => router.push('/auth/sign-in')}
            className="text-primary hover:underline"
          >
            Go to login
          </button>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!projectId) {
    return fallback || null
  }

  // Authenticated with project
  return <>{children}</>
}





