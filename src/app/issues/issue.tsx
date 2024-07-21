'use client'
import React, { useEffect, useState } from 'react'

import { Issue } from '@aces/app/interfaces/issue'
import { useInitialView } from '@aces/app/issues/use-initial-view'
import { useSelectedView } from '@aces/app/issues/use-selected-view'
import useViewsDisplay, { viewsDisplay } from '@aces/app/issues/use-views-display'
import { Icons } from '@aces/components/icons'
import { Comments } from '@aces/components/ui/comments/comments'
import IssueSection from '@aces/components/ui/issues/issue-section'
import { Separator } from '@aces/components/ui/separator'
import ViewDropdown from '@aces/components/view-dropdown'


const IssueDisplay: React.FC = () => {
  const viewsDisplay: viewsDisplay | null = useViewsDisplay()
  const { favoriteViews, setSelectedView, selectedView } = viewsDisplay || {}
  const [issues, setIssues] = useState<Issue[]>([])
  const [nextPage, setNextPage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [currentIssueIndex, setCurrentIssueIndex] = useState<number>(0)

  useEffect(() => {
    if (favoriteViews && setSelectedView && favoriteViews.length > 0) {
      setSelectedView(favoriteViews[0])
    }
  }, [favoriteViews, setSelectedView])

  useEffect(() => {
    setCurrentIssueIndex(0) // Reset currentIssueIndex when selectedView changes
  }, [selectedView])

  useInitialView(viewsDisplay)
  useSelectedView(setIsLoading, selectedView!, issues, setIssues, nextPage, setNextPage, currentIssueIndex)

  const handlePrevIssue = (): void => {
    setCurrentIssueIndex(prevIndex => Math.max(0, prevIndex - 1))
  }

  const handleNextIssue = (): void => {
    setCurrentIssueIndex(prevIndex => Math.min(issues.length - 1, prevIndex + 1))
  }

  const loadingSection = (
    <div className="flex items-center justify-center min-h-[200px]">
      <Icons.spinner className="h-8 w-8 animate-spin" />
    </div>
  )

  console.log('issues', issues)
  console.log('currentIssueIndex', currentIssueIndex)

  const issueSection = (
    <div>
      <IssueSection
        hasNextIssue={currentIssueIndex < issues.length - 1}
        hasPrevIssue={currentIssueIndex > 0}
        issue={issues[currentIssueIndex]}
        onNextIssue={handleNextIssue}
        onPrevIssue={handlePrevIssue}
      />
      <Comments issue={issues[currentIssueIndex]} />
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
  else if (issues.length > 0 && issues[currentIssueIndex]) {
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
