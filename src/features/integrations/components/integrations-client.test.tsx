import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { IntegrationsClient } from './integrations-client'

// Mock router
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

// Mock sub-components to isolate test
vi.mock('@/features/ai-crawlers/components/api-key-list', () => ({
  ApiKeyList: () => <div data-testid="api-key-list">API Key List Component</div>
}))
vi.mock('@/features/ai-crawlers/components/integration-snippets', () => ({
  IntegrationSnippets: () => <div data-testid="snippets">Snippets Component</div>
}))
vi.mock('@/features/ai-crawlers/components/api-key-create-modal', () => ({
  ApiKeyCreateModal: () => <div data-testid="modal">Modal Component</div>
}))

describe('IntegrationsClient', () => {
  it('renders denied access for non-owners', () => {
    render(
      <IntegrationsClient
        projectId="p1"
        apiKeys={[]}
        isOwner={false}
      />
    )
    expect(screen.getByText('Owner Access Required')).toBeInTheDocument()
    expect(screen.queryByText('API Keys')).not.toBeInTheDocument()
  })

  it('renders main content for owners', () => {
    render(
      <IntegrationsClient
        projectId="p1"
        apiKeys={[]}
        isOwner={true}
      />
    )
    expect(screen.getByText('API Keys')).toBeInTheDocument()
    expect(screen.getByText('Create Key')).toBeInTheDocument()
    expect(screen.getByTestId('api-key-list')).toBeInTheDocument()
    expect(screen.getByTestId('snippets')).toBeInTheDocument()
  })

  it('shows alert for auto-generated key', () => {
    const keysWithPlain = [
      {
        id: '1',
        name: 'Default',
        prefix: 'pk_',
        description: null,
        scopes: [],
        createdAt: new Date(),
        lastUsedAt: null,
        expiresAt: null,
        plaintextKey: 'pk_secret_123'
      }
    ]

    render(
      <IntegrationsClient
        projectId="p1"
        apiKeys={keysWithPlain}
        isOwner={true}
      />
    )
    
    expect(screen.getByText('Your Integration Key is Ready')).toBeInTheDocument()
    expect(screen.getByDisplayValue('pk_secret_123')).toBeInTheDocument()
  })
})

