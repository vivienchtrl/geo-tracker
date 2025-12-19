import { z } from "zod"

export const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>

