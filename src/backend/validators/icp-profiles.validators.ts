import { z } from "zod"

export const createIcpProfileSchema = z.object({
  name: z.string().min(1, "Profile name is required"),
  description: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  region: z.string().min(1, "Region is required"),
  city: z.string().min(1, "City is required"),
  language: z.string().min(2, "Language code is required (e.g., 'en')"),
})

export const updateIcpProfileSchema = createIcpProfileSchema.partial()

export type CreateIcpProfileInput = z.infer<typeof createIcpProfileSchema>
export type UpdateIcpProfileInput = z.infer<typeof updateIcpProfileSchema>

