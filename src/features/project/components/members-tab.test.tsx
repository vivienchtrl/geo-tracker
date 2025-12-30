import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MembersTab } from './members-tab'

// Mock server actions
vi.mock('@/features/project/members-actions', () => ({
  inviteMemberAction: vi.fn().mockResolvedValue({ success: true }),
  removeMemberAction: vi.fn().mockResolvedValue({ success: true }),
  cancelInvitationAction: vi.fn().mockResolvedValue({ success: true }),
}))

// Mock UI components that might cause issues in jsdom
vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange }: any) => <div data-testid="select">{children}</div>,
  SelectTrigger: ({ children }: any) => <button>{children}</button>,
  SelectValue: () => <span>Select Role</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value, onClick }: any) => (
    <div role="option" data-value={value} onClick={onClick}>
      {children}
    </div>
  ),
}))

const mockMembers = [
  { id: '1', email: 'owner@test.com', role: 'owner' as const },
  { id: '2', email: 'editor@test.com', role: 'editor' as const },
]

const mockInvitations = [
  { id: 'inv1', email: 'pending@test.com', role: 'viewer' as const, createdAt: new Date().toISOString() }
]

describe('MembersTab', () => {
  it('renders members list', () => {
    render(
      <MembersTab
        projectId="p1"
        members={mockMembers}
        invitations={[]}
        currentUserRole="owner"
      />
    )
    
    expect(screen.getByText('owner@test.com')).toBeInTheDocument()
    expect(screen.getByText('editor@test.com')).toBeInTheDocument()
    // Check role badges
    expect(screen.getAllByText('owner')).toHaveLength(1)
    expect(screen.getAllByText('editor')).toHaveLength(1)
  })

  it('shows invite form only for owners', () => {
    const { rerender } = render(
      <MembersTab
        projectId="p1"
        members={mockMembers}
        invitations={[]}
        currentUserRole="owner"
      />
    )
    expect(screen.getByText('Invite New Collaborator')).toBeInTheDocument()

    rerender(
      <MembersTab
        projectId="p1"
        members={mockMembers}
        invitations={[]}
        currentUserRole="viewer"
      />
    )
    expect(screen.queryByText('Invite New Collaborator')).not.toBeInTheDocument()
  })

  it('renders pending invitations', () => {
    render(
      <MembersTab
        projectId="p1"
        members={mockMembers}
        invitations={mockInvitations}
        currentUserRole="owner"
      />
    )
    expect(screen.getByText('Pending Authorizations')).toBeInTheDocument()
    expect(screen.getByText('pending@test.com')).toBeInTheDocument()
  })
})


