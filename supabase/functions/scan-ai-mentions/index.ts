import { corsHeaders } from './utils/cors.ts'
import { initSupabase, initOpenAI, initMistral, initGemini, getApiKeys } from './utils/clients.ts'
import { getActiveKeywords, IcpProfile } from './actions/keywords.ts'
import { performSearch, analyzeSentiment } from './actions/search.ts'
import { saveScanResult, saveMention, updateScanWithAnalysis } from './actions/ai-search.ts'

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

    try {
      // 1. Init Clients
      const supabase = initSupabase()
      const openai = initOpenAI()
      const mistral = initMistral()
      const gemini = initGemini()
      const apiKeys = getApiKeys()

      // Define services to test for each combination
      const services = ['chatgpt', 'perplexity', 'gemini', 'mistral']

      // 2. Fetch Active Keywords with ICPs
      const keywords = await getActiveKeywords(supabase)

      if (!keywords || keywords.length === 0) {
        return new Response(JSON.stringify({ message: 'No active keywords found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const results: any[] = []

      // 3. Scan Loop (Keywords x ICPs x Services)
      for (const kw of keywords) {
        
        // Sécurité : Vérifier si project existe avant d'accéder à icp_profiles
        if (!kw.project) {
          console.warn(`Keyword ${kw.term} has no associated project. Skipping.`)
          continue
        }

        // Get ICPs for the project
        // On utilise kw.project (normalisé dans getActiveKeywords)
        const icps = kw.project.icp_profiles || []
        
        const iterations = icps.length > 0 
          ? icps.map((icp: IcpProfile) => ({ 
              persona: icp.name, 
              label: `ICP: ${icp.name}`,
              location: {
                country: icp.country,
                city: icp.city,
                region: icp.region
              }
            })) 
          : [{ persona: undefined, label: 'Default', location: undefined }]

        for (const iter of iterations) {
          console.log(`Scanning for: ${kw.term} [${iter.label}] on all services`)

          // Run all services in parallel for this combination
          const servicePromises = services.map(async (service) => {
            try {
              // Perform Search with Persona
              const { responseText, modelUsed, extractedUrls } = await performSearch({
                service,
                term: kw.term,
                persona: iter.persona,
                location: iter.location,
                openai,
                mistral,
                gemini,
                apiKeys
              })

              // Analyze Sentiment
              const analysisData = await analyzeSentiment(openai, responseText, kw.project.name)

              // Ensure project_id is included
              const scan = await saveScanResult(supabase, {
                project_id: kw.project_id as string | number,
                keyword_id: kw.id as string | number,
                term: kw.term,
                response: responseText,
                model_used: `${modelUsed} (${iter.label})`,
                urls_found: extractedUrls, // Ceci est maintenant parfaitement typé
              })

              // Update scan with analysis if scan was successfully created
              if (scan) {
                await updateScanWithAnalysis(supabase, {
                  scan_id: scan.id as number,
                  is_mentioned: analysisData.isMentioned || false,
                  sentiment_score: analysisData.sentimentScore || 0,
                  sentiment_label: analysisData.sentimentLabel || 'neutral',
                  rank: extractedUrls.length || 0
                })

                // Save Mention if found
                if (analysisData.isMentioned) {
                  await saveMention(supabase, {
                    scan_id: scan.id as number,
                    project_id: kw.project_id as string | number,
                    sentiment_score: analysisData.sentimentScore,
                    sentiment_label: analysisData.sentimentLabel,
                  })
                }
              } else {
                console.error('Failed to create scan for keyword:', kw.term)
              }

              return { 
                keyword: kw.term, 
                icp: iter.label,
                mentioned: analysisData.isMentioned, 
                model: modelUsed, 
                urls: extractedUrls 
              }

            } catch (err: unknown) {
              console.error(`Error processing keyword ${kw.term} [${iter.label}] on ${service}:`, err instanceof Error ? err.message : String(err))
              return { keyword: kw.term, icp: iter.label, service, error: err instanceof Error ? err.message : String(err) }
            }
          })

          const batchResults = await Promise.all(servicePromises)
          results.push(...batchResults)
        }
      }

      return new Response(JSON.stringify({ success: true, results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })

    } catch (error: unknown) {
      console.error('Error in scan-ai-mentions function:', error instanceof Error ? error.message : String(error))
      return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }
  }
)