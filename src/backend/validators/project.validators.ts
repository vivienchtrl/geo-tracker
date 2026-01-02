import { z } from "zod"

export const LLM_SERVICES = ["chatgpt", "perplexity", "grok", "mistral", "anthropic", "gemini"] as const
export type LlmService = typeof LLM_SERVICES[number]

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  url: z.string().url("Must be a valid URL"),
})

export const updateProjectSchema = createProjectSchema.partial()

export const updateEnabledLlmSchema = z.object({
  enabledLlm: z.array(z.enum(LLM_SERVICES)).min(1, "At least one LLM must be enabled"),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type UpdateEnabledLlmInput = z.infer<typeof updateEnabledLlmSchema>

