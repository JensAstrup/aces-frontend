'use client'
import { Icons } from '@aces/components/icons'
import { Separator } from '@aces/components/ui/separator'
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
      <h1 className="text-2xl font-bold">Current Issue</h1>
      < Separator className='mb-2 mt-2'/>
      <IssueSection issue={issue}/>
      <Comments issue={issue}/>
    </div>
  )
}

function LoadingDisplay() {
  return (<div className="flex flex-col items-center justify-center space-y-4 min-h-[200px]">
    <h2 className="font-bold font-heading text-xl">Waiting for round to begin</h2>
    <Icons.spinner className="h-8 w-8 animate-spin"/>
  </div>)
}


function UnauthenticatedIssueDisplay({ roundId }: IssueDisplayProps) {
  const currentIssue = useWebSocketIssue(roundId)

  return (
    <div className="space-y-6">
      {currentIssue ? <CurrentIssueDisplay issue={currentIssue} /> : <LoadingDisplay />}
    </div>
  )
}

export default UnauthenticatedIssueDisplay
export { CurrentIssueDisplay, LoadingDisplay }
