'use client'
import React from 'react'

import { Comments } from '@aces/components/comments/comments'
import IssueSection from '@aces/components/issues/issue-section'
import LoadingRound from '@aces/components/rounds/loading-round'
import { Separator } from '@aces/components/ui/separator'
import { Issue } from '@aces/interfaces/issue'
import useWebSocketIssue from '@aces/lib/hooks/issues/use-websocket-issue'


interface IssueDisplayProps {
    roundId: string
}

function CurrentIssueDisplay({ issue }: { issue: Issue }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">Current Issue</h1>
      <Separator className="mb-2 mt-2" />
      <IssueSection issue={issue} />
      <Comments issue={issue} />
    </div>
  )
}


function UnauthenticatedIssueDisplay({ roundId }: IssueDisplayProps) {
  const { issue } = useWebSocketIssue(roundId)

  return (
    <div className="space-y-6">
      {issue ? <CurrentIssueDisplay issue={issue} /> : <LoadingRound />}
    </div>
  )
}

export default UnauthenticatedIssueDisplay
export { CurrentIssueDisplay }
