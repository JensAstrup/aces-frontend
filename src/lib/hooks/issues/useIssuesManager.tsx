import { useCallback, useEffect } from 'react'

import { View } from '@aces/interfaces/view'
import getIssues from '@aces/lib/api/get-issues'
import useSetRoundIssue from '@aces/lib/hooks/rounds/useSetRoundIssue'

import { useIssues } from './issues-context'


export function useIssuesManager(roundId: string) {
  const { state, dispatch } = useIssues()
  const { selectedView, issues, currentIssueIndex, nextPage } = state

  const { error: setRoundIssueError } = useSetRoundIssue(roundId, issues[currentIssueIndex]?.id || '')

  useEffect(() => {
    if (setRoundIssueError) {
      console.error('Failed to update round issue', setRoundIssueError)
    }
  }, [setRoundIssueError])

  const fetchIssues = useCallback(async (view: View | null, page: string | null = null) => {
    if (!view) return

    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      const viewIssues = await getIssues(view, page)
      if (page === null) {
        dispatch({ type: 'SET_ISSUES', payload: viewIssues.issues })
      }
      else {
        dispatch({ type: 'APPEND_ISSUES', payload: viewIssues.issues })
      }
      dispatch({ type: 'SET_NEXT_PAGE', payload: viewIssues.nextPage })
    }
    catch (error) {
      console.error('Failed to fetch issues:', error)
    }
    finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [dispatch])

  useEffect(() => {
    if (selectedView) {
      fetchIssues(selectedView)
    }
  }, [selectedView, fetchIssues])

  useEffect(() => {
    if (currentIssueIndex === issues.length - 1 && nextPage) {
      fetchIssues(selectedView, nextPage)
    }
  }, [currentIssueIndex, nextPage, selectedView, fetchIssues, issues.length])

  const setSelectedView = useCallback((view: View) => {
    dispatch({ type: 'SET_SELECTED_VIEW', payload: view })
  }, [dispatch])

  const handlePrevIssue = useCallback(() => {
    dispatch({ type: 'SET_CURRENT_ISSUE_INDEX', payload: Math.max(0, currentIssueIndex - 1) })
  }, [dispatch, currentIssueIndex])

  const handleNextIssue = useCallback(() => {
    dispatch({ type: 'SET_CURRENT_ISSUE_INDEX', payload: Math.min(issues.length - 1, currentIssueIndex + 1) })
  }, [dispatch, currentIssueIndex, issues.length])

  return {
    ...state,
    setSelectedView,
    handlePrevIssue,
    handleNextIssue,
  }
}

export default useIssuesManager
