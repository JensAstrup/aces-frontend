import { render, screen } from '@testing-library/react'
import React from 'react'

import UnauthenticatedIssueDisplay, { CurrentIssueDisplay } from '@aces/app/issues/anonymous-issue-display'
import { Issue } from '@aces/interfaces/issue'
import useWebSocketIssue from '@aces/lib/hooks/issues/use-websocket-issue'

// Mock the dependencies
jest.mock('@aces/components/comments/comments', () => ({
  Comments: () => <div data-testid="comments">Mocked Comments</div>
}))

jest.mock('@aces/components/issues/issue-section', () => ({
  __esModule: true,
  default: () => <div data-testid="issue-section">Mocked Issue Section</div>
}))

jest.mock('@aces/components/rounds/loading-round', () => ({
  __esModule: true,
  default: () => <div data-testid="loading-round">Mocked Loading Round</div>
}))

jest.mock('@aces/components/ui/separator', () => ({
  Separator: () => <hr data-testid="separator" />
}))

jest.mock('@aces/lib/hooks/issues/use-websocket-issue')

describe('CurrentIssueDisplay', () => {
  const mockIssue = {
    id: '1',
    title: 'Test Issue',
    body: 'This is a test issue'
  } as unknown as Issue

  it('renders correctly with given issue', () => {
    render(<CurrentIssueDisplay issue={mockIssue} />)

    expect(screen.getByText('Current Issue')).toBeInTheDocument()
    expect(screen.getByTestId('separator')).toBeInTheDocument()
    expect(screen.getByTestId('issue-section')).toBeInTheDocument()
    expect(screen.getByTestId('comments')).toBeInTheDocument()
  })
})

describe('UnauthenticatedIssueDisplay', () => {
  const mockUseWebSocketIssue = useWebSocketIssue as jest.MockedFunction<typeof useWebSocketIssue>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders LoadingRound when issue is null', () => {
    mockUseWebSocketIssue.mockReturnValue({
      issue: null,
      isLoading: false
    })

    render(<UnauthenticatedIssueDisplay roundId="test-round" />)

    expect(screen.getByTestId('loading-round')).toBeInTheDocument()
    expect(screen.queryByText('Current Issue')).not.toBeInTheDocument()
  })

  it('renders CurrentIssueDisplay when issue is available', () => {
    const mockIssue = {
      id: '1',
      title: 'Test Issue',
      body: 'This is a test issue'
    } as unknown as Issue
    mockUseWebSocketIssue.mockReturnValue({ issue: mockIssue, isLoading: false })

    render(<UnauthenticatedIssueDisplay roundId="test-round" />)

    expect(screen.getByText('Current Issue')).toBeInTheDocument()
    expect(screen.queryByTestId('loading-round')).not.toBeInTheDocument()
  })

  it('passes roundId to useWebSocketIssue hook', () => {
    mockUseWebSocketIssue.mockReturnValue({
      issue: null,
      isLoading: false
    })

    render(<UnauthenticatedIssueDisplay roundId="test-round-123" />)

    expect(mockUseWebSocketIssue).toHaveBeenCalledWith('test-round-123')
  })
})
