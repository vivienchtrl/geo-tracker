import { ServiceParams, SearchResult, WebSearchResult } from './types.ts'
import { OpenAI } from 'openai'
import { extractUrls } from '../utils/helpers.ts'

export async function searchOpenAI(
  { term, location }: ServiceParams,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _openai: OpenAI
): Promise<SearchResult> {
  // Utilisation du modèle demandé ou gpt-4o compatible avec cet endpoint
  const model = "gpt-4o" 
  
  const apiKey = Deno.env.get('OPENAI_API_KEY')

  try {
    // 1. CIBLAGE DE L'ENDPOINT V1/RESPONSES (Search/Pro features)
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        tools: [{
          type: "web_search_preview", // Utilisation explicite du type preview demandé
          user_location: location ? {
            type: "approximate",
            country: location.country,
            city: location.city,
            region: location.region
          } : undefined
        }],
        input: term // L'API Responses utilise 'input', pas 'messages'
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.warn(`OpenAI Responses API failed: ${errorText}`)
      throw new Error(`Responses API Error: ${errorText}`)
    }

    const data = await response.json()
    
    // DEBUG: Log complet de la réponse pour analyse
    console.log("🔍 OpenAI RAW Data:", JSON.stringify(data, null, 2))

    // Parse l'output spécifique de l'API Responses
    let responseText = ""
    let extractedUrls: WebSearchResult[] = []
    
    // CORRECTION MAJEURE: L'API retourne les events dans 'output'
    // Structure: { object: "response", output: [ { type: "message", ... } ] }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const events = data.output || (Array.isArray(data) ? data : [])

    // Recherche du message assistant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messageEvent = events.find((e: any) => e.type === "message" && e.role === "assistant")

    if (messageEvent && messageEvent.content) {
      console.log("🔍 Message Content found:", JSON.stringify(messageEvent.content, null, 2))

      // Le contenu est un tableau de parties (parts)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const outputTextPart = messageEvent.content.find((c: any) => c.type === "output_text")
      
      if (outputTextPart) {
        responseText = outputTextPart.text || ""
        
        // Extraction des annotations (citations) fournies par l'outil web_search
        if (outputTextPart.annotations) {
          console.log("🔍 Annotations found:", JSON.stringify(outputTextPart.annotations, null, 2))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          extractedUrls = outputTextPart.annotations
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((a: any) => a.type === "url_citation")
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((a: any, index: number) => ({
              title: a.title || '',
              link: a.url,
              snippet: a.text || '', 
              rank: index + 1
            }))
        } else {
            console.log("⚠️ No annotations found in output_text part")
        }
      }
    } else {
        console.log("⚠️ No assistant message event found (checked in 'output' array)")
    }

    // Fallback: extraction regex si la structure d'annotations est vide mais qu'il y a du texte
    if (extractedUrls.length === 0 && responseText) {
       console.log("ℹ️ Fallback: Extracting URLs via Regex from text...")
       const plainUrls = extractUrls(responseText)
       extractedUrls = plainUrls.map((url, index) => ({
        title: '',
        link: url,
        snippet: '',
        rank: index + 1
      }))
    }

    return {
      responseText,
      modelUsed: model,
      extractedUrls
    }

  } catch (error) {
    console.error('OpenAI Responses API attempt failed:', error)
    throw error
  }
}
