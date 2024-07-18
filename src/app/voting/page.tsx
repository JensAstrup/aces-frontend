'use client'
import React, { useCallback, useEffect } from 'react'

import { View } from '@aces/app/voting/get-favorite-views'
import getIssues, { Issue } from '@aces/app/voting/use-get-issues'
import useViewsDisplay, { viewsDisplay } from '@aces/app/voting/use-views-display'
import { Icons } from '@aces/components/icons'
import { Comments } from '@aces/components/ui/comments/comments'
import { Estimate } from '@aces/components/ui/estimate'
import IssueSection from '@aces/components/ui/issues/issue-section'
import { Separator } from '@aces/components/ui/separator'
import { Stats } from '@aces/components/ui/stats'
import { Votes } from '@aces/components/ui/votes'
import ViewDropdown from '@aces/components/view-dropdown'


export function useInitialView(viewsDisplay: viewsDisplay | null) {
  const { favoriteViews, setSelectedView } = viewsDisplay || {}

  useEffect(() => {
    if (!favoriteViews || !setSelectedView) return
    if (favoriteViews.length > 0) {
      setSelectedView(favoriteViews[0])
    }
  }, [favoriteViews, setSelectedView])
}

export function useSelectedView(isLoading: boolean, setIsLoading: React.Dispatch<boolean>, selectedView: View | null, setIssues: React.Dispatch<Issue[]>) {
  const logSelectedView = useCallback((view: View | null) => {
    if (view !== null) {
      setIsLoading(true)
      getIssues(view).then((viewIssues) => {
        setIssues(viewIssues)
        setIsLoading(false)
      })
    }
  }, [setIssues])

  useEffect(() => {
    if (selectedView) {
      logSelectedView(selectedView)
    }
  }, [selectedView, logSelectedView])
}


const IssuePage: React.FC = () => {
  const viewsDisplay: viewsDisplay | null = useViewsDisplay()
  const { favoriteViews, setSelectedView } = viewsDisplay || {}
  const [issues, setIssues] = React.useState<Issue[]>([])
  type SetIsLoading = React.Dispatch<React.SetStateAction<boolean>>

  const [isLoading, setIsLoading]: [boolean, SetIsLoading] = React.useState(true)
  useEffect(() => {
    if (!favoriteViews || !setSelectedView) return
    if (favoriteViews.length > 0) {
      setSelectedView(favoriteViews[0])
    }
  }, [favoriteViews, setSelectedView])

  useInitialView(viewsDisplay)
  useSelectedView(isLoading, setIsLoading, viewsDisplay?.selectedView || null, setIssues)

  const loadingSection = (
    <div className="flex items-center justify-center min-h-[200px]">
      <Icons.spinner className="h-8 w-8 animate-spin" />
    </div>
  )
  const issueSection = (
    <div>
      <IssueSection issue={issues[0]} />
      <Comments />
    </div>
  )

  return (
    <div className="grid md:grid-cols-2 gap-6 lg:gap-12 items-start max-w-6xl px-4 mx-auto py-6">
      <div className="space-y-6">
        <div>
          <ViewDropdown viewsDisplay={viewsDisplay} />
        </div>
        <Separator />
        {isLoading ? loadingSection : issueSection}
      </div>
      <div className="space-y-8">
        <Estimate />
        <Votes />
        <Stats />
      </div>
    </div>
  )
}

export default IssuePage
