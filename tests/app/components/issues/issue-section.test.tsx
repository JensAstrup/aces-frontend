import { render, screen } from '@testing-library/react'
import React from 'react'

import IssueSection from '@aces/components/issues/issue-section'
import { Issue } from '@aces/interfaces/issue'


jest.mock('@aces/components/issues/issue-title', () => ({
  IssueTitle: ({ issue }: { issue: Issue }) => <div data-testid="issue-title">{issue.title}</div>
}))

jest.mock('@aces/components/issues/issue-navigation', () => ({
  IssueNavigation: ({ handleNavigate, hasPrevIssue, hasNextIssue }: { handleNavigate?: () => void, hasPrevIssue?: boolean, hasNextIssue?: boolean }) => (
    <div data-testid="issue-navigation">
      {handleNavigate && 'Has Navigation'}
      {hasPrevIssue && 'Has Prev'}
      {hasNextIssue && 'Has Next'}
    </div>
  )
}))

jest.mock('@aces/components/issues/issue-description', () => ({
  __esModule: true,
  default: ({ description }: { description: string }) => <div data-testid="issue-description">{description}</div>
}))

jest.mock('lucide-react', () => ({
  ExternalLink: () => <div data-testid="external-link-icon" />
}))

describe('IssueSection', () => {
  const mockIssue: Issue = {
    id: '1',
    title: 'Test Issue',
    description: 'Test Description',
    url: 'https://test-issue.com',
    createdAt: '2023-01-01T00:00:00Z',
    team: { name: 'Test Team', id: 1 },
    creator: { displayName: 'John Doe', name: 'john.doe', id: 2 },
  } as Issue

  const mockHandleNavigate = jest.fn()

  it('should render all child components', () => {
    render(<IssueSection issue={mockIssue} />)

    expect(screen.getByTestId('issue-title')).toBeInTheDocument()
    expect(screen.getByTestId('issue-navigation')).toBeInTheDocument()
    expect(screen.getByTestId('issue-description')).toBeInTheDocument()
    expect(screen.getByTestId('external-link-icon')).toBeInTheDocument()
  })

  it('should pass correct props to child components', () => {
    render(
      <IssueSection
        issue={mockIssue}
        handleNavigate={mockHandleNavigate}
        hasPrevIssue={true}
        hasNextIssue={false}
      />
    )

    expect(screen.getByTestId('issue-title')).toHaveTextContent('Test Issue')
    expect(screen.getByTestId('issue-description')).toHaveTextContent('Test Description')
    expect(screen.getByTestId('issue-navigation')).toHaveTextContent('Has NavigationHas Prev')
  })

  it('should render external link with correct URL', () => {
    render(<IssueSection issue={mockIssue} />)

    const externalLink = screen.getByTestId('external-link-icon').closest('a')
    expect(externalLink).toHaveAttribute('href', 'https://test-issue.com')
    expect(externalLink).toHaveAttribute('target', '_blank')
  })

  it('should not render navigation when handleNavigate is not provided', () => {
    render(<IssueSection issue={mockIssue} />)

    expect(screen.getByTestId('issue-navigation')).not.toHaveTextContent('Has Navigation')
  })

  it('should render navigation when handleNavigate is provided', () => {
    render(<IssueSection issue={mockIssue} handleNavigate={mockHandleNavigate} />)

    expect(screen.getByTestId('issue-navigation')).toHaveTextContent('Has Navigation')
  })

  it('should render correct navigation state', () => {
    render(
      <IssueSection
        issue={mockIssue}
        handleNavigate={mockHandleNavigate}
        hasPrevIssue={true}
        hasNextIssue={true}
      />
    )

    expect(screen.getByTestId('issue-navigation')).toHaveTextContent('Has NavigationHas PrevHas Next')
  })
})
