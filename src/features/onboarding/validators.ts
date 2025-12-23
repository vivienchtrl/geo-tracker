import { z } from "zod"

// User step validation
export const userStepSchema = z.object({
  firstName: z.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name is too long"),
  lastName: z.string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name is too long"),
})

// Project step validation
export const projectStepSchema = z.object({
  projectName: z.string()
    .min(2, "Project name must be at least 2 characters")
    .max(100, "Project name is too long"),
  projectUrl: z.string()
    .min(3, "Please enter a valid domain or URL"),
  title: z.string().min(2, "Title is required"),
  description: z.string().min(10, "A detailed description is required"),
  suggestedKeywords: z.array(z.string()).optional(),
  enabledLlm: z.array(z.string()).min(1, "Select at least one LLM").default(['chatgpt', 'perplexity']),
  dailyLimit: z.number().min(1).max(500).default(50),
})

// Single keyword validation
export const keywordItemSchema = z.object({
  id: z.string(),
  term: z.string()
    .min(2, "Keyword must be at least 2 characters")
    .max(150, "Keyword is too long"),
  generatedTerm: z.string().optional(),
})

// Keywords step validation
export const keywordsStepSchema = z.object({
  keywords: z.array(keywordItemSchema)
    .min(1, "Please add at least one keyword")
    .max(50, "Maximum 50 keywords allowed"),
})

// Location step validation (optional)
export const locationStepSchema = z.object({
  country: z.string().min(1, "Country is required"),
  region: z.string().optional(),
  city: z.string().optional(),
  language: z.string().min(2, "Language is required"),
}).nullable()

// Complete onboarding data schema
export const completeOnboardingSchema = z.object({
  user: userStepSchema,
  project: projectStepSchema,
  keywords: keywordsStepSchema,
  location: locationStepSchema,
})

export type UserStepInput = z.infer<typeof userStepSchema>
export type ProjectStepInput = z.infer<typeof projectStepSchema>
export type KeywordsStepInput = z.infer<typeof keywordsStepSchema>
export type LocationStepInput = z.infer<typeof locationStepSchema>
export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>

