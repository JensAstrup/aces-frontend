'use client'
import React from 'react'

import { Issue } from '@aces/app/interfaces/issue'
import { Comments } from '@aces/components/comments/comments'
import IssueSection from '@aces/components/issues/issue-section'
import useWebSocketIssue from '@aces/lib/hooks/use-websocket'


interface IssueDisplayProps {
    roundId: string
}

function CurrentIssueDisplay({ issue }: { issue: Issue }) {
  return (
    <div>
      <IssueSection issue={issue} />
      <Comments issue={issue} />
    </div>
  )
}

function LoadingDisplay() {
  return <p>Waiting for new issues...</p>
}



function UnauthenticatedIssueDisplay({ roundId }: IssueDisplayProps) {
  const currentIssue = useWebSocketIssue(roundId)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Current Issue</h1>
      {currentIssue ? <CurrentIssueDisplay issue={currentIssue} /> : <LoadingDisplay />}
    </div>
  )
}

export default UnauthenticatedIssueDisplay
export { CurrentIssueDisplay, LoadingDisplay }
