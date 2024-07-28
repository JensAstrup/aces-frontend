import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'

import AuthenticatedIssueDisplay from '@aces/app/issues/authenticated-issue-display'
import { View } from '@aces/interfaces/view'
import useGetIssuesForView from '@aces/lib/api/get-issues-for-view'
import useGetFavoriteViews from '@aces/lib/api/views/get-favorite-views'
import { useUser } from '@aces/lib/hooks/auth/user-context'
import { useIssues } from '@aces/lib/hooks/issues/issues-context'
import useSetRoundIssue from '@aces/lib/hooks/rounds/use-set-round-issue'


jest.mock('@aces/lib/hooks/auth/user-context')
jest.mock('@aces/lib/hooks/issues/issues-context')
jest.mock('@aces/lib/api/views/get-favorite-views')
jest.mock('@aces/lib/api/get-issues-for-view')
jest.mock('@aces/lib/hooks/rounds/use-set-round-issue')
jest.mock('@aces/components/issues/issue-content', () => () => <div data-testid="issue-content" />)
jest.mock('@aces/components/ui/separator', () => ({ Separator: () => <hr data-testid="separator" /> }))
jest.mock('@aces/components/view-dropdown', () => ({ __esModule: true, default: () => <div data-testid="view-dropdown" /> }))
jest.mock('@aces/components/rounds/loading-round', () => () => <div data-testid="loading-round" />)
jest.mock('@aces/components/rounds/round-error', () => () => <div data-testid="round-error" />)

describe('AuthenticatedIssueDisplay', () => {
  const mockDispatch = jest.fn()
  const mockUseIssues = useIssues as jest.MockedFunction<typeof useIssues>
  const mockUseUser = useUser as jest.MockedFunction<typeof useUser>
  const mockUseGetFavoriteViews = useGetFavoriteViews as jest.MockedFunction<typeof useGetFavoriteViews>
  const mockUseGetIssuesForView = useGetIssuesForView as jest.MockedFunction<typeof useGetIssuesForView>
  const mockUseSetRoundIssue = useSetRoundIssue as jest.MockedFunction<typeof useSetRoundIssue>

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseIssues.mockReturnValue({
      state: {
        selectedView: null,
        currentIssueIndex: 0,
        issues: [],
        nextPage: null,
        isLoading: false
      },
      dispatch: mockDispatch
    })
    mockUseUser.mockReturnValue({ user: null, error: null, isLoading: false })
    mockUseGetFavoriteViews.mockReturnValue({
      isLoading: false,
      favoriteViews: undefined,
      isError: undefined
    })
    // @ts-expect-error Mocking return value as needed for testing
    mockUseGetIssuesForView.mockReturnValue({
      data: null, error: null,
      isLoading: false
    })
    mockUseSetRoundIssue.mockReturnValue({
      error: null,
      data: undefined,
      isLoading: false
    })
  })

  it('renders LoadingRound when views are loading', () => {
    mockUseGetFavoriteViews.mockReturnValue({
      isLoading: true,
      favoriteViews: undefined,
      isError: undefined
    })
    render(<AuthenticatedIssueDisplay roundId="test-round" />)
    expect(screen.getByTestId('loading-round')).toBeInTheDocument()
  })

  it('renders RoundError when there is an issue error', () => {
    // @ts-expect-error Mocking return value as needed for testing
    mockUseGetIssuesForView.mockReturnValue({
      data: null, error: new Error('Test error'),
      isLoading: false
    })
    render(<AuthenticatedIssueDisplay roundId="test-round" />)
    expect(screen.getByTestId('round-error')).toBeInTheDocument()
  })

  it('renders RoundError when there is a current issue error', () => {
    mockUseSetRoundIssue.mockReturnValue({
      error: new Error('Test error'),
      data: undefined,
      isLoading: false
    })
    render(<AuthenticatedIssueDisplay roundId="test-round" />)
    expect(screen.getByTestId('round-error')).toBeInTheDocument()
  })

  it('renders ViewDropdown when user is authenticated', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'test-user', accessToken: '' },
      isLoading: false,
      error: null
    })
    render(<AuthenticatedIssueDisplay roundId="test-round" />)
    expect(screen.getByTestId('view-dropdown')).toBeInTheDocument()
  })

  it('does not render ViewDropdown when user is not authenticated', () => {
    mockUseUser.mockReturnValue({
      user: null,
      isLoading: false,
      error: null
    })
    render(<AuthenticatedIssueDisplay roundId="test-round" />)
    expect(screen.queryByTestId('view-dropdown')).not.toBeInTheDocument()
  })

  it('renders IssueContent when selectedView is present', () => {
    mockUseIssues.mockReturnValue({
      state: {
        selectedView: { id: 'test-view' } as unknown as View,
        currentIssueIndex: 0,
        issues: [],
        nextPage: null,
        isLoading: false
      },
      dispatch: mockDispatch
    })
    render(<AuthenticatedIssueDisplay roundId="test-round" />)
    expect(screen.getByTestId('issue-content')).toBeInTheDocument()
  })

  it('updates issues when fetchedIssues change', async () => {
    const mockFetchedIssues = {
      issues: [{ id: 'issue1' }, { id: 'issue2' }],
      nextPage: 'next-page-token'
    }
    // @ts-expect-error Mocking return value as needed for testing
    mockUseGetIssuesForView.mockReturnValue({
      data: mockFetchedIssues, error: null,
      isLoading: false
    })

    render(<AuthenticatedIssueDisplay roundId="test-round" />)

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_ISSUES', payload: mockFetchedIssues.issues })
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_NEXT_PAGE', payload: mockFetchedIssues.nextPage })
    })
  })
})
