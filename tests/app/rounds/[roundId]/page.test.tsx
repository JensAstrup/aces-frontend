import { render, screen } from '@testing-library/react'
import React from 'react'

import RoundPage from '@aces/app/rounds/[roundId]/page'
import User from '@aces/interfaces/user'
import useRegisterViewer from '@aces/lib/hooks/use-register-viewer'
import { useUser } from '@aces/lib/hooks/user-context'


jest.mock('@aces/app/rounds/[roundId]/IssueDisplay', () => ({
  __esModule: true,
  default: ({ user, roundId }: { user: User | null, roundId: string }) => (
    <div data-testid="issue-display">
      IssueDisplay:
      {' '}
      {user ? user.id : 'No user'}
      {' '}
-
      {' '}
      {roundId}
    </div>
  )
}))

jest.mock('@aces/components/rounds/sidebar', () => ({
  RoundSidebar: ({ roundId }: { roundId: string }) => (
    <div data-testid="round-sidebar">
      RoundSidebar:
      {' '}
      {roundId}
    </div>
  )
}))

jest.mock('@aces/lib/hooks/issues/issues-context', () => ({
  IssuesProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="issues-provider">{children}</div>
  )
}))

jest.mock('@aces/lib/hooks/user-context')
jest.mock('@aces/lib/hooks/use-register-viewer')

describe('RoundPage', () => {
  const mockUseUser = useUser as jest.MockedFunction<typeof useUser>
  const mockUseRegisterViewer = useRegisterViewer as jest.MockedFunction<typeof useRegisterViewer>

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseUser.mockReturnValue({ user: null, isLoading: false, error: null })
    mockUseRegisterViewer.mockReturnValue({
      isLoading: false,
      error: null,
      data: undefined,
      isRegistered: false
    })
  })

  it('renders correctly with no user', () => {
    render(<RoundPage params={{ roundId: 'test-round' }} />)

    expect(screen.getByTestId('issues-provider')).toBeInTheDocument()
    expect(screen.getByTestId('issue-display')).toHaveTextContent('IssueDisplay: No user - test-round')
    expect(screen.getByTestId('round-sidebar')).toHaveTextContent('RoundSidebar: test-round')
  })

  it('renders correctly with a user', () => {
    mockUseUser.mockReturnValue({ user: { id: 'test-user', accessToken: '' }, isLoading: false, error: null })

    render(<RoundPage params={{ roundId: 'test-round' }} />)

    expect(screen.getByTestId('issue-display')).toHaveTextContent('IssueDisplay: test-user - test-round')
  })

  it('calls useRegisterViewer with correct arguments when user is loaded', () => {
    const mockUser = { id: 'test-user', accessToken: 'test-token' }
    mockUseUser.mockReturnValue({ user: mockUser, isLoading: false, error: null })

    render(<RoundPage params={{ roundId: 'test-round' }} />)

    expect(mockUseRegisterViewer).toHaveBeenCalledWith({ roundId: 'test-round' }, mockUser)
  })

  it('calls useRegisterViewer with undefined user when user is loading', () => {
    mockUseUser.mockReturnValue({ user: null, isLoading: true, error: null })

    render(<RoundPage params={{ roundId: 'test-round' }} />)

    expect(mockUseRegisterViewer).toHaveBeenCalledWith({ roundId: 'test-round' }, undefined)
  })

  it('renders correctly when user is loading', () => {
    mockUseUser.mockReturnValue({ user: null, isLoading: true, error: null })

    render(<RoundPage params={{ roundId: 'test-round' }} />)

    expect(screen.getByTestId('issue-display')).toHaveTextContent('IssueDisplay: No user - test-round')
  })
})
