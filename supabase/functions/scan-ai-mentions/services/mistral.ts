import { ServiceParams, SearchResult } from './types.ts'
import { Mistral } from 'mistral'

export async function searchMistral(
  { term, persona, location }: ServiceParams,
  mistral: Mistral
): Promise<SearchResult> {
  const model = 'mistral-large-latest'

  const systemPrompt = persona 
    ? `You are acting as: ${persona}. Use the provided search results to answer the user's query about "${term}".`
    : "You are a helpful assistant. Use the provided search results to answer the user's query."

  const locationContext = location 
    ? `User Location: ${location.city}, ${location.country}`
    : ''

  const finalPrompt = `
${locationContext}

User Query: ${term}
`

  try {
    // Mistral native web search tool
    const response = await (mistral.chat as unknown as { complete: (options: { model: string; messages: { role: string; content: string }[]; tools: { type: string }[]; toolChoice: string }) => Promise<{ choices: { message: { content: string } }[] }> }).complete({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: finalPrompt }
      ],
      tools: [{ type: "web_search" }],
      toolChoice: "auto" 
    })

    const responseContent = response.choices?.[0]?.message?.content
    
    return {
      responseText: typeof responseContent === 'string' ? responseContent : JSON.stringify(responseContent || ""),
      modelUsed: model,
      extractedUrls: [] // Mistral doesn't return structured URLs in response yet
    }

  } catch (error) {
    console.error(`Mistral search failed:`, error)
    throw error
  }
}

