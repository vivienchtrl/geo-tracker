import { SupabaseClient } from '@supabase/supabase-js'

export interface IcpProfile {
  id: number
  persona: string
  name: string
  country: string
  city: string
  region: string
}

export interface Project {
  id: string
  name: string
  url: string // Added project URL
  enabled_llm: string[]
  daily_limit: number
  icp_profiles: IcpProfile[]
}

export interface Keyword {
  id: string
  term: string
  project_id: string
  is_active: boolean
  project?: Project
  projects?: Project[] 
}

export async function getActiveKeywords(supabase: SupabaseClient): Promise<Keyword[]> {
  // On récupère tout, Supabase renvoie souvent les relations sous le nom de la table
  const { data: keywords, error } = await supabase
    .from('keywords')
    // On récupère 'projects' avec les nouvelles colonnes dont l'URL
    .select('*, projects(id, name, url, enabled_llm, daily_limit, icp_profiles(*))')
    .eq('is_active', true)

  if (error) throw error

  // Normalisation des données pour le reste du script
  // Si Supabase renvoie 'projects' (objet ou tableau), on le mappe vers une propriété standard 'project'
  return (keywords as Keyword[]).map((kw: Keyword) => ({
    ...kw,
    project: Array.isArray(kw.projects) ? kw.projects[0] : kw.projects
  }))
}
