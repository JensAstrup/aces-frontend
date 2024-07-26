import { render, screen } from '@testing-library/react'
import React from 'react'

import UnauthenticatedIssueDisplay, { CurrentIssueDisplay, LoadingDisplay } from '@aces/app/issues/anonymous-issue-display'
import { Issue } from '@aces/interfaces/issue'
import useWebSocketIssue from '@aces/lib/hooks/use-websocket-issue'
import '@testing-library/jest-dom'


jest.mock('@aces/lib/hooks/use-websocket-issue', () => ({
  __esModule: true,
  default: jest.fn(),
}))
const mockUseWebSocketIssue = useWebSocketIssue as jest.Mock

jest.mock('@aces/components/comments/comments', () => ({
  Comments: () => <div data-testid="comments">Mocked Comments</div>,
}))

jest.mock('@aces/components/issues/issue-section', () => ({
  __esModule: true,
  default: () => <div data-testid="issue-section">Mocked IssueSection</div>,
}))

describe('UnauthenticatedIssueDisplay', () => {
  const mockIssue = {
    id: '1',
    title: 'Test Issue',
  }

  it('renders loading state when there is no current issue', () => {
    mockUseWebSocketIssue.mockReturnValue({ issue: null })

    render(<UnauthenticatedIssueDisplay roundId="123" />)

    expect(screen.getByText('Waiting for round to begin')).toBeInTheDocument()
  })

  it('renders current issue when available', () => {
    mockUseWebSocketIssue.mockReturnValue({ issue: mockIssue })

    render(<UnauthenticatedIssueDisplay roundId="123" />)

    expect(screen.getByText('Current Issue')).toBeInTheDocument()
    expect(screen.getByTestId('issue-section')).toBeInTheDocument()
    expect(screen.getByTestId('comments')).toBeInTheDocument()
  })

  it('calls useWebSocketIssue with the correct roundId', () => {
    render(<UnauthenticatedIssueDisplay roundId="123" />)

    expect(mockUseWebSocketIssue).toHaveBeenCalledWith('123')
  })
})

describe('CurrentIssueDisplay', () => {
  const mockIssue = {
    id: '1',
    title: 'Test Issue',
  } as unknown as Issue

  it('renders IssueSection and Comments components', () => {
    render(<CurrentIssueDisplay issue={mockIssue} />)

    expect(screen.getByTestId('issue-section')).toBeInTheDocument()
    expect(screen.getByTestId('comments')).toBeInTheDocument()
  })
})

describe('LoadingDisplay', () => {
  it('renders loading message', () => {
    render(<LoadingDisplay />)

    expect(screen.getByText('Waiting for round to begin')).toBeInTheDocument()
  })
})
