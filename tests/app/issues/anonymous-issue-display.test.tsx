import { render, screen } from '@testing-library/react'
import React from 'react'

import UnauthenticatedIssueDisplay, { CurrentIssueDisplay } from '@aces/app/issues/anonymous-issue-display'
import { Issue } from '@aces/interfaces/issue'
import { useIssues } from '@aces/lib/hooks/issues/issues-context'

// Mock the dependencies
jest.mock('@aces/components/comments/comment-list', () => ({
  CommentList: () => <div data-testid="comments">Mocked Comments</div>
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

jest.mock('@aces/lib/hooks/issues/issues-context', () => ({
  useIssues: jest.fn().mockImplementation(() => ({
    setCurrentIssue: jest.fn(),
  })
  ),
  IssuesProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="issues-provider">{children}</div>
  )
}))
const mockUseIssues = useIssues as jest.MockedFunction<typeof useIssues>


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
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders LoadingRound when issue is null', () => {
    render(<UnauthenticatedIssueDisplay />)

    expect(screen.getByTestId('loading-round')).toBeInTheDocument()
    expect(screen.queryByText('Current Issue')).not.toBeInTheDocument()
  })

  it('passes issue to useWebSocketIssue hook', () => {
    mockUseIssues.mockReturnValue({
    // @ts-expect-error mock implementation
      currentIssue: 'test-issue-123',
    })

    render(<UnauthenticatedIssueDisplay />)

    expect(mockUseIssues).toHaveBeenCalled()
  })
})
