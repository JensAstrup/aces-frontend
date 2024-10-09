import { render, screen } from '@testing-library/react'
import React from 'react'

import RoundComponent from '@aces/app/rounds/[roundId]/round-component'
import { View } from '@aces/interfaces/view'


jest.mock('@aces/app/issues/anonymous-issue-display', () => ({
  __esModule: true,
  default: () => <div data-testid="unauthenticated-issue-display" />,
}))

jest.mock('@aces/app/issues/authenticated-issue-display', () => ({
  __esModule: true,
  default: () => <div data-testid="authenticated-issue-display" />,
}))

jest.mock('@aces/components/rounds/sidebar', () => ({
  RoundSidebar: () => <div data-testid="round-sidebar" />,
}))

jest.mock('@aces/components/disconnected/disconnected', () => ({
  __esModule: true,
  default: () => <div data-testid="disconnected" />,
}))

jest.mock('@aces/lib/socket/web-socket-connection', () => ({
  __esModule: true,
  default: () => <div data-testid="web-socket-connection" />,
}))

jest.mock('@aces/lib/hooks/auth/use-current-user')
jest.mock('@aces/lib/hooks/auth/use-register-viewer')
jest.mock('@aces/lib/socket/web-socket-provider')
jest.mock('@aces/lib/hooks/auth/use-csrf-token')
jest.mock('@aces/lib/hooks/auth/use-migrate-cookie')

const mockUseCurrentUser = jest.requireMock('@aces/lib/hooks/auth/use-current-user').default
const mockUseRegisterViewer = jest.requireMock('@aces/lib/hooks/auth/use-register-viewer').default
const mockUseWebSocket = jest.requireMock('@aces/lib/socket/web-socket-provider').useWebSocket
const mockUseCsrfToken = jest.requireMock('@aces/lib/hooks/auth/use-csrf-token').useCsrfToken
const mockUseMigrateCookie = jest.requireMock('@aces/lib/hooks/auth/use-migrate-cookie').default

describe('RoundComponent', () => {
  const mockRoundId = 'test-round-id'
  const mockViews: View[] = [
    { id: 'view1', name: 'View 1' },
    { id: 'view2', name: 'View 2' },
  ] as View[]

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseCurrentUser.mockReturnValue({ user: null, isLoading: false })
    mockUseRegisterViewer.mockReturnValue({})
    mockUseWebSocket.mockReturnValue({ isConnected: true })
    mockUseCsrfToken.mockReturnValue({ csrfToken: 'mock-csrf-token', isLoading: false, isError: false })
    mockUseMigrateCookie.mockReturnValue(undefined)
  })

  it('should render Disconnected component when not connected', () => {
    mockUseWebSocket.mockReturnValue({ isConnected: false })

    render(<RoundComponent roundId={mockRoundId} views={mockViews} />)

    expect(screen.getByTestId('disconnected')).toBeInTheDocument()
    expect(screen.queryByTestId('unauthenticated-issue-display')).not.toBeInTheDocument()
    expect(screen.queryByTestId('authenticated-issue-display')).not.toBeInTheDocument()
    expect(screen.queryByTestId('round-sidebar')).not.toBeInTheDocument()
    expect(screen.queryByTestId('web-socket-connection')).not.toBeInTheDocument()
  })

  it('should render UnauthenticatedIssueDisplay when user is not authenticated and connected', () => {
    mockUseCurrentUser.mockReturnValue({ user: null, isLoading: false })

    render(<RoundComponent roundId={mockRoundId} views={mockViews} />)

    expect(screen.getByTestId('unauthenticated-issue-display')).toBeInTheDocument()
    expect(screen.queryByTestId('authenticated-issue-display')).not.toBeInTheDocument()
    expect(screen.getByTestId('round-sidebar')).toBeInTheDocument()
    expect(screen.queryByTestId('disconnected')).not.toBeInTheDocument()
    expect(screen.getByTestId('web-socket-connection')).toBeInTheDocument()
  })

  it('should render AuthenticatedIssueDisplay when user is authenticated with linearId and connected', () => {
    mockUseCurrentUser.mockReturnValue({ user: { linearId: 'test-linear-id' }, isLoading: false })

    render(<RoundComponent roundId={mockRoundId} views={mockViews} />)

    expect(screen.getByTestId('authenticated-issue-display')).toBeInTheDocument()
    expect(screen.queryByTestId('unauthenticated-issue-display')).not.toBeInTheDocument()
    expect(screen.getByTestId('round-sidebar')).toBeInTheDocument()
    expect(screen.queryByTestId('disconnected')).not.toBeInTheDocument()
    expect(screen.getByTestId('web-socket-connection')).toBeInTheDocument()
  })

  it('should render UnauthenticatedIssueDisplay when user is authenticated without linearId and connected', () => {
    mockUseCurrentUser.mockReturnValue({ user: { id: 'test-id' }, isLoading: false })

    render(<RoundComponent roundId={mockRoundId} views={mockViews} />)

    expect(screen.getByTestId('unauthenticated-issue-display')).toBeInTheDocument()
    expect(screen.queryByTestId('authenticated-issue-display')).not.toBeInTheDocument()
    expect(screen.getByTestId('round-sidebar')).toBeInTheDocument()
    expect(screen.queryByTestId('disconnected')).not.toBeInTheDocument()
    expect(screen.getByTestId('web-socket-connection')).toBeInTheDocument()
  })

  it('should call useRegisterViewer with correct arguments when user is not loading', () => {
    const mockUser = { id: 'test-id' }
    mockUseCurrentUser.mockReturnValue({ user: mockUser, isLoading: false })

    render(<RoundComponent roundId={mockRoundId} views={mockViews} />)

    expect(mockUseRegisterViewer).toHaveBeenCalledWith({ roundId: mockRoundId }, mockUser)
  })

  it('should call useRegisterViewer with undefined user when isUserLoading is true', () => {
    mockUseCurrentUser.mockReturnValue({ user: null, isLoading: true })

    render(<RoundComponent roundId={mockRoundId} views={mockViews} />)

    expect(mockUseRegisterViewer).toHaveBeenCalledWith({ roundId: mockRoundId }, undefined)
  })

  it('should call useMigrateCookie with csrfToken', () => {
    const mockCsrfToken = 'mock-csrf-token'
    mockUseCsrfToken.mockReturnValue({ csrfToken: mockCsrfToken, isLoading: false, isError: false })

    render(<RoundComponent roundId={mockRoundId} views={mockViews} />)

    expect(mockUseMigrateCookie).toHaveBeenCalledWith(mockCsrfToken)
    expect(mockUseMigrateCookie).toHaveBeenCalledTimes(1)
  })

  it('should handle connection state updates correctly', () => {
    const { rerender } = render(<RoundComponent roundId={mockRoundId} views={mockViews} />)

    expect(screen.getByTestId('unauthenticated-issue-display')).toBeInTheDocument()
    expect(screen.queryByTestId('disconnected')).not.toBeInTheDocument()
    expect(screen.getByTestId('web-socket-connection')).toBeInTheDocument()

    mockUseWebSocket.mockReturnValue({ isConnected: false })

    rerender(<RoundComponent roundId={mockRoundId} views={mockViews} />)

    expect(screen.getByTestId('disconnected')).toBeInTheDocument()
    expect(screen.queryByTestId('unauthenticated-issue-display')).not.toBeInTheDocument()
    expect(screen.queryByTestId('authenticated-issue-display')).not.toBeInTheDocument()
    expect(screen.queryByTestId('round-sidebar')).not.toBeInTheDocument()
    expect(screen.queryByTestId('web-socket-connection')).not.toBeInTheDocument()
  })
})
