import { corsHeaders } from './utils/cors.ts'
import { initSupabase, initOpenAI, initGrok, initMistral, initAnthropic, initGemini, getApiKeys } from './utils/clients.ts'
import { getActiveKeywords, IcpProfile, Keyword } from './actions/keywords.ts'
import { performSearch } from './actions/search.ts'
import { saveScanResult, updateScanWithAnalysis } from './actions/ai-search.ts'
import { normalizeUrl } from './utils/helpers.ts'

type ServiceType = "chatgpt" | "perplexity" | "grok" | "mistral" | "anthropic" | "gemini";

interface Iteration {
  persona?: string;
  label: string;
  location?: {
    country: string;
    city: string;
    region: string;
  };
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Init Clients
    const supabase = initSupabase()
    const openai = initOpenAI()
    const grok = initGrok()
    const mistral = initMistral()
    const anthropic = initAnthropic()
    const gemini = initGemini()
    const apiKeys = getApiKeys()

    // 2. Fetch Active Keywords with ICPs
    const allKeywords = await getActiveKeywords(supabase)

    if (!allKeywords || allKeywords.length === 0) {
      return new Response(JSON.stringify({ message: 'No active keywords found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Group keywords by project to handle per-project limits
    const keywordsByProject = allKeywords.reduce((acc: Record<string, Keyword[]>, kw) => {
      const projId = kw.project?.id || kw.project_id;
      if (!acc[projId]) acc[projId] = [];
      acc[projId].push(kw);
      return acc;
    }, {});

    const results: Array<{
      keyword?: string;
      icp?: string;
      mentioned?: boolean;
      rank?: number;
      model?: string;
      service?: string;
      error?: string;
    }> = []

    // 3. Scan Loop (Project by Project)
    for (const projId in keywordsByProject) {
      const projectKeywords = keywordsByProject[projId];
      const proj = projectKeywords[0].project;

      if (!proj) continue;

      const enabledLlms = (proj.enabled_llm || ['chatgpt', 'perplexity']) as ServiceType[];
      const dailyLimit: number = proj.daily_limit || 50;
      const icps: IcpProfile[] = proj.icp_profiles || [];

      // Prepare ICP iterations
      const iterations: Iteration[] = icps.length > 0 
        ? icps.map((icp: IcpProfile) => ({ 
            persona: icp.name, 
            label: `ICP: ${icp.name}`,
            location: {
              country: icp.country,
              city: icp.city,
              region: icp.region
            }
          })) 
        : [{ persona: undefined, label: 'Default', location: undefined }];

      // Generate all possible combinations (KW x ICP x LLM)
      const allCombinations: Array<{ kw: Keyword; iter: Iteration; service: ServiceType }> = [];
      for (const kw of projectKeywords) {
        for (const iter of iterations) {
          for (const service of enabledLlms) {
            allCombinations.push({ kw, iter, service });
          }
        }
      }

      // Apply Daily Limit: take a random sample of combinations up to the limit
      const limitedCombinations = allCombinations
        .sort(() => Math.random() - 0.5)
        .slice(0, dailyLimit);

      console.log(`Project: ${proj.name} | Budget: ${dailyLimit} | Required: ${allCombinations.length} | Executing: ${limitedCombinations.length}`);

      // Run combinations in batches to avoid overwhelming APIs
      const batchSize = 3;
      for (let i = 0; i < limitedCombinations.length; i += batchSize) {
        const batch = limitedCombinations.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async ({ kw, iter, service }) => {
          try {
            console.log(`Scanning: ${kw.term} [${iter.label}] on ${service}`);

            const { responseText, modelUsed, extractedUrls } = await performSearch({
              service,
              term: kw.term,
              persona: iter.persona,
              location: iter.location,
              openai,
              grok,
              mistral,
              anthropic,
              gemini,
              apiKeys,
            } as any)

            // 1. Determine if the brand is mentioned
            const projectDomain = normalizeUrl(proj.url);
            const isUrlMentioned = extractedUrls.some(u => normalizeUrl(u.link).includes(projectDomain));
            const isTextMentioned = responseText.toLowerCase().includes(proj.name.toLowerCase()) || 
                                   responseText.toLowerCase().includes(projectDomain);
            
            const isMentioned = isUrlMentioned || isTextMentioned;

            // 2. Calculate Rank
            let rank = 0;
            const foundIndex = extractedUrls.findIndex(u => normalizeUrl(u.link).includes(projectDomain));
            if (foundIndex !== -1) {
              rank = foundIndex + 1;
            }

            // 3. Save Results
            const scan = await saveScanResult(supabase, {
              project_id: kw.project_id as string | number,
              keyword_id: kw.id as string | number,
              term: kw.term,
              response: responseText,
              model_used: `${modelUsed} (${iter.label})`,
              urls_found: extractedUrls,
            })

              if (scan) {
                // @ts-expect-error - bypassing phantom type mismatch for sentiment fields
                await updateScanWithAnalysis(supabase, {
                  scan_id: scan.id as number,
                  is_mentioned: isMentioned,
                  rank: rank,
                })
              }

            return { 
              keyword: kw.term, 
              icp: iter.label,
              mentioned: isMentioned, 
              rank: rank,
              model: modelUsed, 
              service 
            }

          } catch (err: unknown) {
            console.error(`Error processing combination:`, err instanceof Error ? err.message : String(err))
            return { error: err instanceof Error ? err.message : String(err) }
          }
        })

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
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
})
