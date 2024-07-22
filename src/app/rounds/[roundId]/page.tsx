'use client'
import React, { useEffect } from 'react'

import UnauthenticatedIssueDisplay from '@aces/app/issues/anonymous-issue-display'
import AuthenticatedIssueDisplay from '@aces/app/issues/authenticated-issue-display'
import useViewsDisplay, { ViewsDisplay } from '@aces/app/issues/use-views-display'
import { useUser } from '@aces/app/oauth/user-context'
import { Estimate } from '@aces/components/ui/estimate'
import { Stats } from '@aces/components/ui/stats'
import { Votes } from '@aces/components/ui/votes'



interface RoundPageProps {
  params: { roundId: string }
}

function RoundPage({ params }: RoundPageProps) {
  const viewsDisplay: ViewsDisplay | null = useViewsDisplay()
  const { favoriteViews, setSelectedView } = viewsDisplay || {}
  const user = useUser()

  useEffect(() => {
    if (!favoriteViews || !setSelectedView) return
    if (favoriteViews.length > 0) {
      setSelectedView(favoriteViews[0])
    }
  }, [favoriteViews, setSelectedView])

  return (
    <div className="grid md:grid-cols-5 gap-6 lg:gap-12 items-start max-w-6xl px-4 mx-auto py-6">
      <div className="md:col-span-3">
        {user ? (<AuthenticatedIssueDisplay roundId={params.roundId} />) : <UnauthenticatedIssueDisplay roundId={params.roundId} />}
      </div>
      <div className="space-y-8 md:col-span-2">
        <Estimate />
        <Votes />
        <Stats />
      </div>
    </div>
  )
}

export default RoundPage
