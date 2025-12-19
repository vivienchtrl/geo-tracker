import { z } from "zod"

export const createKeywordSchema = z.object({
  term: z.string().min(1, "Keyword term is required"),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
})

export const updateKeywordSchema = z.object({
  term: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  ranking: z.number().int().optional(),
})

export type CreateKeywordInput = z.infer<typeof createKeywordSchema>
export type UpdateKeywordInput = z.infer<typeof updateKeywordSchema>

