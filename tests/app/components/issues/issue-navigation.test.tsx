import { render, screen, fireEvent } from '@testing-library/react'
import React, { act } from 'react'

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
    mockUseCurrentUser.mockReturnValue({ user: { linearId: '123' } as User, isLoading: false, error: null })
    mockUseIssues.mockReturnValue({
      currentIssue: mockIssues[1],
      setCurrentIssue: mockSetCurrentIssue,
      issues: mockIssues,
      setIssues: jest.fn(),
      isLoading: false,
      loadIssues: jest.fn(),
    })
  })

  it('should render navigation buttons when user has linearId', () => {
    render(<IssueNavigation />)
    expect(screen.getByLabelText('Previous Issue')).toBeInTheDocument()
    expect(screen.getByLabelText('Next Issue')).toBeInTheDocument()
  })

  it('should not render navigation buttons when user has no linearId', () => {
    mockUseCurrentUser.mockReturnValue({ user: { linearId: null } as User, isLoading: false, error: null })
    render(<IssueNavigation />)
    expect(screen.queryByLabelText('Previous Issue')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Next Issue')).not.toBeInTheDocument()
  })

  it('should navigate to previous issue when previous button is clicked', () => {
    render(<IssueNavigation />)
    const prevButton = screen.getByLabelText('Previous Issue')
    act(() => {
      fireEvent.click(prevButton)
    })
    expect(mockSetCurrentIssue).toHaveBeenCalledWith(mockIssues[0])
  })

  it('should navigate to next issue when next button is clicked', () => {
    render(<IssueNavigation />)
    const nextButton = screen.getByLabelText('Next Issue')
    act(() => {
      fireEvent.click(nextButton)
    })
    expect(mockSetCurrentIssue).toHaveBeenCalledWith(mockIssues[2])
  })

  it('should disable previous button when on first issue', () => {
    mockUseIssues.mockReturnValue({
      currentIssue: mockIssues[0],
      setCurrentIssue: mockSetCurrentIssue,
      issues: mockIssues,
      setIssues: jest.fn(),
      isLoading: false,
      loadIssues: jest.fn(),
    } as ReturnType<typeof useIssues>)
    render(<IssueNavigation />)
    const prevButton = screen.getByLabelText('Previous Issue')
    expect(prevButton).toBeDisabled()
  })

  it('should disable next button when on last issue', () => {
    mockUseIssues.mockReturnValue({
      currentIssue: mockIssues[2],
      setCurrentIssue: mockSetCurrentIssue,
      issues: mockIssues,
      setIssues: jest.fn(),
      isLoading: false,
      loadIssues: jest.fn(),
    })
    render(<IssueNavigation />)
    const nextButton = screen.getByLabelText('Next Issue')
    expect(nextButton).toBeDisabled()
  })

  it('should not navigate when there is no current issue', () => {
    mockUseIssues.mockReturnValue({
      currentIssue: null,
      setCurrentIssue: mockSetCurrentIssue,
      issues: mockIssues,
      setIssues: jest.fn(),
      isLoading: false,
      loadIssues: jest.fn(),
    })
    render(<IssueNavigation />)
    const prevButton = screen.getByLabelText('Previous Issue')
    const nextButton = screen.getByLabelText('Next Issue')
    act(() => {
      fireEvent.click(prevButton)
      fireEvent.click(nextButton)
    })
    expect(mockSetCurrentIssue).not.toHaveBeenCalled()
  })

  it('should handle navigation when current issue is not in the issues array', () => {
    mockUseIssues.mockReturnValue({
      currentIssue: { id: '4', title: 'Unknown Issue' } as Issue,
      setCurrentIssue: mockSetCurrentIssue,
      issues: mockIssues,
      setIssues: jest.fn(),
      isLoading: false,
      loadIssues: jest.fn(),
    })
    render(<IssueNavigation />)
    const prevButton = screen.getByLabelText('Previous Issue')
    const nextButton = screen.getByLabelText('Next Issue')
    act(() => {
      fireEvent.click(prevButton)
      fireEvent.click(nextButton)
    })
    expect(mockSetCurrentIssue).not.toHaveBeenCalled()
  })
})
