import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

import { Issue } from '@aces/interfaces/issue'
import User from '@aces/interfaces/user'
// eslint-disable-next-line import/order
import { View } from '@aces/interfaces/view'



jest.mock('@aces/lib/hooks/auth/use-current-user', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('@aces/lib/hooks/issues/issues-context', () => ({
  __esModule: true,
  useIssues: jest.fn(),
}))

jest.mock('@aces/lib/hooks/views/views-context', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('@aces/components/issues/issue-content', () => ({
  __esModule: true,
  default: ({ handleNavigate }: { handleNavigate: (direction: 'next' | 'previous') => void }) => (
    <div data-testid="issue-content">
      Issue Content
      <button onClick={() => {
        handleNavigate('next')
      }}
      >
Next
      </button>
      <button onClick={() => {
        handleNavigate('previous')
      }}
      >
Previous
      </button>
    </div>
  ),
}))

jest.mock('@aces/components/rounds/loading-round', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="loading-round">Loading...</div>),
}))

jest.mock('@aces/components/view-dropdown', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  default: jest.fn(({ selectedView, setSelectedView }: { selectedView: View, setSelectedView: (view: View) => void }) => (
    <div data-testid="view-dropdown">
      <button onClick={() => {
        setSelectedView({ id: 'view1', name: 'View 1' } as View)
      }}
      >
        Select View 1
      </button>
      <button onClick={() => {
        setSelectedView({ id: 'view2', name: 'View 2' } as View)
      }}
      >
        Select View 2
      </button>
    </div>
  )),
}))

jest.mock('@aces/components/ui/separator', () => ({
  __esModule: true,
  Separator: jest.fn(() => <hr data-testid="separator" />),
}))

import useCurrentUser from '@aces/lib/hooks/auth/use-current-user'
import { useIssues } from '@aces/lib/hooks/issues/issues-context'
// eslint-disable-next-line import/order
import useViews from '@aces/lib/hooks/views/views-context' // Corrected to named import

// eslint-disable-next-line import/order
import AuthenticatedIssueDisplay from '@aces/app/issues/authenticated-issue-display'


describe('AuthenticatedIssueDisplay', () => {
  const mockUser: User = { id: 'user1', name: 'John Doe' } as unknown as User
  const mockIssues: Issue[] = [
    { id: 'issue1', title: 'Issue 1' },
    { id: 'issue2', title: 'Issue 2' },
  ] as Issue[]
  const mockView1: View = { id: 'view1', name: 'View 1' } as View
  const mockView2: View = { id: 'view2', name: 'View 2' } as View

  // Define mock variables
  const mockUseCurrentUser = useCurrentUser as jest.Mock
  const mockUseIssues = useIssues as jest.Mock
  const mockUseViews = useViews as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render LoadingRound when views are loading', () => {
    mockUseCurrentUser.mockReturnValue({ user: mockUser })
    mockUseIssues.mockReturnValue({
      currentIssue: mockIssues[0],
      setCurrentIssue: jest.fn(),
      issues: mockIssues,
      setIssues: jest.fn(),
      isLoading: false,
      loadIssues: jest.fn(),
    } as ReturnType<typeof useIssues>)
    mockUseViews.mockReturnValue({
      isLoading: true,
      selectedView: null,
      setSelectedView: jest.fn(),
    })

    render(<AuthenticatedIssueDisplay />)

    expect(screen.getByTestId('loading-round')).toBeInTheDocument()
  })

  it('should render ViewDropdown when user is authenticated', () => {
    mockUseCurrentUser.mockReturnValue({ user: mockUser })
    mockUseIssues.mockReturnValue({
      currentIssue: mockIssues[0],
      setCurrentIssue: jest.fn(),
      issues: mockIssues,
      setIssues: jest.fn(),
      isLoading: false,
      loadIssues: jest.fn(),
    } as ReturnType<typeof useIssues>)
    mockUseViews.mockReturnValue({
      isLoading: false,
      selectedView: mockView1,
      setSelectedView: jest.fn(),
    })

    render(<AuthenticatedIssueDisplay />)

    expect(screen.getByTestId('view-dropdown')).toBeInTheDocument()
  })

  it('should not render ViewDropdown when user is not authenticated', () => {
    mockUseCurrentUser.mockReturnValue({ user: null })
    mockUseIssues.mockReturnValue({
      currentIssue: mockIssues[0],
      setCurrentIssue: jest.fn(),
      issues: mockIssues,
      setIssues: jest.fn(),
      isLoading: false,
      loadIssues: jest.fn(),
    } as ReturnType<typeof useIssues>)
    mockUseViews.mockReturnValue({
      isLoading: false,
      selectedView: mockView1,
      setSelectedView: jest.fn(),
    })

    render(<AuthenticatedIssueDisplay />)

    expect(screen.queryByTestId('view-dropdown')).not.toBeInTheDocument()
  })

  it('should render IssueContent when a view is selected', () => {
    mockUseCurrentUser.mockReturnValue({ user: mockUser })
    mockUseIssues.mockReturnValue({
      currentIssue: mockIssues[0],
      setCurrentIssue: jest.fn(),
      issues: mockIssues,
      setIssues: jest.fn(),
      isLoading: false,
      loadIssues: jest.fn(),
    } as ReturnType<typeof useIssues>)
    mockUseViews.mockReturnValue({
      isLoading: false,
      selectedView: mockView1,
      setSelectedView: jest.fn(),
    })

    render(<AuthenticatedIssueDisplay />)

    expect(screen.getByTestId('issue-content')).toBeInTheDocument()
  })

  it('should not render IssueContent when no view is selected', () => {
    mockUseCurrentUser.mockReturnValue({ user: mockUser })
    mockUseIssues.mockReturnValue({
      currentIssue: mockIssues[0],
      setCurrentIssue: jest.fn(),
      issues: mockIssues,
      setIssues: jest.fn(),
      isLoading: false,
      loadIssues: jest.fn(),
    } as ReturnType<typeof useIssues>)
    mockUseViews.mockReturnValue({
      isLoading: false,
      selectedView: null,
      setSelectedView: jest.fn(),
    })

    render(<AuthenticatedIssueDisplay />)

    expect(screen.queryByTestId('issue-content')).not.toBeInTheDocument()
  })

  it('should handle view selection correctly', () => {
    const setSelectedViewMock = jest.fn()
    mockUseCurrentUser.mockReturnValue({ user: mockUser })
    mockUseIssues.mockReturnValue({
      currentIssue: mockIssues[0],
      setCurrentIssue: jest.fn(),
      issues: mockIssues,
      setIssues: jest.fn(),
      isLoading: false,
      loadIssues: jest.fn(),
    } as ReturnType<typeof useIssues>)
    mockUseViews.mockReturnValue({
      isLoading: false,
      selectedView: mockView1,
      setSelectedView: setSelectedViewMock,
    })

    render(<AuthenticatedIssueDisplay />)

    const button = screen.getByText('Select View 2')
    fireEvent.click(button)

    expect(setSelectedViewMock).toHaveBeenCalledWith(mockView2)
  })

  it('should navigate to the next issue correctly', () => {
    const setCurrentIssueMock = jest.fn()
    mockUseCurrentUser.mockReturnValue({ user: mockUser })
    mockUseIssues.mockReturnValue({
      currentIssue: mockIssues[0],
      setCurrentIssue: setCurrentIssueMock,
      issues: mockIssues,
      setIssues: jest.fn(),
      isLoading: false,
      loadIssues: jest.fn(),
    } as ReturnType<typeof useIssues>)
    mockUseViews.mockReturnValue({
      isLoading: false,
      selectedView: mockView1,
      setSelectedView: jest.fn(),
    })

    render(<AuthenticatedIssueDisplay />)

    // Simulate clicking the "Next" button inside IssueContent
    const navigateNextButton = screen.getByText('Next')
    fireEvent.click(navigateNextButton)

    expect(setCurrentIssueMock).toHaveBeenCalledWith(mockIssues[1])
  })

  it('should navigate to the previous issue correctly', () => {
    const setCurrentIssueMock = jest.fn()
    mockUseCurrentUser.mockReturnValue({ user: mockUser })
    mockUseIssues.mockReturnValue({
      currentIssue: mockIssues[0],
      setCurrentIssue: setCurrentIssueMock,
      issues: mockIssues,
      setIssues: jest.fn(),
      isLoading: false,
      loadIssues: jest.fn(),
    } as ReturnType<typeof useIssues>)
    mockUseViews.mockReturnValue({
      isLoading: false,
      selectedView: mockView1,
      setSelectedView: jest.fn(),
    })

    render(<AuthenticatedIssueDisplay />)

    // Simulate clicking the "Previous" button inside IssueContent
    const navigatePreviousButton = screen.getByText('Previous')
    fireEvent.click(navigatePreviousButton)

    expect(setCurrentIssueMock).toHaveBeenCalledWith(mockIssues[1]) // Since (0 -1 + 2) % 2 = 1
  })

  it('should render Separator component', () => {
    mockUseCurrentUser.mockReturnValue({ user: mockUser })
    mockUseIssues.mockReturnValue({
      currentIssue: mockIssues[0],
      setCurrentIssue: jest.fn(),
      issues: mockIssues,
      setIssues: jest.fn(),
      isLoading: false,
      loadIssues: jest.fn(),
    } as ReturnType<typeof useIssues>)
    mockUseViews.mockReturnValue({
      isLoading: false,
      selectedView: mockView1,
      setSelectedView: jest.fn(),
    })

    render(<AuthenticatedIssueDisplay />)

    expect(screen.getByTestId('separator')).toBeInTheDocument()
  })
})
