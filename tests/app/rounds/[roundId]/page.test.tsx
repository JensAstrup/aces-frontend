import { render, screen } from '@testing-library/react'
import React from 'react'

import RoundPage from '@aces/app/rounds/[roundId]/page'
import { useCsrfToken } from '@aces/lib/hooks/auth/use-csrf-token'
import useMigrateCookie from '@aces/lib/hooks/auth/use-migrate-cookie'


jest.mock('@aces/app/rounds/[roundId]/round-component', () => ({
  __esModule: true,
  default: jest.fn(({ params }: { params: { roundId: string } }) => (
    <div data-testid="round-component">
      RoundComponent:
      {' '}
      {params.roundId}
    </div>
  ))
}))

jest.mock('@aces/lib/socket/web-socket-context', () => ({
  WebSocketProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="web-socket-provider">{children}</div>
  ),
  useWebSocket: jest.fn()
}))

jest.mock('@aces/lib/hooks/issues/issues-context', () => ({
  useIssues: jest.fn(() => ({
    setCurrentIssue: jest.fn(),
  })),
  IssuesProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="issues-provider">{children}</div>
  )
}))

jest.mock('@aces/lib/hooks/auth/use-csrf-token')
jest.mock('@aces/lib/hooks/auth/use-migrate-cookie')

describe('RoundPage', () => {
  const mockUseCsrfToken = useCsrfToken as jest.MockedFunction<typeof useCsrfToken>
  const mockUseMigrateCookie = useMigrateCookie as jest.MockedFunction<typeof useMigrateCookie>

  beforeEach(() => {
    jest.clearAllMocks()
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
