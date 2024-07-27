import { render, screen } from '@testing-library/react'
import React from 'react'

import IssueDisplay from '@aces/app/rounds/[roundId]/IssueDisplay'
import '@testing-library/jest-dom'

// Mock the imported components
jest.mock('@aces/app/issues/anonymous-issue-display', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="unauthenticated-issue-display">Unauthenticated Issue Display</div>),
}))

jest.mock('@aces/app/issues/authenticated-issue-display', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="authenticated-issue-display">Authenticated Issue Display</div>),
}))

describe('IssueDisplay', () => {
  const mockRoundId = 'test-round-id'

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders UnauthenticatedIssueDisplay when user is null', () => {
    render(<IssueDisplay user={null} roundId={mockRoundId} />)

    expect(screen.getByTestId('unauthenticated-issue-display')).toBeInTheDocument()
    expect(screen.queryByTestId('authenticated-issue-display')).not.toBeInTheDocument()
  })

  it('renders AuthenticatedIssueDisplay when user is present', () => {
    const mockUser = { id: 'test-user-id', name: 'Test User', accessToken: 'test-access-token' }
    render(<IssueDisplay user={mockUser} roundId={mockRoundId} />)

    expect(screen.getByTestId('authenticated-issue-display')).toBeInTheDocument()
    expect(screen.queryByTestId('unauthenticated-issue-display')).not.toBeInTheDocument()
  })

  it('passes roundId to UnauthenticatedIssueDisplay', () => {
    render(<IssueDisplay user={null} roundId={mockRoundId} />)

    const UnauthenticatedIssueDisplay = jest.requireMock('@aces/app/issues/anonymous-issue-display').default
    expect(UnauthenticatedIssueDisplay).toHaveBeenCalledWith({ roundId: mockRoundId }, {})
  })

  it('passes roundId to AuthenticatedIssueDisplay', () => {
    const mockUser = { id: 'test-user-id', name: 'Test User', accessToken: 'test-access-token' }
    render(<IssueDisplay user={mockUser} roundId={mockRoundId} />)

    const AuthenticatedIssueDisplay = jest.requireMock('@aces/app/issues/authenticated-issue-display').default
    expect(AuthenticatedIssueDisplay).toHaveBeenCalledWith({ roundId: mockRoundId }, {})
  })
})
