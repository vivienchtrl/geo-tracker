import { OnboardingForm } from "@/components/auth/onboarding-form"
import { AuthGuardOnboarding } from "@/components/auth-guard-onboarding"
import { checkOnboardingStatus } from "./actions"
import { redirect } from "next/navigation"

export default async function OnboardingPage() {
  // Check if user already completed onboarding
  const { needsOnboarding } = await checkOnboardingStatus()

  if (!needsOnboarding) {
    redirect('/dashboard')
  }

  return (
    <AuthGuardOnboarding>
      <OnboardingForm />
    </AuthGuardOnboarding>
  )
}
