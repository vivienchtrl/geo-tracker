"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import { cn } from "@/utils/utils"
import { UserInfoStep, ProjectStep, KeywordsStep, LocationStep, TrackerStep } from "./steps"
import { createInitialProject, updateOnboardingKeywords, updateOnboardingLocation, redirectToDashboard } from "../actions"
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
  project: { projectName: "", projectUrl: "", title: "", description: "" },
  keywords: { keywords: [] },
  location: null,
}

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('user')
  const [data, setData] = useState<OnboardingData>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null)

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

  const handleProjectStep = useCallback(async (stepData: ProjectStepData) => {
    setIsSubmitting(true)
    try {
      const result = await createInitialProject(data.user, stepData)
      if (result.success && result.projectId) {
        setCreatedProjectId(result.projectId)
        setData(prev => ({ ...prev, project: stepData }))
        goToNextStep()
      } else {
        toast.error(result.error || "Failed to create project")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }, [data.user, goToNextStep])

  const handleTrackerStep = useCallback(() => {
    goToNextStep()
  }, [goToNextStep])

  const handleKeywordsStep = useCallback(async (stepData: KeywordsStepData) => {
    if (!createdProjectId) return
    setIsSubmitting(true)
    try {
      const result = await updateOnboardingKeywords(createdProjectId, stepData)
      if (result.success) {
        setData(prev => ({ ...prev, keywords: stepData }))
        goToNextStep()
      } else {
        toast.error(result.error || "Failed to save keywords")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }, [createdProjectId, goToNextStep])

  const handleComplete = useCallback(async (locationData: LocationStepData | null) => {
    if (!createdProjectId) return
    setIsSubmitting(true)
    
    try {
      const result = await updateOnboardingLocation(createdProjectId, locationData)
      
      if (!result.success) {
        toast.error(result.error || "Failed to complete onboarding")
        return
      }

      toast.success("Welcome! Your account is ready 🎉")
      await redirectToDashboard()
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }, [createdProjectId])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center">
      {/* Container with dashed borders */}
      <div className="w-full max-w-5xl border-x border-dashed border-border/40 min-h-screen flex flex-col bg-background">
        
        {/* Header with progress */}
        <header className="relative z-10 border-b border-dashed border-border/40 bg-background/80 backdrop-blur-xl">
          <div className="w-full px-6 py-6">
            {/* Logo */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">G</span>
                </div>
                <span className="text-xl font-semibold">Geo Tracker</span>
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
                          "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 border",
                          isCompleted && "bg-primary text-primary-foreground border-primary",
                          isCurrent && "bg-background text-foreground border-primary ring-2 ring-primary/20",
                          !isCompleted && !isCurrent && "bg-muted text-muted-foreground border-border"
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
                        isCurrent ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {STEP_LABELS[step]}
                      </span>
                    </div>
                    
                    {/* Connector line */}
                    {index < ONBOARDING_STEPS.length - 1 && (
                      <div
                        className={cn(
                          "w-16 h-0.5 mx-2 transition-colors duration-300",
                          index < currentStepIndex ? "bg-primary" : "bg-muted"
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
        <main className="relative z-10 flex-1 flex items-center justify-center p-6 border-b border-dashed border-border/40">
          <div className="w-full max-w-2xl">
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
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
              
              {currentStep === 'tracker' && createdProjectId && (
                <TrackerStep
                  projectId={createdProjectId}
                  onComplete={handleTrackerStep}
                />
              )}
              
              {currentStep === 'keywords' && (
                <KeywordsStep
                  data={data.keywords}
                  onNext={handleKeywordsStep}
                  onBack={goToPrevStep}
                  suggestions={data.project.suggestedKeywords}
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
        <footer className="relative z-10 py-4">
          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </footer>
      </div>
    </div>
  )
}

