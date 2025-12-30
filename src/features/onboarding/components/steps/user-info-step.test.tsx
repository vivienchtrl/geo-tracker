import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UserInfoStep } from './user-info-step'

describe('UserInfoStep', () => {
  const mockOnNext = vi.fn()
  const defaultData = { firstName: '', lastName: '' }

  it('renders form fields', () => {
    render(<UserInfoStep data={defaultData} onNext={mockOnNext} />)
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument()
  })

  it('calls onNext with form data when submitted', async () => {
    render(<UserInfoStep data={defaultData} onNext={mockOnNext} />)

    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } })

    fireEvent.click(screen.getByRole('button', { name: /Continue/i }))

    await waitFor(() => {
      expect(mockOnNext).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe'
      })
    })
  })

  it('pre-fills data from props', () => {
    const filledData = { firstName: 'Jane', lastName: 'Smith' }
    render(<UserInfoStep data={filledData} onNext={mockOnNext} />)
    
    expect(screen.getByDisplayValue('Jane')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Smith')).toBeInTheDocument()
  })
})


