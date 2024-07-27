'use client'
import React, { useCallback, useEffect } from 'react'
import useSWR from 'swr'

import IssueContent from '@aces/components/issues/issue-content'
import LoadingRound from '@aces/components/rounds/loading-round'
import RoundError from '@aces/components/rounds/round-error'
import { Separator } from '@aces/components/ui/separator'
import ViewDropdown from '@aces/components/view-dropdown'
import { Issue } from '@aces/interfaces/issue'
import { View } from '@aces/interfaces/view'
import useGetFavoriteViews from '@aces/lib/api/views/get-favorite-views'
import { useIssues } from '@aces/lib/hooks/issues/issues-context'
import { setRoundIssueFetcher } from '@aces/lib/hooks/rounds/useSetRoundIssue'
import { useUser } from '@aces/lib/hooks/user-context'


const API_URL = process.env.NEXT_PUBLIC_API_URL

const fetcher = async (url: string) => {
  const accessToken = localStorage.getItem('accessToken')
  if (!accessToken) {
    throw new Error('No access token found')
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('An error occurred while fetching the data.')
  }

  return response.json()
}

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
  const { data: fetchedIssues, error: issuesError } = useSWR<{ issues: Issue[], nextPage: string | null }>(
    selectedView ? `${API_URL}/views/${selectedView.id}/issues` : null,
    fetcher
  )

  const shouldFetch = selectedView && issues.length > 0
  const { data: currentIssueData, error: currentIssueError } = useSWR(shouldFetch ? [`${API_URL}/rounds/${roundId}/issue`, roundId, issuesState.issues[currentIssueIndex].id] : null, ([url, roundId, issueId]) => {
    return setRoundIssueFetcher(url, roundId, issueId)
  })

  useEffect(() => {
    if (fetchedIssues) {
      dispatch({ type: 'SET_ISSUES', payload: fetchedIssues.issues })
      dispatch({ type: 'SET_NEXT_PAGE', payload: fetchedIssues.nextPage })
    }
  }, [fetchedIssues, dispatch])

  useEffect(() => {
    if (currentIssueData) {
      // Here you can dispatch an action to update the current issue with additional data
      // For example:
      // dispatch({ type: 'UPDATE_CURRENT_ISSUE', payload: currentIssueData })
      console.log('Current issue data:', currentIssueData)
    }
  }, [currentIssueData, dispatch])

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
