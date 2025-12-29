import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AnalyticsMetrics } from './analytics-metrics'

describe('AnalyticsMetrics', () => {
  it('renders all metrics correctly', () => {
    render(
      <AnalyticsMetrics
        totalVisits={1234}
        uniqueVisitors={567}
        pageviews={890}
        avgTimeOnPage={125} // 2m 5s
        bounceRate={45.5}
      />
    )

    // Check labels
    expect(screen.getByText('Total Visits')).toBeInTheDocument()
    expect(screen.getByText('Unique Visitors')).toBeInTheDocument()
    expect(screen.getByText('Avg. Time on Page')).toBeInTheDocument()

    // Check formatted values
    expect(screen.getByText('1,234')).toBeInTheDocument()
    expect(screen.getByText('567')).toBeInTheDocument()
    expect(screen.getByText('2m 5s')).toBeInTheDocument()
    expect(screen.getByText('45.5%')).toBeInTheDocument()
  })

  it('formats time correctly for less than a minute', () => {
    render(
      <AnalyticsMetrics
        totalVisits={0}
        uniqueVisitors={0}
        pageviews={0}
        avgTimeOnPage={45}
        bounceRate={0}
      />
    )
    expect(screen.getByText('45s')).toBeInTheDocument()
  })
})

