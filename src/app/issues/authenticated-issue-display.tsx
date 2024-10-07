'use client'
import React, { useCallback } from 'react'

import IssueContent from '@aces/components/issues/issue-content'
import LoadingRound from '@aces/components/rounds/loading-round'
import { Separator } from '@aces/components/ui/separator'
import ViewDropdown from '@aces/components/view-dropdown'
import { View } from '@aces/interfaces/view'
import useCurrentUser from '@aces/lib/hooks/auth/use-current-user'
import useViews from '@aces/lib/hooks/views/views-context'


function AuthenticatedIssueDisplay() {
  const { user } = useCurrentUser()
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
        <IssueContent />
      )}
    </div>
  )
}

export default AuthenticatedIssueDisplay
