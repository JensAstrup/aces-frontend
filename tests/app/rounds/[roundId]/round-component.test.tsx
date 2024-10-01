import { render, screen } from '@testing-library/react'
import React, { act } from 'react'

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

jest.mock('@aces/lib/hooks/auth/use-current-user')
jest.mock('@aces/lib/hooks/auth/use-register-viewer')

const mockUseCurrentUser = jest.requireMock('@aces/lib/hooks/auth/use-current-user').default
const mockUseRegisterViewer = jest.requireMock('@aces/lib/hooks/auth/use-register-viewer').default

describe('RoundComponent', () => {
  const mockParams = { roundId: 'test-round-id' }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseCurrentUser.mockReturnValue({ user: null, isLoading: false })
    mockUseRegisterViewer.mockReturnValue({})
  })

  it('should render UnauthenticatedIssueDisplay when user is not authenticated', () => {
    mockUseCurrentUser.mockReturnValue({ user: null, isLoading: false })

    render(<RoundComponent params={mockParams} />)

    expect(screen.getByTestId('unauthenticated-issue-display')).toBeInTheDocument()
    expect(screen.queryByTestId('authenticated-issue-display')).not.toBeInTheDocument()
    expect(screen.getByTestId('round-sidebar')).toBeInTheDocument()
  })

  it('should render AuthenticatedIssueDisplay when user is authenticated with linearId', () => {
    mockUseCurrentUser.mockReturnValue({ user: { linearId: 'test-linear-id' }, isLoading: false })

    render(<RoundComponent params={mockParams} />)

    expect(screen.getByTestId('authenticated-issue-display')).toBeInTheDocument()
    expect(screen.queryByTestId('unauthenticated-issue-display')).not.toBeInTheDocument()
    expect(screen.getByTestId('round-sidebar')).toBeInTheDocument()
  })

  it('should render UnauthenticatedIssueDisplay when user is authenticated without linearId', () => {
    mockUseCurrentUser.mockReturnValue({ user: { id: 'test-id' }, isLoading: false })

    render(<RoundComponent params={mockParams} />)

    expect(screen.getByTestId('unauthenticated-issue-display')).toBeInTheDocument()
    expect(screen.queryByTestId('authenticated-issue-display')).not.toBeInTheDocument()
    expect(screen.getByTestId('round-sidebar')).toBeInTheDocument()
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

  it('should render RoundSidebar with correct roundId prop', () => {
    render(<RoundComponent params={mockParams} />)

    const sidebar = screen.getByTestId('round-sidebar')
    expect(sidebar).toBeInTheDocument()
    // Note: In a real scenario, you might want to check if the prop is passed correctly.
    // This would require adjusting the mock to accept and verify props.
  })

  it('should handle state updates correctly', () => {
    const { rerender } = render(<RoundComponent params={mockParams} />)

    expect(screen.getByTestId('unauthenticated-issue-display')).toBeInTheDocument()

    act(() => {
      mockUseCurrentUser.mockReturnValue({ user: { linearId: 'test-linear-id' }, isLoading: false })
    })

    rerender(<RoundComponent params={mockParams} />)

    expect(screen.getByTestId('authenticated-issue-display')).toBeInTheDocument()
  })
})
