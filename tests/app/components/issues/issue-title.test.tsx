import { render, screen } from '@testing-library/react'
import dayjs from 'dayjs'
import React from 'react'

import { IssueTitle } from '@aces/components/issues/issue-title'
import { Issue } from '@aces/interfaces/issue'


// Mock the lucide-react components
jest.mock('lucide-react', () => ({
  CalendarIcon: () => <div data-testid="calendar-icon" />,
  User: () => <div data-testid="user-icon" />,
  Users: () => <div data-testid="users-icon" />,
}))

// Mock the HoverCard components
jest.mock('@aces/components/ui/hover-card', () => ({
  HoverCard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  HoverCardTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="hover-card-trigger">{children}</div>,
  HoverCardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="hover-card-content">{children}</div>,
}))

describe('IssueTitle', () => {
  const mockIssue: Issue = {
    id: '1',
    title: 'Test Issue',
    createdAt: '2023-01-01T00:00:00Z',
    team: { name: 'Test Team', id: 1 },
    creator: { displayName: 'John Doe', name: 'john.doe', id: 2 },
  } as Issue

  it('should render the issue title', () => {
    render(<IssueTitle issue={mockIssue} />)
    expect(screen.queryAllByText('Test Issue')).toHaveLength(2)
  })

  it('should truncate long titles', () => {
    const longTitleIssue = { ...mockIssue, title: 'This is a very long title that should be truncated' }
    render(<IssueTitle issue={longTitleIssue} />)
    expect(screen.getByText('This is a very long title that should be ...')).toBeInTheDocument()
  })

  it('should not truncate titles shorter than or equal to 41 characters', () => {
    const shortTitleIssue = { ...mockIssue, title: 'This title is exactly 41 characters long..' }
    render(<IssueTitle issue={shortTitleIssue} />)
    expect(screen.getByText('This title is exactly 41 characters long..')).toBeInTheDocument()
  })

  it('should render hover card content with full issue details', () => {
    render(<IssueTitle issue={mockIssue} />)
    const dateCreated = dayjs(mockIssue.createdAt).format('MMM DD, YYYY')
    // HoverCardContent is always rendered due to our mock, so we can check its content directly
    expect(screen.queryAllByText('Test Issue')).toHaveLength(2)
    expect(screen.getByText(`Created ${dateCreated}`)).toBeInTheDocument()
    expect(screen.getByText('Team: Test Team')).toBeInTheDocument()
    expect(screen.getByText('Creator:')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('should format the creation date correctly', () => {
    const dateIssue = { ...mockIssue, createdAt: '2023-12-25T12:34:56Z' }
    const dateCreated = dayjs('2023-12-25T12:34:56Z').format('MMM DD, YYYY')
    render(<IssueTitle issue={dateIssue} />)
    expect(screen.getByText(`Created ${dateCreated}`)).toBeInTheDocument()
  })

  it('should render icons', () => {
    render(<IssueTitle issue={mockIssue} />)
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument()
    expect(screen.getByTestId('users-icon')).toBeInTheDocument()
    expect(screen.getByTestId('user-icon')).toBeInTheDocument()
  })
})
