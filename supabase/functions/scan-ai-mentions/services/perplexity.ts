import { ServiceParams, SearchResult, WebSearchResult } from './types.ts'

export async function searchPerplexity(
  { term, persona, location }: ServiceParams,
  apiKey: string
): Promise<SearchResult> {
  if (!apiKey) throw new Error("PERPLEXITY_API_KEY is not set.")

  const systemPrompt = persona 
    ? `You are acting as: ${persona}. Provide a detailed answer to the user's query.`
    : "You are a helpful assistant. Provide a detailed answer including relevant URLs if available."

  const locationContext = location 
    ? `Context: User is located in ${location.city || ''}, ${location.country || ''}.`
    : ''

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar-pro', 
      messages: [
        { role: 'system', content: `${systemPrompt} ${locationContext}` },
        { role: 'user', content: term }
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Perplexity API Error: ${error}`)
  }

  const data = await response.json()
  const responseText = data.choices?.[0]?.message?.content || ""
  
  // Extract citations
  let extractedUrls: WebSearchResult[] = []
  
  if (data.citations) {
    extractedUrls = (data.citations as string[]).map((url, index) => ({
      title: '',
      link: url,
      snippet: '',
      rank: index + 1
    }))
  }

  return {
    responseText,
    modelUsed: 'sonar-pro',
    extractedUrls
  }
}
