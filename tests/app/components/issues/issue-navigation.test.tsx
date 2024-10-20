import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { IssueNavigation } from '@aces/components/issues/issue-navigation'
import { Issue } from '@aces/interfaces/issue'
import User from '@aces/interfaces/user'
import useCurrentUser from '@aces/lib/hooks/auth/use-current-user'
import { useIssues } from '@aces/lib/hooks/issues/issues-context'


jest.mock('@aces/lib/hooks/auth/use-current-user')
jest.mock('@aces/lib/hooks/issues/issues-context')

const mockUseCurrentUser = useCurrentUser as jest.MockedFunction<typeof useCurrentUser>
const mockUseIssues = useIssues as jest.MockedFunction<typeof useIssues>

describe('IssueNavigation', () => {
  const mockSetCurrentIssue = jest.fn()
  const mockIssues = [
    { id: '1', title: 'Issue 1' },
    { id: '2', title: 'Issue 2' },
    { id: '3', title: 'Issue 3' },
  ] as Issue[]

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseCurrentUser.mockReturnValue({ user: { linearId: 'user1' } as User, isLoading: false, error: null })
    mockUseIssues.mockReturnValue({
      currentIssue: mockIssues[1],
      setCurrentIssue: mockSetCurrentIssue,
      issues: mockIssues,
      setIssues: jest.fn(),
      isLoading: false
    })
  })

  it('should render navigation buttons when user has linearId', () => {
    render(<IssueNavigation />)
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
  })

  it('should not render anything when user has no linearId', () => {
    mockUseCurrentUser.mockReturnValue({ user: {} as User, isLoading: false, error: null })
    const { container } = render(<IssueNavigation />)
    expect(container).toBeEmptyDOMElement()
  })

  it('should navigate to the previous issue when clicking the previous button', () => {
    render(<IssueNavigation />)
    const prevButton = screen.getByRole('button', { name: /previous/i })
    fireEvent.click(prevButton)
    expect(mockSetCurrentIssue).toHaveBeenCalledWith(mockIssues[0])
  })

  it('should navigate to the next issue when clicking the next button', () => {
    render(<IssueNavigation />)
    const nextButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(nextButton)
    expect(mockSetCurrentIssue).toHaveBeenCalledWith(mockIssues[2])
  })

  it('should disable the previous button when on the first issue', () => {
    mockUseIssues.mockReturnValue({
      currentIssue: mockIssues[0],
      setCurrentIssue: mockSetCurrentIssue,
      issues: mockIssues,
      setIssues: jest.fn(),
      isLoading: false
    })
    render(<IssueNavigation />)
    const prevButton = screen.getByRole('button', { name: /previous/i })
    expect(prevButton).toBeDisabled()
  })

  it('should disable the next button when on the last issue', () => {
    mockUseIssues.mockReturnValue({
      currentIssue: mockIssues[2],
      setCurrentIssue: mockSetCurrentIssue,
      issues: mockIssues,
      setIssues: jest.fn(),
      isLoading: false
    })
    render(<IssueNavigation />)
    const nextButton = screen.getByRole('button', { name: /next/i })
    expect(nextButton).toBeDisabled()
  })

  it('should not navigate when there is no current issue', () => {
    mockUseIssues.mockReturnValue({
      currentIssue: null,
      setCurrentIssue: mockSetCurrentIssue,
      issues: mockIssues,
      setIssues: jest.fn(),
      isLoading: false
    })
    render(<IssueNavigation />)
    const prevButton = screen.getByRole('button', { name: /previous/i })
    const nextButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(prevButton)
    fireEvent.click(nextButton)
    expect(mockSetCurrentIssue).not.toHaveBeenCalled()
  })

  it('should handle navigation when current issue is not in the issues array', () => {
    mockUseIssues.mockReturnValue({
      currentIssue: { id: '4', title: 'Not in array' } as Issue,
      setCurrentIssue: mockSetCurrentIssue,
      issues: mockIssues,
      setIssues: jest.fn(),
      isLoading: false
    })
    render(<IssueNavigation />)
    const prevButton = screen.getByRole('button', { name: /previous/i })
    const nextButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(prevButton)
    fireEvent.click(nextButton)
    expect(mockSetCurrentIssue).not.toHaveBeenCalled()
  })
})
