import { render, screen } from '@testing-library/react'
import React from 'react'

import IssueDisplay from '@aces/components/issues/issue-display'
import User from '@aces/interfaces/user'
import { View } from '@aces/interfaces/view'
import useCurrentUser from '@aces/lib/hooks/auth/use-current-user'



jest.mock('@aces/lib/hooks/auth/use-current-user')
jest.mock('@aces/components/issues/issue-content', () => ({
  __esModule: true,
  default: () => <div data-testid="issue-content">Issue Content</div>
}))
jest.mock('@aces/components/issues/loading-issues', () => ({
  __esModule: true,
  default: () => <div data-testid="loading-issues">Loading Issues</div>
}))
jest.mock('@aces/components/view-dropdown', () => ({
  __esModule: true,
  default: () => <div data-testid="view-dropdown">View Dropdown</div>
}))
jest.mock('@aces/components/ui/separator', () => ({
  __esModule: true,
  Separator: () => <hr role="separator" />
}))

const mockUseCurrentUser = useCurrentUser as jest.MockedFunction<typeof useCurrentUser>

describe('IssueDisplay', () => {
  const mockViews: View[] = [
    { id: '1', name: 'View 1' },
    { id: '2', name: 'View 2' }
  ] as View[]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render LoadingIssues when isLoading is true', () => {
    mockUseCurrentUser.mockReturnValue({
      user: undefined,
      isLoading: true,
      error: null
    })

    render(<IssueDisplay views={mockViews} />)

    expect(screen.getByTestId('loading-issues')).toBeInTheDocument()
    expect(screen.queryByTestId('issue-content')).not.toBeInTheDocument()
  })

  it('should render ViewDropdown for authenticated users', () => {
    const mockUser: User = {
      linearId: 'user1',
      id: '',
      email: null,
      displayName: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    mockUseCurrentUser.mockReturnValue({
      user: mockUser,
      isLoading: false,
      error: null
    })

    render(<IssueDisplay views={mockViews} />)

    expect(screen.getByTestId('view-dropdown')).toBeInTheDocument()
    expect(screen.queryByText('Current Issue')).not.toBeInTheDocument()
  })

  it('should render "Current Issue" heading for unauthenticated users', () => {
    mockUseCurrentUser.mockReturnValue({
      user: undefined,
      isLoading: false,
      error: null
    })

    render(<IssueDisplay views={mockViews} />)

    expect(screen.getByText('Current Issue')).toBeInTheDocument()
    expect(screen.queryByTestId('view-dropdown')).not.toBeInTheDocument()
  })

  it('should always render IssueContent when not loading', () => {
    mockUseCurrentUser.mockReturnValue({
      user: undefined,
      isLoading: false,
      error: null
    })

    render(<IssueDisplay views={mockViews} />)

    expect(screen.getByTestId('issue-content')).toBeInTheDocument()
  })

  it('should render Separator', () => {
    mockUseCurrentUser.mockReturnValue({
      user: undefined,
      isLoading: false,
      error: null
    })

    render(<IssueDisplay views={mockViews} />)

    expect(screen.getByRole('separator')).toBeInTheDocument()
  })
})
