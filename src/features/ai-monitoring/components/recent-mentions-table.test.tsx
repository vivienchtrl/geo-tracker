import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RecentMentionsTable } from './recent-mentions-table'

    // Mock SearchDetail data
    const mockMentions: any[] = [
  {
    id: '1',
    query: 'best ai tools',
    engine: 'chatgpt',
    isMentioned: true,
    response: 'Here are the best tools...',
    createdAt: '2024-01-01',
    urlsFound: [
      { title: 'My Tool', link: 'https://example.com', rank: 1 }
    ]
  },
  {
    id: '2',
    query: 'seo strategies',
    engine: 'perplexity',
    isMentioned: false,
    response: 'I do not know.',
    createdAt: '2024-01-02',
    urlsFound: []
  }
]

describe('RecentMentionsTable', () => {
  it('renders mentions correctly', () => {
    render(<RecentMentionsTable data={mockMentions} />)

    // Check headers
    expect(screen.getByText('Query')).toBeInTheDocument()
    expect(screen.getByText('Engine')).toBeInTheDocument()

    // Check first row content
    expect(screen.getByText('best ai tools')).toBeInTheDocument()
    expect(screen.getByText('chatgpt')).toBeInTheDocument()
    expect(screen.getByText('Mentioned')).toBeInTheDocument()

    // Check second row content
    expect(screen.getByText('seo strategies')).toBeInTheDocument()
    expect(screen.getByText('perplexity')).toBeInTheDocument()
    expect(screen.getByText('Not cited')).toBeInTheDocument()
  })

  it('toggles row expansion on click', () => {
    render(<RecentMentionsTable data={mockMentions} />)

    // Initially, details should not be visible
    expect(screen.queryByText('AI Engine Response')).not.toBeInTheDocument()

    // Click on the first row to expand
    const firstRowQuery = screen.getByText('best ai tools')
    fireEvent.click(firstRowQuery)

    // Details should now be visible
    expect(screen.getByText('AI Engine Response')).toBeInTheDocument()
    expect(screen.getByText('Here are the best tools...')).toBeInTheDocument()
    expect(screen.getByText('My Tool')).toBeInTheDocument()
  })

  it('renders empty state when data is empty', () => {
    render(<RecentMentionsTable data={[]} />)
    expect(screen.getByText('No recent mentions found')).toBeInTheDocument()
  })
})

