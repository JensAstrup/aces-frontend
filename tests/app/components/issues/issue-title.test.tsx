import { render, screen } from '@testing-library/react'
import dayjs from 'dayjs'
import React from 'react'

import { IssueTitle } from '@aces/components/issues/issue-title'
import { Issue } from '@aces/interfaces/issue'
import useIssues from '@aces/lib/hooks/issues/issues-context'


jest.mock('lucide-react', () => ({
  CalendarIcon: () => <div data-testid="calendar-icon" />,
  User: () => <div data-testid="user-icon" />,
  Users: () => <div data-testid="users-icon" />,
}))

jest.mock('@aces/components/ui/hover-card', () => ({
  HoverCard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  HoverCardTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="hover-card-trigger">{children}</div>,
  HoverCardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="hover-card-content">{children}</div>,
}))


jest.mock('@aces/lib/hooks/issues/issues-context')
const mockUseIssues = useIssues as jest.MockedFunction<typeof useIssues>

const useIssuesReturnValue = { currentIssue: null, loadIssues: jest.fn(), isLoading: false, setCurrentIssue: jest.fn(), setIssues: jest.fn(), issues: [] }

describe('IssueTitle', () => {
  const mockIssue: Issue = {
    id: '1',
    title: 'Test Issue',
    createdAt: '2023-01-01T00:00:00Z',
    team: { name: 'Test Team', id: 1 },
    creator: { displayName: 'John Doe', name: 'john.doe', id: 2 },
  } as Issue

  it('should render the issue title', () => {
    mockUseIssues.mockReturnValue({ ...useIssuesReturnValue, currentIssue: mockIssue })
    render(<IssueTitle />)
    expect(screen.queryAllByText('Test Issue')).toHaveLength(2)
  })

  it('should truncate long titles', () => {
    const longTitleIssue = { ...mockIssue, title: 'This is a very long title that should be truncated' }
    mockUseIssues.mockReturnValue({ ...useIssuesReturnValue, currentIssue: longTitleIssue })
    render(<IssueTitle />)
    expect(screen.getByText('This is a very long title that should be ...')).toBeInTheDocument()
  })

  it('should not truncate titles shorter than or equal to 41 characters', () => {
    const shortTitleIssue = { ...mockIssue, title: 'This title is exactly 41 characters long..' }
    mockUseIssues.mockReturnValue({ ...useIssuesReturnValue, currentIssue: shortTitleIssue })
    render(<IssueTitle />)
    expect(screen.getByText('This title is exactly 41 characters long..')).toBeInTheDocument()
  })

  it('should render hover card content with full issue details', () => {
    mockUseIssues.mockReturnValue({ ...useIssuesReturnValue, currentIssue: mockIssue })
    render(<IssueTitle />)
    const dateCreated = dayjs(mockIssue.createdAt).format('MMM DD, YYYY')
    expect(screen.queryAllByText('Test Issue')).toHaveLength(2)
    expect(screen.getByText(`Created ${dateCreated}`)).toBeInTheDocument()
    expect(screen.getByText('Team: Test Team')).toBeInTheDocument()
    expect(screen.getByText('Creator:')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('should format the creation date correctly', () => {
    const dateIssue = { ...mockIssue, createdAt: '2023-12-25T12:34:56Z' }
    const dateCreated = dayjs('2023-12-25T12:34:56Z').format('MMM DD, YYYY')
    mockUseIssues.mockReturnValue({ ...useIssuesReturnValue, currentIssue: dateIssue })
    render(<IssueTitle />)
    expect(screen.getByText(`Created ${dateCreated}`)).toBeInTheDocument()
  })

  it('should render icons', () => {
    mockUseIssues.mockReturnValue({ ...useIssuesReturnValue, currentIssue: mockIssue })
    render(<IssueTitle />)
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument()
    expect(screen.getByTestId('users-icon')).toBeInTheDocument()
    expect(screen.getByTestId('user-icon')).toBeInTheDocument()
  })
})
