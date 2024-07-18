'use client'
import React, { useEffect } from 'react'

import IssueDisplay from '@aces/app/issues/issue'
import useViewsDisplay, { viewsDisplay } from '@aces/app/voting/use-views-display'
import { Estimate } from '@aces/components/ui/estimate'
import { Stats } from '@aces/components/ui/stats'
import { Votes } from '@aces/components/ui/votes'


const IssuePage: React.FC = () => {
  const viewsDisplay: viewsDisplay | null = useViewsDisplay()
  const { favoriteViews, setSelectedView } = viewsDisplay || {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  useEffect(() => {
    if (!favoriteViews || !setSelectedView) return
    if (favoriteViews.length > 0) {
      setSelectedView(favoriteViews[0])
    }
  }, [favoriteViews, setSelectedView])


  return (
    <div className="grid md:grid-cols-2 gap-6 lg:gap-12 items-start max-w-6xl px-4 mx-auto py-6">
      <IssueDisplay />
      <div className="space-y-8">
        <Estimate />
        <Votes />
        <Stats />
      </div>
    </div>
  )
}

export default IssuePage
