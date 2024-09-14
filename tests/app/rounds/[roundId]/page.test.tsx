import { render, screen } from '@testing-library/react'
import React from 'react'

import RoundPage from '@aces/app/rounds/[roundId]/page'
import User from '@aces/interfaces/user'
import useVote from '@aces/lib/api/set-vote'
import { useCsrfToken } from '@aces/lib/hooks/auth/use-csrf-token'
import useCurrentUser from '@aces/lib/hooks/auth/use-current-user'
import useMigrateCookie from '@aces/lib/hooks/auth/use-migrate-cookie'
import useRegisterViewer from '@aces/lib/hooks/auth/use-register-viewer'



jest.mock('@aces/app/rounds/[roundId]/round-component', () => ({
  RoundComponent: ({ roundId }: { roundId: string }) => (
    <div data-testid="round-component">
RoundComponent:
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
jest.mock('@aces/lib/hooks/auth/use-csrf-token')
jest.mock('@aces/lib/hooks/auth/use-migrate-cookie')

describe('RoundPage', () => {
  const mockUseUser = useCurrentUser as jest.MockedFunction<typeof useCurrentUser>
  const mockUseRegisterViewer = useRegisterViewer as jest.MockedFunction<typeof useRegisterViewer>
  const mockUseVote = useVote as jest.MockedFunction<typeof useVote>
  const mockUseCsrfToken = useCsrfToken as jest.MockedFunction<typeof useCsrfToken>
  const mockUseMigrateCookie = useMigrateCookie as jest.MockedFunction<typeof useMigrateCookie>

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseUser.mockReturnValue({ user: undefined, isLoading: false, error: null })
    mockUseRegisterViewer.mockReturnValue({
      isLoading: false,
      error: null,
      data: undefined,
      isRegistered: false
    })
    mockUseVote.mockReturnValue({ trigger: jest.fn() } as unknown as ReturnType<typeof useVote>)
  })

  it('should call useMigrateCookie with csrfToken', () => {
    mockUseCsrfToken.mockReturnValue({ csrfToken: 'test-csrf-token', isLoading: false, isError: false })

    const roundComponent = screen.getByTestId('round-component')
    expect(roundComponent).toBeInTheDocument()
    expect('test-csrf-token').toBeInTheDocument()
    expect(mockUseMigrateCookie).toHaveBeenCalledWith('test-csrf-token')
  })

  it('should pass correct arguments to RoundPage', () => {
    const mockUser = { id: 'test-user', linearId: 'test-linear-id', name: 'test-name' } as unknown as User
    mockUseUser.mockReturnValue({ user: mockUser, isLoading: false, error: null })

    render(<RoundPage params={{ roundId: 'test-round' }} />)

    expect(mockUseRegisterViewer).toHaveBeenCalledWith({ roundId: 'test-round' }, mockUser)
  })

  it('should pass trigger function to WebSocketProvider', () => {
    const mockTrigger = jest.fn()
    mockUseVote.mockReturnValue({ trigger: mockTrigger } as unknown as ReturnType<typeof useVote>)

    render(<RoundPage params={{ roundId: 'test-round' }} />)

    const webSocketProvider = screen.getByTestId('web-socket-provider')
    expect(webSocketProvider).toBeInTheDocument()
  })
})
