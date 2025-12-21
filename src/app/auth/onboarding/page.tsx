import { redirect } from "next/navigation"
import { OnboardingWizard, AuthGuardOnboarding, checkOnboardingStatus } from "@/features/onboarding"

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  // Check if user already completed onboarding
  const { needsOnboarding, error } = await checkOnboardingStatus()

  // If there's an auth error, redirect to sign-in
  if (error === 'Unauthorized') {
    redirect('/auth/sign-in')
  }

  // If user doesn't need onboarding, redirect to dashboard
  if (!needsOnboarding) {
    redirect('/dashboard')
  }

  return (
    <AuthGuardOnboarding>
      <OnboardingWizard />
    </AuthGuardOnboarding>
  )
}
