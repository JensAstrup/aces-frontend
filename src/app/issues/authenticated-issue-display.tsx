import React, { Suspense, useCallback } from 'react'

import IssueContent from '@aces/components/issues/issue-content'
import LoadingRound from '@aces/components/rounds/loading-round'
import { Separator } from '@aces/components/ui/separator'
import ViewDropdown from '@aces/components/view-dropdown'
import { View } from '@aces/interfaces/view'
import useCurrentUser from '@aces/lib/hooks/auth/use-current-user'
import useViews from '@aces/lib/hooks/views/views-context'


function AuthenticatedIssueDisplay({ views }: { views: View[] }): React.ReactElement {
  const { user } = useCurrentUser()
  const { selectedView, setView } = useViews()

  const handleViewSelect = useCallback((view: View) => {
    setView(view)
  }, [setView])

  const setViewHandler = useCallback((view: View | ((prev: View | null) => View | null)) => {
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


  return (
    <Suspense fallback={<LoadingRound />}>
      <div className="space-y-6">
        {user && (
          <div>
            <ViewDropdown views={views} selectedView={selectedView} setView={setViewHandler} />
          </div>
        )}
        <Separator />
        <IssueContent />
      </div>
    </Suspense>
  )
}

export default AuthenticatedIssueDisplay
