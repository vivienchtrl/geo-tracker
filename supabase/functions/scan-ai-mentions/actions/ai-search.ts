import { SupabaseClient } from 'jsr:@supabase/supabase-js@2'

// TEMPORARY FIX: Define type locally to bypass import resolution error
export interface WebSearchResult {
  title: string
  link: string
  snippet: string
  rank: number
}

export async function saveScanResult(supabase: SupabaseClient, data: {
  project_id: string | number
  keyword_id: string | number
  term: string
  response: string
  model_used: string
  urls_found: WebSearchResult[] 
}) {
  console.log('Saving scan result:', {
    project_id: data.project_id,
    keyword_id: data.keyword_id,
    query: data.term,
    model_used: data.model_used,
    urls_count: data.urls_found.length
  })

  const { data: scan, error } = await supabase
    .from('ai_search')
    .insert({
      project_id: data.project_id, 
      keyword_id: data.keyword_id,
      query: data.term,
      response: data.response,
      model_used: data.model_used,
      urls_found: data.urls_found, 
    })
    .select()
    .single()

  if (error) {
    console.error('Scan Insert Error', error)
    console.error('Error Details:', JSON.stringify(error, null, 2))
  }
  return scan
}

export async function updateScanWithAnalysis(supabase: SupabaseClient, data: {
  scan_id: number
  is_mentioned: boolean
  sentiment_score: number
  sentiment_label: string
  rank: number
}) {
  const { error } = await supabase
    .from('ai_search')
    .update({
      is_mentioned: data.is_mentioned,
      sentiment_score: data.sentiment_score,
      sentiment_label: data.sentiment_label,
      rank: data.rank 
    })
    .eq('id', data.scan_id)
  
  if (error) console.error('Scan Update Error (Analysis)', error)
}

export async function saveMention(supabase: SupabaseClient, data: {
  scan_id: number
  project_id: number | string
  sentiment_score: number
  sentiment_label: string
}) {
  const { error } = await supabase
    .from('ai_mentions')
    .insert({
      scan_id: data.scan_id,
      project_id: data.project_id,
      sentiment_score: data.sentiment_score,
      sentiment_label: data.sentiment_label
    })
  
  if (error) console.error('Mention Insert Error', error)
}
