'use client'
import React, { useCallback, useEffect } from 'react'

import IssueContent from '@aces/components/issues/issue-content'
import LoadingRound from '@aces/components/rounds/loading-round'
import RoundError from '@aces/components/rounds/round-error'
import { Separator } from '@aces/components/ui/separator'
import ViewDropdown from '@aces/components/view-dropdown'
import { View } from '@aces/interfaces/view'
import useGetIssuesForView from '@aces/lib/api/get-issues-for-view'
import useGetFavoriteViews from '@aces/lib/api/views/get-favorite-views'
import { useIssues } from '@aces/lib/hooks/issues/issues-context'
import useSetRoundIssue from '@aces/lib/hooks/rounds/useSetRoundIssue'
import { useUser } from '@aces/lib/hooks/user-context'


interface AuthenticatedIssueDisplayProps {
    roundId: string
}

function AuthenticatedIssueDisplay({ roundId }: AuthenticatedIssueDisplayProps) {
  const { user } = useUser()
  const { state: issuesState, dispatch } = useIssues()
  const { selectedView, currentIssueIndex, issues } = issuesState
  const accessToken = localStorage.getItem('accessToken')
  const { isLoading: viewsLoading } = useGetFavoriteViews(accessToken!)
  // Fetch issues when selectedView changes
  const { data: fetchedIssues, error: issuesError } = useGetIssuesForView(selectedView)

  const { error: currentIssueError } = useSetRoundIssue(roundId, issues[currentIssueIndex]?.id || '')

  useEffect(() => {
    if (fetchedIssues) {
      dispatch({ type: 'SET_ISSUES', payload: fetchedIssues.issues })
      dispatch({ type: 'SET_NEXT_PAGE', payload: fetchedIssues.nextPage })
    }
  }, [fetchedIssues, dispatch])

  const handleViewSelect = useCallback((view: View) => {
    dispatch({ type: 'SET_SELECTED_VIEW', payload: view })
  }, [dispatch])

  const setView = useCallback((view: View | ((prev: View | null) => View | null)) => {
    if (typeof view === 'function') {
      dispatch({ type: 'SET_SELECTED_VIEW', payload: view(selectedView) })
    }
    else {
      handleViewSelect(view)
    }
  }, [handleViewSelect, dispatch, selectedView])

  const handleNavigate = useCallback((direction: 'next' | 'previous') => {
    dispatch({
      type: 'SET_CURRENT_ISSUE_INDEX',
      payload: direction === 'next' ? currentIssueIndex + 1 : currentIssueIndex - 1
    })
  }, [dispatch, currentIssueIndex])

  if (issuesError || currentIssueError) return <RoundError />
  if (viewsLoading) return <LoadingRound />

  return (
    <div className="space-y-6">
      {user && (
        <div>
          <ViewDropdown selectedView={selectedView} setSelectedView={setView} />
        </div>
      )}
      <Separator />
      {selectedView && (
        <IssueContent
          currentIssueIndex={currentIssueIndex}
          handleNavigate={handleNavigate}
        />
      )}
    </div>
  )
}

export default AuthenticatedIssueDisplay
