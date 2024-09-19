import { render, screen } from '@testing-library/react'
import React from 'react'

import RoundPage from '@aces/app/rounds/[roundId]/page'
import useVote from '@aces/lib/api/set-vote'
import { useCsrfToken } from '@aces/lib/hooks/auth/use-csrf-token'
import useMigrateCookie from '@aces/lib/hooks/auth/use-migrate-cookie'



jest.mock('@aces/app/rounds/[roundId]/round-component', () => ({
  __esModule: true,
  default: jest.fn(({ params }) => (
    <div data-testid="round-component">
      RoundComponent:
      {' '}
      {params.roundId}
    </div>
  ))
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
  const mockUseVote = useVote as jest.MockedFunction<typeof useVote>
  const mockUseCsrfToken = useCsrfToken as jest.MockedFunction<typeof useCsrfToken>
  const mockUseMigrateCookie = useMigrateCookie as jest.MockedFunction<typeof useMigrateCookie>

  beforeEach(() => {
    jest.clearAllMocks()
    // @ts-expect-error Just need to mock the function
    mockUseVote.mockReturnValue({ trigger: jest.fn() })
    mockUseCsrfToken.mockReturnValue({ csrfToken: 'test-csrf-token', isLoading: false, isError: false })
  })

  it('should call useMigrateCookie with csrfToken', () => {
    render(<RoundPage params={{ roundId: 'test-round' }} />)
    expect(mockUseMigrateCookie).toHaveBeenCalledWith('test-csrf-token')
  })

  it('should render RoundComponent with correct props', () => {
    render(<RoundPage params={{ roundId: 'test-round' }} />)
    const roundComponent = screen.getByTestId('round-component')
    expect(roundComponent).toBeInTheDocument()
    expect(roundComponent).toHaveTextContent('RoundComponent: test-round')
  })

  it('should render WebSocketProvider', () => {
    render(<RoundPage params={{ roundId: 'test-round' }} />)

    const webSocketProvider = screen.getByTestId('web-socket-provider')
    expect(webSocketProvider).toBeInTheDocument()
  })
})
