import { OpenAI } from 'openai'
import { Mistral } from 'mistral'
import { GoogleGenAI } from '@google/genai'
import { SearchResult, ServiceParams } from '../services/types.ts'
import { searchOpenAI } from '../services/openai.ts'
import { searchPerplexity } from '../services/perplexity.ts'
import { searchMistral } from '../services/mistral.ts'
import { searchGemini } from '../services/gemini.ts'
import { extractUrls } from '../utils/helpers.ts'

// Re-export type for compatibility if needed elsewhere
export type { SearchResult } 

// Interface matching the call in index.ts
interface PerformSearchParams extends ServiceParams {
  service: string
  openai: OpenAI
  mistral: Mistral
  gemini: GoogleGenAI
  apiKeys: {
    perplexity?: string
    gemini?: string
  }
}

export async function performSearch({ 
  service, 
  term, 
  persona, 
  location, 
  openai, 
  mistral, 
  gemini, 
  apiKeys 
}: PerformSearchParams): Promise<SearchResult> {
  
  const serviceParams: ServiceParams = {
    term,
    persona,
    location
  }

  let result: SearchResult

  try {
    switch (service) {
      case 'chatgpt':
        result = await searchOpenAI(serviceParams, openai)
        break
        
      case 'perplexity':
        if (!apiKeys.perplexity) throw new Error("PERPLEXITY_API_KEY is not set.")
        result = await searchPerplexity(serviceParams, apiKeys.perplexity)
        break
        
      case 'gemini':
        result = await searchGemini(serviceParams, gemini)
        break
        
      case 'mistral':
        result = await searchMistral(serviceParams, mistral)
        break
        
      default:
        throw new Error(`Unsupported service: ${service}`)
    }

    // Fallback: If no URLs extracted by the specific service handler, try regex on text
    if (result.extractedUrls.length === 0 && result.responseText) {
      const plainUrls = extractUrls(result.responseText)
      if (plainUrls.length > 0) {
        result.extractedUrls = plainUrls.map((url, index) => ({
          title: '',
          link: url,
          snippet: '',
          rank: index + 1
        }))
      }
    }

    return result

  } catch (error) {
    console.error(`Error in performSearch for ${service}:`, error)
    throw error
  }
}

export async function analyzeSentiment(openai: OpenAI, text: string, projectName: string) {
  try {
  const analysis = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "Analyze the following text. Look for mentions of the brand: " + projectName + ". Return JSON: { isMentioned: boolean, sentimentScore: number (-100 to 100), sentimentLabel: string }" },
      { role: "user", content: text }
    ],
    model: "gpt-4o-mini",
    response_format: { type: "json_object" }
  })

  return JSON.parse(analysis.choices[0].message.content || "{}")
  } catch (error) {
    console.error("Sentiment analysis failed:", error)
    return { isMentioned: false, sentimentScore: 0, sentimentLabel: 'neutral' }
  }
}
