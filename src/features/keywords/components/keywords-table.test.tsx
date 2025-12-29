import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KeywordsTable } from './keywords-table'

// Mock data structure matching KeywordData interface roughly
const mockData = [
  {
    id: '1',
    term: 'ai analytics',
    projectId: 'p1',
    createdAt: new Date(),
    updatedAt: new Date(),
    keywordId: 'k1',
    domain: 'example.com',
    keywords: 'ai, analytics',
    keywordsTags: 'saas',
    visibilityRate: 45,
    avgRank: 3,
    competitors: [
      { domain: 'comp1.com' },
      { domain: 'comp2.com' }
    ]
  },
  {
    id: '2',
    term: 'seo tools',
    projectId: 'p1',
    createdAt: new Date(),
    updatedAt: new Date(),
    keywordId: 'k2',
    domain: 'example.com',
    keywords: 'seo',
    keywordsTags: null,
    visibilityRate: 0,
    avgRank: 0,
    competitors: []
  }
]

describe('KeywordsTable', () => {
  it('renders a list of keywords', () => {
    render(<KeywordsTable data={mockData as any} />)
    
    // Check headers
    expect(screen.getByText('Request & Keywords')).toBeInTheDocument()
    expect(screen.getByText('Visibility')).toBeInTheDocument()

    // Check first item
    expect(screen.getByText('ai analytics')).toBeInTheDocument()
    expect(screen.getByText('45%')).toBeInTheDocument()
    expect(screen.getByText('#3')).toBeInTheDocument()
    expect(screen.getByText('comp1.com')).toBeInTheDocument()
    expect(screen.getByText('saas')).toBeInTheDocument()

    // Check second item
    expect(screen.getByText('seo tools')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
    const dashes = screen.getAllByText('—')
    expect(dashes).toHaveLength(2) // Rank 0 and no competitors both show —
  })

  it('renders correctly with empty data', () => {
    render(<KeywordsTable data={[]} />)
    expect(screen.getByText('Keyword Performance')).toBeInTheDocument()
    // Should have no rows in body
    const rows = screen.queryAllByRole('row')
    // 1 header row
    expect(rows).toHaveLength(1)
  })
})

