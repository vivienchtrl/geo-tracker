"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/utils/utils"
import { UserInfoStep, ProjectStep, KeywordsStep, LocationStep } from "./steps"
import { completeOnboarding, redirectToDashboard } from "../actions"
import { 
  ONBOARDING_STEPS, 
  STEP_LABELS, 
  type OnboardingStep, 
  type OnboardingData,
  type UserStepData,
  type ProjectStepData,
  type KeywordsStepData,
  type LocationStepData,
} from "../types"
import { Check } from "lucide-react"

const initialData: OnboardingData = {
  user: { firstName: "", lastName: "" },
  project: { projectName: "", projectUrl: "" },
  keywords: { keywords: [] },
  location: null,
}

export function OnboardingWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('user')
  const [data, setData] = useState<OnboardingData>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentStepIndex = ONBOARDING_STEPS.indexOf(currentStep)

  const goToNextStep = useCallback(() => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < ONBOARDING_STEPS.length) {
      setCurrentStep(ONBOARDING_STEPS[nextIndex])
    }
  }, [currentStepIndex])

  const goToPrevStep = useCallback(() => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(ONBOARDING_STEPS[prevIndex])
    }
  }, [currentStepIndex])

  const handleUserStep = useCallback((stepData: UserStepData) => {
    setData(prev => ({ ...prev, user: stepData }))
    goToNextStep()
  }, [goToNextStep])

  const handleProjectStep = useCallback((stepData: ProjectStepData) => {
    setData(prev => ({ ...prev, project: stepData }))
    goToNextStep()
  }, [goToNextStep])

  const handleKeywordsStep = useCallback((stepData: KeywordsStepData) => {
    setData(prev => ({ ...prev, keywords: stepData }))
    goToNextStep()
  }, [goToNextStep])

  const handleComplete = useCallback(async (locationData: LocationStepData | null) => {
    setIsSubmitting(true)
    
    const finalData: OnboardingData = {
      ...data,
      location: locationData,
    }

    try {
      const result = await completeOnboarding(finalData)
      
      if (!result.success) {
        toast.error(result.error || "Failed to complete onboarding")
        setIsSubmitting(false)
        return
      }

      toast.success("Welcome! Your account is ready 🎉")
      
      // Redirect to dashboard
      if (result.projectId) {
        await redirectToDashboard(result.projectId)
      } else {
        router.push('/dashboard')
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
      setIsSubmitting(false)
    }
  }, [data, router])

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-linear-to-br from-violet-950/20 via-zinc-950 to-cyan-950/20 pointer-events-none" />
      
      {/* Header with progress */}
      <header className="relative z-10 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-6">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-semibold text-white">Geo Tracker</span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2">
            {ONBOARDING_STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex
              const isCurrent = step === currentStep
              
              return (
                <div key={step} className="flex items-center">
                  {/* Step indicator */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                        isCompleted && "bg-linear-to-r from-violet-600 to-fuchsia-600 text-white",
                        isCurrent && "bg-zinc-800 text-white ring-2 ring-violet-500/50",
                        !isCompleted && !isCurrent && "bg-zinc-900 text-zinc-600 border border-zinc-800"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className={cn(
                      "mt-2 text-xs font-medium transition-colors",
                      isCurrent ? "text-white" : "text-zinc-600"
                    )}>
                      {STEP_LABELS[step]}
                    </span>
                  </div>
                  
                  {/* Connector line */}
                  {index < ONBOARDING_STEPS.length - 1 && (
                    <div
                      className={cn(
                        "w-16 h-0.5 mx-2 transition-colors duration-300",
                        index < currentStepIndex ? "bg-linear-to-r from-violet-600 to-fuchsia-600" : "bg-zinc-800"
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-8 shadow-2xl shadow-black/50">
            {currentStep === 'user' && (
              <UserInfoStep
                data={data.user}
                onNext={handleUserStep}
              />
            )}
            
            {currentStep === 'project' && (
              <ProjectStep
                data={data.project}
                onNext={handleProjectStep}
                onBack={goToPrevStep}
              />
            )}
            
            {currentStep === 'keywords' && (
              <KeywordsStep
                data={data.keywords}
                onNext={handleKeywordsStep}
                onBack={goToPrevStep}
              />
            )}
            
            {currentStep === 'location' && (
              <LocationStep
                data={data.location}
                onComplete={handleComplete}
                onBack={goToPrevStep}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/50 py-4">
        <p className="text-center text-xs text-zinc-600">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </footer>
    </div>
  )
}

