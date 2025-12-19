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
    // 1. Try with Web Search Tool
    // Interface for Mistral chat completion with tools
    interface MistralChatWithTools {
      complete(params: {
        model: string;
        messages: Array<{ role: string; content: string }>;
        tools?: Array<{ type: string }>;
        toolChoice?: string;
      }): Promise<{
        choices: Array<{
          message: {
            content: string | null
          }
        }>
      }>
    }

    const response = await (mistral.chat as unknown as MistralChatWithTools).complete({
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
      extractedUrls: []
    }

  } catch (error) {
    // 2. Fallback: Standard Generation
    console.warn(`Mistral Native Web Search failed/unsupported: ${error}`)
    
    try {
       const fallbackResponse = await mistral.chat.complete({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: finalPrompt }
        ]
      })
      
      const responseContent = fallbackResponse.choices?.[0]?.message?.content
      return {
        responseText: typeof responseContent === 'string' ? responseContent : JSON.stringify(responseContent || ""),
        modelUsed: model,
        extractedUrls: []
      }
    } catch (fallbackError) {
       console.error("Mistral fallback failed:", fallbackError)
       throw fallbackError
    }
  }
}
