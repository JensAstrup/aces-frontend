'use client'
import React, { useCallback } from 'react'

import IssueContent from '@aces/components/issues/issue-content'
import LoadingRound from '@aces/components/rounds/loading-round'
import { Separator } from '@aces/components/ui/separator'
import ViewDropdown from '@aces/components/view-dropdown'
import { View } from '@aces/interfaces/view'
import useCurrentUser from '@aces/lib/hooks/auth/use-current-user'
import { useIssues } from '@aces/lib/hooks/issues/issues-context'
import useViews from '@aces/lib/hooks/views/views-context'


function AuthenticatedIssueDisplay() {
  const { user } = useCurrentUser()
  const { currentIssue, setCurrentIssue, issues } = useIssues()
  const { isLoading: viewsLoading, selectedView, setSelectedView } = useViews()

  const handleViewSelect = useCallback((view: View) => {
    setSelectedView(view)
  }, [setSelectedView])

  const setView = useCallback((view: View | ((prev: View | null) => View | null)) => {
    if (typeof view === 'function') {
      const selectedViewResult: View | null = view(selectedView)
      if (selectedViewResult) {
        handleViewSelect(selectedViewResult)
      }
    }
    else {
      handleViewSelect(view)
    }
  }, [handleViewSelect, selectedView])

  const handleNavigate = useCallback((direction: 'next' | 'previous') => {
    if (!currentIssue) return
    const currentIndex = issues.findIndex(issue => issue.id === currentIssue.id)
    if (currentIndex === -1) return

    let newIndex
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % issues.length
    }
    else {
      newIndex = (currentIndex - 1 + issues.length) % issues.length
    }
    setCurrentIssue(issues[newIndex])
  }, [setCurrentIssue, issues, currentIssue])

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
          issue={currentIssue}
          handleNavigate={handleNavigate}
        />
      )}
    </div>
  )
}

export default AuthenticatedIssueDisplay
