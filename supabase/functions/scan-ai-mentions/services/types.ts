export interface WebSearchResult {
  title: string
  link: string
  snippet: string
  rank: number
}

export interface SearchResult {
  responseText: string
  modelUsed: string
  extractedUrls: WebSearchResult[]
}

export interface ServiceParams {
  term: string
  persona?: string
  location?: {
    country: string
    city: string
    region: string
  }
}

