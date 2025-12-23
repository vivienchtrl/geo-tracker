/**
 * Onboarding Types
 * Defines the data structure for the complete onboarding flow
 */

export type OnboardingStep = 'user' | 'project' | 'tracker' | 'keywords' | 'location'

export interface UserStepData {
  firstName: string
  lastName: string
}

export interface ProjectStepData {
  dailyLimit: number | SQL<unknown> | Placeholder<string, any> | null | undefined
  enabledLlm: any
  projectName: string
  projectUrl: string
  title: string
  description: string
  suggestedKeywords?: string[]
}

export interface KeywordItem {
  id: string
  term: string // The original keyword
  generatedTerm?: string // The AI generated sentence
}

export interface KeywordsStepData {
  keywords: KeywordItem[]
}

export interface LocationStepData {
  country: string
  region?: string
  city?: string
  language: string
}

export interface OnboardingData {
  user: UserStepData
  project: ProjectStepData
  keywords: KeywordsStepData
  location: LocationStepData | null
}

export interface OnboardingState {
  currentStep: OnboardingStep
  data: OnboardingData
  isSubmitting: boolean
  error: string | null
}

export const ONBOARDING_STEPS: OnboardingStep[] = ['user', 'project', 'tracker', 'keywords', 'location']

export const STEP_LABELS: Record<OnboardingStep, string> = {
  user: 'Your Profile',
  project: 'Your Website',
  tracker: 'Connection',
  keywords: 'Keywords',
  location: 'Location',
}

