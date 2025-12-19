import { z } from "zod"

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  url: z.string().url("Must be a valid URL"),
})

export const updateProjectSchema = createProjectSchema.partial()

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>

