import React, { useCallback } from 'react'

import IssueContent from '@aces/components/issues/issue-content'
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
    <div className="space-y-6">
      {user && (
        <div>
          <ViewDropdown views={views} selectedView={selectedView} setView={setViewHandler} />
        </div>
      )}
      <Separator />
      <IssueContent />
    </div>
  )
}

export default AuthenticatedIssueDisplay
