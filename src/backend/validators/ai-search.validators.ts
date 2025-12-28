import { z } from "zod"

// Used when manually saving a search result (if applicable)
// or validating data coming from the AI service
export const aiSearchResultSchema = z.object({
  keywordId: z.string().uuid(),
  query: z.string().min(1),
  response: z.string().min(1),
  modelUsed: z.string().min(1),
  urlsFound: z.array(z.any()).optional(), // Can be refined if we know the structure of WebSearchResult
  isMentioned: z.boolean().default(false),
  rank: z.number().int().optional(),
})

export type AiSearchResultInput = z.infer<typeof aiSearchResultSchema>

