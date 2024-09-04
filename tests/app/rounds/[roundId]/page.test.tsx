import { render, screen } from '@testing-library/react'
import React from 'react'

import RoundPage from '@aces/app/rounds/[roundId]/page'
import User from '@aces/interfaces/user'
import useVote from '@aces/lib/api/set-vote'
import useRegisterViewer from '@aces/lib/hooks/auth/use-register-viewer'
import { useUser } from '@aces/lib/hooks/auth/user-context'


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

jest.mock('@aces/app/web-socket-provider', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="web-socket-provider">{children}</div>
  )
}))

jest.mock('@aces/lib/hooks/issues/issues-context', () => ({
  useIssues: jest.fn().mockImplementation(() => ({
    setCurrentIssue: jest.fn(),
  })),
  IssuesProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="issues-provider">{children}</div>
  )
}))

jest.mock('@aces/lib/api/set-vote')
jest.mock('@aces/lib/hooks/auth/user-context')
jest.mock('@aces/lib/hooks/auth/use-register-viewer')
jest.mock('@aces/lib/api/set-vote')

describe('RoundPage', () => {
  const mockUseUser = useUser as jest.MockedFunction<typeof useUser>
  const mockUseRegisterViewer = useRegisterViewer as jest.MockedFunction<typeof useRegisterViewer>
  const mockUseVote = useVote as jest.MockedFunction<typeof useVote>

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseUser.mockReturnValue({ user: null, isLoading: false, error: null })
    mockUseRegisterViewer.mockReturnValue({
      isLoading: false,
      error: null,
      data: undefined,
      isRegistered: false
    })
    mockUseVote.mockReturnValue({ trigger: jest.fn() } as unknown as ReturnType<typeof useVote>)
  })

  it('should render correctly with no user', () => {
    render(<RoundPage params={{ roundId: 'test-round' }} />)

    expect(screen.getByTestId('issues-provider')).toBeInTheDocument()
    expect(screen.getByTestId('web-socket-provider')).toBeInTheDocument()
  })

  it('should call useRegisterViewer with correct arguments when user is loaded', () => {
    const mockUser = { id: 'test-user', accessToken: 'test-token' }
    mockUseUser.mockReturnValue({ user: mockUser, isLoading: false, error: null })

    render(<RoundPage params={{ roundId: 'test-round' }} />)

    expect(mockUseRegisterViewer).toHaveBeenCalledWith({ roundId: 'test-round' }, mockUser)
  })

  it('should call useRegisterViewer with undefined user when user is loading', () => {
    mockUseUser.mockReturnValue({ user: null, isLoading: true, error: null })

    render(<RoundPage params={{ roundId: 'test-round' }} />)

    expect(mockUseRegisterViewer).toHaveBeenCalledWith({ roundId: 'test-round' }, undefined)
  })

  it('should pass trigger function to WebSocketProvider', () => {
    const mockTrigger = jest.fn()
    mockUseVote.mockReturnValue({ trigger: mockTrigger } as unknown as ReturnType<typeof useVote>)

    render(<RoundPage params={{ roundId: 'test-round' }} />)

    const webSocketProvider = screen.getByTestId('web-socket-provider')
    expect(webSocketProvider).toBeInTheDocument()
  })
})
