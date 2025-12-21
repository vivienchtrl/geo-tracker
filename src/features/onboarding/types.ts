/**
 * Onboarding Types
 * Defines the data structure for the complete onboarding flow
 */

export type OnboardingStep = 'user' | 'project' | 'keywords' | 'location'

export interface UserStepData {
  firstName: string
  lastName: string
}

export interface ProjectStepData {
  projectName: string
  projectUrl: string
}

export interface KeywordItem {
  id: string
  term: string
}

export interface KeywordsStepData {
  keywords: KeywordItem[]
}

export interface LocationStepData {
  country: string
  region: string
  city: string
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

export const ONBOARDING_STEPS: OnboardingStep[] = ['user', 'project', 'keywords', 'location']

export const STEP_LABELS: Record<OnboardingStep, string> = {
  user: 'Your Profile',
  project: 'Your Website',
  keywords: 'Keywords',
  location: 'Location',
}

