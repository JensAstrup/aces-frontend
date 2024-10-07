import { render, screen } from '@testing-library/react'
import React from 'react'

import UnauthenticatedIssueDisplay from '@aces/app/issues/anonymous-issue-display'


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


describe('UnauthenticatedIssueDisplay', () => {
  it('renders correctly with given issue', () => {
    render(<UnauthenticatedIssueDisplay />)

    expect(screen.getByText('Current Issue')).toBeInTheDocument()
    expect(screen.getByTestId('separator')).toBeInTheDocument()
    expect(screen.getByTestId('issue-section')).toBeInTheDocument()
    expect(screen.getByTestId('comments')).toBeInTheDocument()
  })
})
