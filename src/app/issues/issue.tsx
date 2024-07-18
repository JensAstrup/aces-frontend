'use client'
import React, { useEffect } from 'react'

import { Issue } from '@aces/app/voting/use-get-issues'
import { useInitialView } from '@aces/app/voting/use-initial-view'
import { useSelectedView } from '@aces/app/voting/use-selected-view'
import useViewsDisplay, { viewsDisplay } from '@aces/app/voting/use-views-display'
import { Icons } from '@aces/components/icons'
import { Comments } from '@aces/components/ui/comments/comments'
import IssueSection from '@aces/components/ui/issues/issue-section'
import { Separator } from '@aces/components/ui/separator'
import ViewDropdown from '@aces/components/view-dropdown'


const IssueDisplay: React.FC = () => {
  const viewsDisplay: viewsDisplay | null = useViewsDisplay()
  const { favoriteViews, setSelectedView } = viewsDisplay || {}
  const [issues, setIssues] = React.useState<Issue[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  useEffect(() => {
    if (favoriteViews && setSelectedView && favoriteViews.length > 0) {
      setSelectedView(favoriteViews[0])
    }
  }, [favoriteViews, setSelectedView])

  useInitialView(viewsDisplay)
  useSelectedView(setIsLoading, viewsDisplay?.selectedView || null, setIssues)

  const loadingSection = (
    <div className="flex items-center justify-center min-h-[200px]">
      <Icons.spinner className="h-8 w-8 animate-spin" />
    </div>
  )
  const issueSection = (
    <div>
      <IssueSection issue={issues[0]} />
      <Comments issue={issues[0]} />
    </div>
  )

  const noIssues = (
    <div className="flex items-center justify-center min-h-[200px] flex-col">
      <h1 className="text-xl font-bold">No issues found</h1>
      <p className="text-sm text-muted-foreground">Please try another view</p>
    </div>
  )

  let content
  if (isLoading) {
    content = loadingSection
  }
  else if (issues.length > 0) {
    content = issueSection
  }
  else {
    content = noIssues
  }

  return (
    <div className="space-y-6">
      <div>
        <ViewDropdown viewsDisplay={viewsDisplay} />
      </div>
      <Separator />
      {content}
    </div>
  )
}

export default IssueDisplay
