'use client'
import React, { useEffect } from 'react'

import IssueContent from '@aces/components/issues/issue-content'
import { Separator } from '@aces/components/ui/separator'
import ViewDropdown from '@aces/components/view-dropdown'
import { useInitialView } from '@aces/lib/hooks/use-initial-view'
import useIssueManager from '@aces/lib/hooks/use-issue-manager'
import useViewsDisplay, { ViewsDisplay } from '@aces/lib/hooks/use-views-display'
import { useUser } from '@aces/lib/hooks/user-context'


interface IssueDisplayProps {
  roundId: string
}

function AuthenticatedIssueDisplay({ roundId }: IssueDisplayProps): React.ReactElement {
  const viewsDisplay: ViewsDisplay | null = useViewsDisplay()
  const { favoriteViews, setSelectedView, selectedView } = viewsDisplay || {}
  const { user } = useUser()

  useEffect(() => {
    if (favoriteViews && setSelectedView && favoriteViews.length > 0) {
      setSelectedView(favoriteViews[0])
    }
  }, [favoriteViews, setSelectedView])

  useInitialView(viewsDisplay)

  const {
    issues,
    isLoading,
    currentIssueIndex,
    handlePrevIssue,
    handleNextIssue,
  } = useIssueManager({ selectedView, user, roundId })

  return (
    <div className="space-y-6">
      {user && (
        <div>
          <ViewDropdown viewsDisplay={viewsDisplay} />
        </div>
      )}
      <Separator />
      <IssueContent
        currentIssueIndex={currentIssueIndex}
        handleNextIssue={handleNextIssue}
        handlePrevIssue={handlePrevIssue}
        isLoading={isLoading}
        issues={issues}
      />
    </div>
  )
}

export default AuthenticatedIssueDisplay
