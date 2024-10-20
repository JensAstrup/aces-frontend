import { render, screen } from '@testing-library/react'
import React from 'react'
import '@testing-library/jest-dom'

import IssueContent from '@aces/components/issues/issue-content'
import { Issue } from '@aces/interfaces/issue'
import { useIssues } from '@aces/lib/hooks/issues/issues-context'


jest.mock('@aces/lib/hooks/issues/issues-context')
jest.mock('@aces/components/issues/issue-section', () => () => <div data-testid="issue-section" />)
jest.mock('@aces/components/comments/comment-list', () => ({ CommentList: () => <div data-testid="comment-list" /> }))
jest.mock('@aces/components/issues/loading-issues', () => () => <div data-testid="loading-issues" />)

const mockUseIssues = useIssues as jest.MockedFunction<typeof useIssues>

describe('IssueContent', () => {
  it('should render IssueSection and CommentList when currentIssue exists and not loading', () => {
    const mockIssue: Issue = { id: '1', title: 'Test Issue' } as Issue
    mockUseIssues.mockReturnValue({
      currentIssue: mockIssue,
      isLoading: false,
      issues: [mockIssue],
      setCurrentIssue: jest.fn(),
      setIssues: jest.fn()
    })

    render(<IssueContent />)

    expect(screen.getByTestId('issue-section')).toBeInTheDocument()
    expect(screen.getByTestId('comment-list')).toBeInTheDocument()
  })

  it('should render LoadingIssues when isLoading is true', () => {
    mockUseIssues.mockReturnValue({
      currentIssue: null,
      isLoading: true,
      issues: [],
      setCurrentIssue: jest.fn(),
      setIssues: jest.fn()
    })

    render(<IssueContent />)

    expect(screen.getByTestId('loading-issues')).toBeInTheDocument()
  })

  it('should render "No issues found" message when currentIssue is null and not loading', () => {
    mockUseIssues.mockReturnValue({
      currentIssue: null,
      isLoading: false,
      issues: [],
      setCurrentIssue: jest.fn(),
      setIssues: jest.fn()
    })

    render(<IssueContent />)

    expect(screen.getByText('No issues found')).toBeInTheDocument()
    expect(screen.getByText('Please try another view')).toBeInTheDocument()
  })
})
