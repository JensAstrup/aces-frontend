import { act, render, screen, waitFor } from '@testing-library/react'
import { useParams } from 'next/navigation'
import React from 'react'

import { Issue } from '@aces/interfaces/issue'
import User from '@aces/interfaces/user'
import { View } from '@aces/interfaces/view'
import { getIssuesForView } from '@aces/lib/api/get-issues-for-view'
import useCurrentUser from '@aces/lib/hooks/auth/use-current-user'
import { IssuesProvider, useIssues } from '@aces/lib/hooks/issues/issues-context'
import { setRoundIssue } from '@aces/lib/hooks/rounds/use-set-round-issue'
import useViews from '@aces/lib/hooks/views/views-context'


jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}))

jest.mock('@aces/lib/api/get-issues-for-view', () => ({
  getIssuesForView: jest.fn(),
}))

jest.mock('@aces/lib/hooks/auth/use-current-user', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('@aces/lib/hooks/rounds/use-set-round-issue', () => ({
  setRoundIssue: jest.fn(),
}))

jest.mock('@aces/lib/hooks/views/views-context', () => ({
  __esModule: true,
  default: jest.fn(),
}))

const mockUseParams = useParams as jest.MockedFunction<typeof useParams>
const mockGetIssuesForView = getIssuesForView as jest.MockedFunction<typeof getIssuesForView>
const mockUseCurrentUser = useCurrentUser as jest.MockedFunction<typeof useCurrentUser>
const mockSetRoundIssue = setRoundIssue as jest.MockedFunction<typeof setRoundIssue>
const mockUseViews = useViews as jest.MockedFunction<typeof useViews>

const TestComponent: React.FC = () => {
  const { issues, currentIssue, setCurrentIssue, isLoading, loadIssues } = useIssues()
  return (
    <div>
      <div data-testid="issues-count">{issues.length}</div>
      <div data-testid="current-issue">{currentIssue?.id || 'No current issue'}</div>
      <div data-testid="loading-state">{isLoading ? 'Loading' : 'Not loading'}</div>
      <button onClick={() => {
        setCurrentIssue({ id: 'new-issue', title: 'New Issue' } as Issue)
      }}
      >
        Set New Issue
      </button>
      <button onClick={loadIssues}>Load Issues</button>
    </div>
  )
}

describe('IssuesProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseParams.mockReturnValue({ roundId: 'test-round' })
    mockUseCurrentUser.mockReturnValue({ user: { id: 'user1', linearId: 'linear1', displayName: 'user1' } as User } as ReturnType<typeof useCurrentUser>)
    mockUseViews.mockReturnValue({ selectedView: { id: 'view1', name: 'Test View' } as View } as ReturnType<typeof useViews>)
  })

  it('should initialize with empty state', () => {
    render(
      <IssuesProvider>
        <TestComponent />
      </IssuesProvider>
    )

    expect(screen.getByTestId('issues-count')).toHaveTextContent('0')
    expect(screen.getByTestId('current-issue')).toHaveTextContent('No current issue')
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading')
  })

  it('should load issues when selectedView changes', async () => {
    const mockIssues = [{ id: 'issue1', title: 'Issue 1' }, { id: 'issue2', title: 'Issue 2' }] as Issue[]
    mockGetIssuesForView.mockResolvedValue({ issues: mockIssues, nextPage: 'nextPage' })

    act(() => {
      render(
        <IssuesProvider>
          <TestComponent />
        </IssuesProvider>
      )
    })

    await waitFor(() => {
      expect(screen.getByTestId('issues-count')).toHaveTextContent('2')
      expect(screen.getByTestId('current-issue')).toHaveTextContent('issue1')
    })

    expect(mockGetIssuesForView).toHaveBeenCalledWith('view1')
    expect(mockSetRoundIssue).toHaveBeenCalledWith('test-round', 'issue1')
  })

  it('should handle error when loading issues', async () => {
    mockGetIssuesForView.mockRejectedValue(new Error('Failed to fetch'))
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    act(() => {
      render(
        <IssuesProvider>
          <TestComponent />
        </IssuesProvider>
      )
    })

    await waitFor(() => {
      expect(screen.getByTestId('issues-count')).toHaveTextContent('0')
      expect(screen.getByTestId('current-issue')).toHaveTextContent('No current issue')
    })

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch issues:', expect.any(Error))
    consoleErrorSpy.mockRestore()
  })

  it('should update current issue and call setRoundIssue', () => {
    act(() => {
      render(
        <IssuesProvider>
          <TestComponent />
        </IssuesProvider>
      )
    })

    act(() => {
      screen.getByText('Set New Issue').click()
    })

    expect(screen.getByTestId('current-issue')).toHaveTextContent('new-issue')
    expect(mockSetRoundIssue).toHaveBeenCalledWith('test-round', 'new-issue')
  })

  it('should not call setRoundIssue when user has no linearId', () => {
    mockUseCurrentUser.mockReturnValue({ user: { id: 'user1' } } as ReturnType<typeof useCurrentUser>)

    act(() => {
      render(
        <IssuesProvider>
          <TestComponent />
        </IssuesProvider>
      )
    })

    act(() => {
      screen.getByText('Set New Issue').click()
    })

    expect(screen.getByTestId('current-issue')).toHaveTextContent('new-issue')
    expect(mockSetRoundIssue).not.toHaveBeenCalled()
  })

  it('should clear issues and current issue when selectedView becomes null', async () => {
    const mockIssues = [{ id: 'issue1', title: 'Issue 1' }] as Issue[]
    mockGetIssuesForView.mockResolvedValue({ issues: mockIssues, nextPage: 'nextPage' })

    const { rerender } = render(
      <IssuesProvider>
        <TestComponent />
      </IssuesProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('issues-count')).toHaveTextContent('1')
      expect(screen.getByTestId('current-issue')).toHaveTextContent('issue1')
    })

    mockUseViews.mockReturnValue({ selectedView: null, isLoading: false } as ReturnType<typeof useViews>)

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

  it('should allow manual loading of issues', async () => {
    const mockIssues = [{ id: 'issue1', title: 'Issue 1' }] as Issue[]
    mockGetIssuesForView.mockResolvedValue({ issues: mockIssues, nextPage: 'nextPage' })

    render(
      <IssuesProvider>
        <TestComponent />
      </IssuesProvider>
    )

    act(() => {
      screen.getByText('Load Issues').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('issues-count')).toHaveTextContent('1')
      expect(screen.getByTestId('current-issue')).toHaveTextContent('issue1')
    })
  })

  it('should throw an error when useIssues is used outside of IssuesProvider', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<TestComponent />)).toThrow('useSimpleIssues must be used within a IssuesProvider')

    consoleErrorSpy.mockRestore()
  })
})
