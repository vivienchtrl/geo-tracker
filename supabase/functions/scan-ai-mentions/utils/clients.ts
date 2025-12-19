import { createClient } from '@supabase/supabase-js'
import { OpenAI } from 'openai'
import { Mistral } from 'mistral'
import { GoogleGenAI } from '@google/genai'

export const initSupabase = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
}

export const initOpenAI = () => {
  return new OpenAI({
    apiKey: Deno.env.get('OPENAI_API_KEY'),
  })
}

export const initMistral = () => {
  return new Mistral({ apiKey: Deno.env.get('MISTRAL_API_KEY') || '' })
}

export const initGemini = () => {
  return new GoogleGenAI({ apiKey: Deno.env.get('GEMINI_API_KEY') || '' })
}

export const getApiKeys = () => ({
  perplexity: Deno.env.get('PERPLEXITY_API_KEY'),
  gemini: Deno.env.get('GEMINI_API_KEY'),
})
