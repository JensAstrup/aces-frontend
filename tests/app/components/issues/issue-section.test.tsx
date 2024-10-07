import { render, screen } from '@testing-library/react'
import React from 'react'

import IssueSection from '@aces/components/issues/issue-section'


jest.mock('@aces/lib/hooks/issues/issues-context', () => ({
  useIssues: () => ({ currentIssue: { title: 'Test Issue', description: 'Test Description', url: 'https://test-issue.com' } })
}))

jest.mock('@aces/components/issues/issue-title', () => ({
  IssueTitle: () => <div data-testid="issue-title">Test Issue</div>
}))

jest.mock('@aces/components/issues/issue-navigation', () => ({
  IssueNavigation: () => (
    <div data-testid="issue-navigation">
    </div>
  )
}))

jest.mock('@aces/components/issues/issue-description', () => ({
  __esModule: true,
  default: ({ description }: { description: string }) => <div data-testid="issue-description">{description}</div>
}))


describe('IssueSection', () => {
  it('should render all child components', () => {
    render(<IssueSection />)

    expect(screen.getByTestId('issue-title')).toBeInTheDocument()
    expect(screen.getByTestId('issue-navigation')).toBeInTheDocument()
    expect(screen.getByTestId('issue-description')).toBeInTheDocument()
  })
})
