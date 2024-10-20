import { act, render, screen, waitFor } from '@testing-library/react'
import { useParams } from 'next/navigation'
import React from 'react'

import { Issue } from '@aces/interfaces/issue'
import Team from '@aces/interfaces/team'
import User from '@aces/interfaces/user'
import { View } from '@aces/interfaces/view'
import { getIssuesForView } from '@aces/lib/api/issues/get-issues-for-view'
import useCurrentUser from '@aces/lib/hooks/auth/use-current-user'
import { fetchIssuesForTeam } from '@aces/lib/hooks/issues/get-issues-for-team'
import { IssuesProvider, useIssues } from '@aces/lib/hooks/issues/issues-context'
import { setRoundIssue } from '@aces/lib/hooks/rounds/use-set-round-issue'
import useTeams from '@aces/lib/hooks/teams/teams-context'
import useViews from '@aces/lib/hooks/views/views-context'


jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}))

jest.mock('@aces/lib/api/issues/get-issues-for-view')
jest.mock('@aces/lib/hooks/issues/get-issues-for-team')
jest.mock('@aces/lib/hooks/auth/use-current-user')
jest.mock('@aces/lib/hooks/rounds/use-set-round-issue')
jest.mock('@aces/lib/hooks/views/views-context')
jest.mock('@aces/lib/hooks/teams/teams-context')

const mockUseParams = useParams as jest.MockedFunction<typeof useParams>
const mockGetIssuesForView = getIssuesForView as jest.MockedFunction<typeof getIssuesForView>
const mockFetchIssuesForTeam = fetchIssuesForTeam as jest.MockedFunction<typeof fetchIssuesForTeam>
const mockUseCurrentUser = useCurrentUser as jest.MockedFunction<typeof useCurrentUser>
const mockSetRoundIssue = setRoundIssue as jest.MockedFunction<typeof setRoundIssue>
const mockUseViews = useViews as jest.MockedFunction<typeof useViews>
const mockUseTeams = useTeams as jest.MockedFunction<typeof useTeams>

const TestComponent: React.FC = () => {
  const { issues, currentIssue, setCurrentIssue, isLoading } = useIssues()
  return (
    <div>
      <div data-testid="issues-count">{issues.length}</div>
      <div data-testid="current-issue">{currentIssue?.id || 'No current issue'}</div>
      <div data-testid="loading-state">{isLoading ? 'Loading' : 'Not loading'}</div>
      <button onClick={() => setCurrentIssue({ id: 'new-issue', title: 'New Issue' } as Issue)}>
        Set New Issue
      </button>
    </div>
  )
}

describe('IssuesProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseParams.mockReturnValue({ roundId: 'test-round' })
    mockUseCurrentUser.mockReturnValue({ user: { id: 'user1', linearId: 'linear1', displayName: 'user1' } as User } as ReturnType<typeof useCurrentUser>)
    mockUseViews.mockReturnValue({ selectedView: null } as ReturnType<typeof useViews>)
    mockUseTeams.mockReturnValue({ selectedTeam: null } as ReturnType<typeof useTeams>)
  })

  it('should initialize with empty state', () => {
    render(
      <IssuesProvider>
        <TestComponent />
      </IssuesProvider>
    )

    expect(screen.getByTestId('issues-count')).toHaveTextContent('0')
    expect(screen.getByTestId('current-issue')).toHaveTextContent('No current issue')
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Not loading')
  })

  it('should load issues when selectedView changes', async () => {
    const mockIssues = [{ id: 'issue1', title: 'Issue 1' }, { id: 'issue2', title: 'Issue 2' }] as Issue[]
    mockGetIssuesForView.mockResolvedValue({ issues: mockIssues, nextPage: 'page' })
    mockUseViews.mockReturnValue({ selectedView: { id: 'view1', name: 'Test View' } as View } as ReturnType<typeof useViews>)

    render(
      <IssuesProvider>
        <TestComponent />
      </IssuesProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('issues-count')).toHaveTextContent('2')
      expect(screen.getByTestId('current-issue')).toHaveTextContent('issue1')
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not loading')
    })

    expect(mockGetIssuesForView).toHaveBeenCalledWith('view1')
    expect(mockSetRoundIssue).toHaveBeenCalledWith('test-round', 'issue1')
  })

  it('should load issues when selectedTeam changes and no view is selected', async () => {
    const mockIssues = [{ id: 'issue3', title: 'Issue 3' }] as Issue[]
    mockFetchIssuesForTeam.mockResolvedValue({ issues: mockIssues })
    mockUseTeams.mockReturnValue({ selectedTeam: { id: 'team1', name: 'Test Team' } as Team } as ReturnType<typeof useTeams>)

    render(
      <IssuesProvider>
        <TestComponent />
      </IssuesProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('issues-count')).toHaveTextContent('1')
      expect(screen.getByTestId('current-issue')).toHaveTextContent('issue3')
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not loading')
    })

    expect(mockFetchIssuesForTeam).toHaveBeenCalledWith('team1')
    expect(mockSetRoundIssue).toHaveBeenCalledWith('test-round', 'issue3')
  })

  it('should prioritize view over team when both are selected', async () => {
    const mockViewIssues = [{ id: 'issue4', title: 'Issue 4' }] as Issue[]
    mockGetIssuesForView.mockResolvedValue({ issues: mockViewIssues, nextPage: 'page' })
    mockUseViews.mockReturnValue({ selectedView: { id: 'view1', name: 'Test View' } as View } as ReturnType<typeof useViews>)
    mockUseTeams.mockReturnValue({ selectedTeam: { id: 'team1', name: 'Test Team' } as Team } as ReturnType<typeof useTeams>)

    render(
      <IssuesProvider>
        <TestComponent />
      </IssuesProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('issues-count')).toHaveTextContent('1')
      expect(screen.getByTestId('current-issue')).toHaveTextContent('issue4')
    })

    expect(mockGetIssuesForView).toHaveBeenCalledWith('view1')
    expect(mockFetchIssuesForTeam).not.toHaveBeenCalled()
  })

  it('should handle error when loading issues', async () => {
    mockGetIssuesForView.mockRejectedValue(new Error('Failed to fetch'))
    mockUseViews.mockReturnValue({ selectedView: { id: 'view1', name: 'Test View' } as View } as ReturnType<typeof useViews>)
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <IssuesProvider>
        <TestComponent />
      </IssuesProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('issues-count')).toHaveTextContent('0')
      expect(screen.getByTestId('current-issue')).toHaveTextContent('No current issue')
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not loading')
    })

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch issues:', expect.any(Error))
    consoleErrorSpy.mockRestore()
  })

  it('should update current issue and call setRoundIssue', async () => {
    render(
      <IssuesProvider>
        <TestComponent />
      </IssuesProvider>
    )

    act(() => {
      screen.getByText('Set New Issue').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('current-issue')).toHaveTextContent('new-issue')
    })
    expect(mockSetRoundIssue).toHaveBeenCalledWith('test-round', 'new-issue')
  })

  it('should not call setRoundIssue when user has no linearId', async () => {
    mockUseCurrentUser.mockReturnValue({ user: { id: 'user1' } } as ReturnType<typeof useCurrentUser>)

    render(
      <IssuesProvider>
        <TestComponent />
      </IssuesProvider>
    )

    act(() => {
      screen.getByText('Set New Issue').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('current-issue')).toHaveTextContent('new-issue')
    })
    expect(mockSetRoundIssue).not.toHaveBeenCalled()
  })

  it('should clear issues and current issue when both selectedView and selectedTeam become null', async () => {
    const mockIssues = [{ id: 'issue1', title: 'Issue 1' }] as Issue[]
    mockGetIssuesForView.mockResolvedValue({ issues: mockIssues, nextPage: 'page' })
    mockUseViews.mockReturnValue({ selectedView: { id: 'view1', name: 'Test View' } as View } as ReturnType<typeof useViews>)

    const { rerender } = render(
      <IssuesProvider>
        <TestComponent />
      </IssuesProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('issues-count')).toHaveTextContent('1')
      expect(screen.getByTestId('current-issue')).toHaveTextContent('issue1')
    })

    mockUseViews.mockReturnValue({ selectedView: null } as ReturnType<typeof useViews>)
    mockUseTeams.mockReturnValue({ selectedTeam: null } as ReturnType<typeof useTeams>)

    rerender(
      <IssuesProvider>
        <TestComponent />
      </IssuesProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('issues-count')).toHaveTextContent('0')
      expect(screen.getByTestId('current-issue')).toHaveTextContent('No current issue')
    })
  })

  it('should throw an error when useIssues is used outside of IssuesProvider', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<TestComponent />)).toThrow('useIssues must be used within an IssuesProvider')

    consoleErrorSpy.mockRestore()
  })
})
