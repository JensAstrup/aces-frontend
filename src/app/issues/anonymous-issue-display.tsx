'use client'
import React from 'react'

import { CommentList } from '@aces/components/comments/comment-list'
import IssueSection from '@aces/components/issues/issue-section'
import LoadingRound from '@aces/components/rounds/loading-round'
import { Separator } from '@aces/components/ui/separator'
import { Issue } from '@aces/interfaces/issue'
import { useIssues } from '@aces/lib/hooks/issues/issues-context'


function CurrentIssueDisplay({ issue }: { issue: Issue }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">Current Issue</h1>
      <Separator className="mb-2 mt-2" />
      <IssueSection issue={issue} />
      <CommentList issue={issue} />
    </div>
  )
}


function UnauthenticatedIssueDisplay() {
  const { currentIssue } = useIssues()

  return (
    <div className="space-y-6">
      {currentIssue ? <CurrentIssueDisplay issue={currentIssue} /> : <LoadingRound />}
    </div>
  )
}

export default UnauthenticatedIssueDisplay
export { CurrentIssueDisplay }
