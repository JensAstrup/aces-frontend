import { render, screen } from '@testing-library/react'
import React from 'react'

import useWebSocketIssue from '@aces/app/hooks/use-websocket'
import { Issue } from '@aces/app/interfaces/issue'
import UnauthenticatedIssueDisplay, { CurrentIssueDisplay, LoadingDisplay } from '@aces/app/issues/anonymous-issue-display'
import '@testing-library/jest-dom'


jest.mock('@aces/app/hooks/use-websocket')
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
    mockUseWebSocketIssue.mockReturnValue(null)

    render(<UnauthenticatedIssueDisplay roundId="123" />)

    expect(screen.getByText('Current Issue')).toBeInTheDocument()
    expect(screen.getByText('Waiting for new issues...')).toBeInTheDocument()
  })

  it('renders current issue when available', () => {
    mockUseWebSocketIssue.mockReturnValue(mockIssue)

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

    expect(screen.getByText('Waiting for new issues...')).toBeInTheDocument()
  })
})
