import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CrawlerLogsTable } from './crawler-logs-table'

const mockLogs = [
  {
    id: '1',
    botName: 'GPTBot',
    path: '/pricing',
    createdAt: '10:00 AM',
    source: 'script'
  },
  {
    id: '2',
    botName: 'ClaudeBot',
    path: '/blog',
    createdAt: '11:00 AM',
    source: 'pixel-noscript'
  }
]

describe('CrawlerLogsTable', () => {
  it('renders list of crawler logs', () => {
    render(<CrawlerLogsTable data={mockLogs} />)

    expect(screen.getByText('GPTBot')).toBeInTheDocument()
    expect(screen.getByText('/pricing')).toBeInTheDocument()
    expect(screen.getByText('10:00 AM')).toBeInTheDocument()
    
    // Check source badges (using text content match since it might be split)
    expect(screen.getByText('JS Script')).toBeInTheDocument()
    
    expect(screen.getByText('ClaudeBot')).toBeInTheDocument()
    expect(screen.getByText('Pixel')).toBeInTheDocument()
  })

  it('renders empty state', () => {
    render(<CrawlerLogsTable data={[]} />)
    expect(screen.getByText('No Crawler Activity Detected')).toBeInTheDocument()
  })
})

