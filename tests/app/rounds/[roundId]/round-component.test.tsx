import { render, screen } from '@testing-library/react'
import React from 'react'

import RoundComponent from '@aces/app/rounds/[roundId]/round-component'


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

jest.mock('@aces/lib/hooks/auth/use-current-user')
jest.mock('@aces/lib/hooks/auth/use-register-viewer')
jest.mock('@aces/lib/socket/web-socket-context')

const mockUseCurrentUser = jest.requireMock('@aces/lib/hooks/auth/use-current-user').default
const mockUseRegisterViewer = jest.requireMock('@aces/lib/hooks/auth/use-register-viewer').default
const mockUseWebSocket = jest.requireMock('@aces/lib/socket/web-socket-context').useWebSocket

describe('RoundComponent', () => {
  const mockParams = { roundId: 'test-round-id' }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseCurrentUser.mockReturnValue({ user: null, isLoading: false })
    mockUseRegisterViewer.mockReturnValue({})
    mockUseWebSocket.mockReturnValue({ isConnected: true })
  })

  it('should render Disconnected component when not connected', () => {
    mockUseWebSocket.mockReturnValue({ isConnected: false })

    render(<RoundComponent params={mockParams} />)

    expect(screen.getByTestId('disconnected')).toBeInTheDocument()
    expect(screen.queryByTestId('unauthenticated-issue-display')).not.toBeInTheDocument()
    expect(screen.queryByTestId('authenticated-issue-display')).not.toBeInTheDocument()
    expect(screen.queryByTestId('round-sidebar')).not.toBeInTheDocument()
  })

  it('should render UnauthenticatedIssueDisplay when user is not authenticated and connected', () => {
    mockUseCurrentUser.mockReturnValue({ user: null, isLoading: false })

    render(<RoundComponent params={mockParams} />)

    expect(screen.getByTestId('unauthenticated-issue-display')).toBeInTheDocument()
    expect(screen.queryByTestId('authenticated-issue-display')).not.toBeInTheDocument()
    expect(screen.getByTestId('round-sidebar')).toBeInTheDocument()
    expect(screen.queryByTestId('disconnected')).not.toBeInTheDocument()
  })

  it('should render AuthenticatedIssueDisplay when user is authenticated with linearId and connected', () => {
    mockUseCurrentUser.mockReturnValue({ user: { linearId: 'test-linear-id' }, isLoading: false })

    render(<RoundComponent params={mockParams} />)

    expect(screen.getByTestId('authenticated-issue-display')).toBeInTheDocument()
    expect(screen.queryByTestId('unauthenticated-issue-display')).not.toBeInTheDocument()
    expect(screen.getByTestId('round-sidebar')).toBeInTheDocument()
    expect(screen.queryByTestId('disconnected')).not.toBeInTheDocument()
  })

  it('should render UnauthenticatedIssueDisplay when user is authenticated without linearId and connected', () => {
    mockUseCurrentUser.mockReturnValue({ user: { id: 'test-id' }, isLoading: false })

    render(<RoundComponent params={mockParams} />)

    expect(screen.getByTestId('unauthenticated-issue-display')).toBeInTheDocument()
    expect(screen.queryByTestId('authenticated-issue-display')).not.toBeInTheDocument()
    expect(screen.getByTestId('round-sidebar')).toBeInTheDocument()
    expect(screen.queryByTestId('disconnected')).not.toBeInTheDocument()
  })

  it('should call useRegisterViewer with correct arguments when user is not loading', () => {
    const mockUser = { id: 'test-id' }
    mockUseCurrentUser.mockReturnValue({ user: mockUser, isLoading: false })

    render(<RoundComponent params={mockParams} />)

    expect(mockUseRegisterViewer).toHaveBeenCalledWith({ roundId: mockParams.roundId }, mockUser)
  })

  it('should call useRegisterViewer with undefined user when isUserLoading is true', () => {
    mockUseCurrentUser.mockReturnValue({ user: null, isLoading: true })

    render(<RoundComponent params={mockParams} />)

    expect(mockUseRegisterViewer).toHaveBeenCalledWith({ roundId: mockParams.roundId }, undefined)
  })

  it('should render RoundSidebar with correct roundId prop when connected', () => {
    render(<RoundComponent params={mockParams} />)

    const sidebar = screen.getByTestId('round-sidebar')
    expect(sidebar).toBeInTheDocument()
  })

  it('should handle connection state updates correctly', () => {
    const { rerender } = render(<RoundComponent params={mockParams} />)

    expect(screen.getByTestId('unauthenticated-issue-display')).toBeInTheDocument()
    expect(screen.queryByTestId('disconnected')).not.toBeInTheDocument()

    mockUseWebSocket.mockReturnValue({ isConnected: false })

    rerender(<RoundComponent params={mockParams} />)

    expect(screen.getByTestId('disconnected')).toBeInTheDocument()
    expect(screen.queryByTestId('unauthenticated-issue-display')).not.toBeInTheDocument()
  })
})
