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
  id: number
  name: string
  icp_profiles: IcpProfile[]
}

export interface Keyword {
  id: number
  term: string
  project_id: number
  is_active: boolean
  project?: Project
  projects?: Project[] 
}

export async function getActiveKeywords(supabase: SupabaseClient): Promise<Keyword[]> {
  // On récupère tout, Supabase renvoie souvent les relations sous le nom de la table
  const { data: keywords, error } = await supabase
    .from('keywords')
    // On essaie de récupérer 'projects' (nom de la table) ET 'project' (nom parfois inféré par postgrest)
    // Pour être sûr, on demande explicitement la table 'projects'
    .select('*, projects(*, icp_profiles(*))')
    .eq('is_active', true)

  if (error) throw error

  // Normalisation des données pour le reste du script
  // Si Supabase renvoie 'projects' (objet ou tableau), on le mappe vers une propriété standard 'project'
  return (keywords as Keyword[]).map((kw: Keyword) => ({
    ...kw,
    project: Array.isArray(kw.projects) ? kw.projects[0] : kw.projects
  }))
}
