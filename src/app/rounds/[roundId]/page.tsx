'use client'
import React, { useEffect } from 'react'

import UnauthenticatedIssueDisplay from '@aces/app/issues/anonymous-issue-display'
import AuthenticatedIssueDisplay from '@aces/app/issues/authenticated-issue-display'
import { Estimate } from '@aces/components/estimate'
import { Stats } from '@aces/components/ui/stats'
import { Votes } from '@aces/components/votes'
import useCurrentIssue from '@aces/lib/hooks/use-current-issue'
import useRegisterViewer from '@aces/lib/hooks/use-register-viewer'
import useViewsDisplay, { ViewsDisplay } from '@aces/lib/hooks/use-views-display'
import { useUser } from '@aces/lib/hooks/user-context'


interface RoundPageProps {
  params: { roundId: string }
}

function RoundPage({ params }: RoundPageProps): JSX.Element {
  const viewsDisplay: ViewsDisplay | null = useViewsDisplay()
  const { user, isLoading: isUserLoading } = useUser()
  const { favoriteViews, setSelectedView } = viewsDisplay || {}
  useRegisterViewer({ roundId: params.roundId }, isUserLoading ? undefined : user)

  const { currentIssue, isLoading: isIssueLoading } = useCurrentIssue({ roundId: params.roundId, user, viewsDisplay })


  useEffect(() => {
    if (!favoriteViews || !setSelectedView) return
    if (favoriteViews.length > 0) {
      setSelectedView(favoriteViews[0])
    }
  }, [favoriteViews, setSelectedView])

  return (
    <div className="grid md:grid-cols-5 gap-6 lg:gap-12 items-start max-w-6xl px-4 mx-auto py-6">
      <div className="md:col-span-3">
        {user
          ? (
            <AuthenticatedIssueDisplay roundId={params.roundId} />
          )
          : (
            <UnauthenticatedIssueDisplay roundId={params.roundId} />
          )}
      </div>
      <div className="space-y-8 md:col-span-2">
        {isIssueLoading
          ? (
            <div>Loading issue data...</div>
          )
          : currentIssue
            ? (
              <>
                <Estimate roundId={params.roundId} issue={currentIssue} />
                <Votes />
                <Stats />
              </>
            )
            : (
              <div>No issue data available</div>
            )}
      </div>
    </div>
  )
}

export default RoundPage
