import { z } from "zod"

export const keywordsTagsEnum = ["brand", "generic", "commercial", "informational", "navigational", "transactional"] as const;

export const createKeywordSchema = z.object({
  term: z.string().min(1, "Sentence request is required"),
  keywords: z.string().min(1, "Specific keywords are required"),
  keywordsTags: z.enum(keywordsTagsEnum).default("generic"),
  isActive: z.boolean().default(true),
})

export const updateKeywordSchema = z.object({
  term: z.string().min(1).optional(),
  keywords: z.string().min(1).optional(),
  keywordsTags: z.enum(keywordsTagsEnum).optional(),
  isActive: z.boolean().optional(),
  ranking: z.number().int().optional(),
})

export type CreateKeywordInput = z.infer<typeof createKeywordSchema>
export type UpdateKeywordInput = z.infer<typeof updateKeywordSchema>

