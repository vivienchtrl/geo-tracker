import { OpenAI } from 'openai'
import { GoogleGenAI } from '@google/genai'
import { Mistral } from 'mistral'
import { Anthropic } from '@anthropic-ai/sdk'
import { SearchResult, ServiceParams } from '../services/types.ts'
import { searchOpenAI } from '../services/openai.ts'
import { searchPerplexity } from '../services/perplexity.ts'
import { searchGrok } from '../services/grok.ts'
import { searchMistral } from '../services/mistral.ts'
import { searchAnthropic } from '../services/anthropic.ts'
import { searchGemini } from '../services/gemini.ts'
import { extractUrls } from '../utils/helpers.ts'

// Re-export type for compatibility if needed elsewhere
export type { SearchResult } 

// Interface matching the call in index.ts
interface PerformSearchParams extends ServiceParams {
  service: string
  openai: OpenAI
  grok: OpenAI
  mistral: Mistral
  anthropic: Anthropic
  gemini: GoogleGenAI
  apiKeys: {
    perplexity?: string
    gemini?: string
    xai?: string
  }
}

export async function performSearch({ 
  service, 
  term, 
  persona, 
  location, 
  openai, 
  grok, 
  mistral,
  anthropic,
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
        
      case 'grok':
        result = await searchGrok(serviceParams, grok)
        break

      case 'mistral':
        result = await searchMistral(serviceParams, mistral)
        break

      case 'claude':
        result = await searchAnthropic(serviceParams, anthropic)
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
