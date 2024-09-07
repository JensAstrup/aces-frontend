import { render, screen } from '@testing-library/react'
import React from 'react'

import RoundComponent from '@aces/app/rounds/[roundId]/round-component'

import '@testing-library/jest-dom'

// Mock the imported components and hooks
jest.mock('@aces/app/issues/anonymous-issue-display', () => ({
  __esModule: true,
  default: () => <div data-testid="unauthenticated-issue-display" />
}))

jest.mock('@aces/app/issues/authenticated-issue-display', () => ({
  __esModule: true,
  default: ({ roundId }: { roundId: string }) => <div data-testid="authenticated-issue-display" data-roundid={roundId} />
}))

jest.mock('@aces/components/rounds/sidebar', () => ({
  RoundSidebar: ({ roundId }: { roundId: string }) => <div data-testid="round-sidebar" data-roundid={roundId} />
}))

jest.mock('@aces/lib/hooks/auth/use-current-user')
jest.mock('@aces/lib/hooks/auth/use-register-viewer')

const mockUseCurrentUser = jest.requireMock('@aces/lib/hooks/auth/use-current-user').default
const mockUseRegisterViewer = jest.requireMock('@aces/lib/hooks/auth/use-register-viewer').default

describe('RoundComponent', () => {
  const mockRoundId = 'test-round-id'

  beforeEach(() => {
    mockUseCurrentUser.mockReturnValue({ user: null, isLoading: false })
    mockUseRegisterViewer.mockReturnValue({})
  })

  it('should render UnauthenticatedIssueDisplay when user is not authenticated', () => {
    render(<RoundComponent params={{ roundId: mockRoundId }} />)

    expect(screen.getByTestId('unauthenticated-issue-display')).toBeInTheDocument()
    expect(screen.queryByTestId('authenticated-issue-display')).not.toBeInTheDocument()
    expect(screen.getByTestId('round-sidebar')).toBeInTheDocument()
  })

  it('should render AuthenticatedIssueDisplay when user is authenticated', () => {
    mockUseCurrentUser.mockReturnValue({ user: { linearId: 'test-linear-id' }, isLoading: false })

    render(<RoundComponent params={{ roundId: mockRoundId }} />)

    expect(screen.getByTestId('authenticated-issue-display')).toBeInTheDocument()
    expect(screen.queryByTestId('unauthenticated-issue-display')).not.toBeInTheDocument()
    expect(screen.getByTestId('round-sidebar')).toBeInTheDocument()
  })

  it('should pass roundId to AuthenticatedIssueDisplay', () => {
    mockUseCurrentUser.mockReturnValue({ user: { linearId: 'test-linear-id' }, isLoading: false })

    render(<RoundComponent params={{ roundId: mockRoundId }} />)

    expect(screen.getByTestId('authenticated-issue-display')).toHaveAttribute('data-roundid', mockRoundId)
  })

  it('should pass roundId to RoundSidebar', () => {
    render(<RoundComponent params={{ roundId: mockRoundId }} />)

    expect(screen.getByTestId('round-sidebar')).toHaveAttribute('data-roundid', mockRoundId)
  })

  it('should call useRegisterViewer with correct arguments when user is not loading', () => {
    const mockUser = { linearId: 'test-linear-id' }
    mockUseCurrentUser.mockReturnValue({ user: mockUser, isLoading: false })

    render(<RoundComponent params={{ roundId: mockRoundId }} />)

    expect(mockUseRegisterViewer).toHaveBeenCalledWith({ roundId: mockRoundId }, mockUser)
  })

  it('should call useRegisterViewer with undefined user when user is loading', () => {
    mockUseCurrentUser.mockReturnValue({ user: null, isLoading: true })

    render(<RoundComponent params={{ roundId: mockRoundId }} />)

    expect(mockUseRegisterViewer).toHaveBeenCalledWith({ roundId: mockRoundId }, undefined)
  })
})
