import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'

import RoundComponent from '@aces/app/rounds/[roundId]/round-component'
import useRegisterViewer from '@aces/lib/hooks/auth/use-register-viewer'
import { useUser } from '@aces/lib/hooks/auth/user-context'


jest.mock('@aces/lib/hooks/auth/user-context')
jest.mock('@aces/lib/hooks/auth/use-register-viewer')
jest.mock('@aces/app/issues/anonymous-issue-display', () => () => <div data-testid="unauthenticated-issue-display" />)
jest.mock('@aces/app/issues/authenticated-issue-display', () => ({ roundId }: { roundId: string }) => <div data-testid="authenticated-issue-display">{roundId}</div>)
jest.mock('@aces/components/rounds/sidebar', () => ({
  RoundSidebar: ({ roundId }: { roundId: string }) => <div data-testid="round-sidebar">{roundId}</div>
}))

const mockUseUser = useUser as jest.MockedFunction<typeof useUser>
const mockUseRegisterViewer = useRegisterViewer as jest.MockedFunction<typeof useRegisterViewer>

describe('RoundComponent', () => {
  const mockRoundId = 'test-round-id'
  const mockParams = { roundId: mockRoundId }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRegisterViewer.mockReturnValue({ data: null, isRegistered: false, isLoading: false, error: null })
  })

  it('should render UnauthenticatedIssueDisplay when user is not authenticated', () => {
    mockUseUser.mockReturnValue({
      user: null,
      isLoading: false,
      error: null
    })

    render(<RoundComponent params={mockParams} />)

    expect(screen.getByTestId('unauthenticated-issue-display')).toBeInTheDocument()
    expect(screen.queryByTestId('authenticated-issue-display')).not.toBeInTheDocument()
  })

  it('should render AuthenticatedIssueDisplay when user is authenticated', () => {
    mockUseUser.mockReturnValue({ user: { id: 'user-1' }, isLoading: false, error: null })

    render(<RoundComponent params={mockParams} />)

    expect(screen.getByTestId('authenticated-issue-display')).toBeInTheDocument()
    expect(screen.queryByTestId('unauthenticated-issue-display')).not.toBeInTheDocument()
    expect(screen.getByTestId('authenticated-issue-display')).toHaveTextContent(mockRoundId)
  })

  it('should render RoundSidebar with correct roundId', () => {
    mockUseUser.mockReturnValue({ user: null, isLoading: false, error: null })

    render(<RoundComponent params={mockParams} />)

    expect(screen.getByTestId('round-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('round-sidebar')).toHaveTextContent(mockRoundId)
  })

  it('should call useRegisterViewer with correct parameters when user is not loading', () => {
    const mockUser = { id: 'user-1' }
    mockUseUser.mockReturnValue({ user: mockUser, isLoading: false, error: null })

    render(<RoundComponent params={mockParams} />)

    expect(mockUseRegisterViewer).toHaveBeenCalledWith({ roundId: mockRoundId }, mockUser)
  })

  it('should call useRegisterViewer with undefined user when user is loading', () => {
    mockUseUser.mockReturnValue({ user: null, isLoading: true, error: null })

    render(<RoundComponent params={mockParams} />)

    expect(mockUseRegisterViewer).toHaveBeenCalledWith({ roundId: mockRoundId }, undefined)
  })
})
