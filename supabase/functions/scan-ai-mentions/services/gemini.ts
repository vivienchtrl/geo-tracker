import { ServiceParams, SearchResult, WebSearchResult } from './types.ts'
import { GoogleGenAI } from '@google/genai'

interface GroundingChunk {
  web?: {
    uri?: string
    title?: string
  }
}

interface GroundingMetadata {
  groundingChunks?: GroundingChunk[]
}

interface ExtendedCandidate {
  groundingMetadata?: GroundingMetadata
}

export async function searchGemini(
  { term, persona, location }: ServiceParams,
  gemini: GoogleGenAI
): Promise<SearchResult> {
  const modelName = 'gemini-2.5-flash-lite'
  
  const groundingTool = {
    googleSearch: {},
  }

  const config = {
    tools: [groundingTool],
  }

  const systemPrompt = persona 
    ? `You are acting as: ${persona}.`
    : "You are a helpful assistant."

  const locationContext = location 
    ? `User Location: ${location.city}, ${location.country}`
    : ''

  const prompt = `${systemPrompt} ${locationContext}
  
  Search query: ${term}
  
  Provide a detailed answer with sources.`

  try {
    const result = await gemini.models.generateContent({
      model: modelName,
      contents: prompt,
      config,
    })
    
    const text = result.text || result.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    const candidates = result.candidates
    const firstCandidate = candidates?.[0] as unknown as ExtendedCandidate | undefined
    const groundingMetadata = firstCandidate?.groundingMetadata
    
    let extractedUrls: WebSearchResult[] = []

    if (groundingMetadata?.groundingChunks) {
      const chunks = groundingMetadata.groundingChunks
      extractedUrls = chunks
        .filter((chunk) => chunk.web?.uri)
        .map((chunk, index) => ({
          title: chunk.web?.title || '',
          link: chunk.web?.uri || '',
          snippet: '',
          rank: index + 1
        }))
    }

    return {
      responseText: text,
      modelUsed: modelName,
      extractedUrls
    }
  } catch (error) {
    console.error("Gemini search failed:", error)
    throw error
  }
}
