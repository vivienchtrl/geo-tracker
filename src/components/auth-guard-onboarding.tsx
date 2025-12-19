"use client"

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

interface AuthGuardOnboardingProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuardOnboarding({ children, fallback }: AuthGuardOnboardingProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/sign-in')
        return
      }

      setIsAuthenticated(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return fallback || null
  }

  // Authenticated - can proceed to onboarding
  return <>{children}</>
}





