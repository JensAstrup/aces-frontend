import React from 'react'

import { Estimate } from '@aces/components/estimate'
import { Icons } from '@aces/components/icons'
import { Stats } from '@aces/components/ui/stats'
import { Votes } from '@aces/components/votes'
import { Issue } from '@aces/interfaces/issue'


interface RoundSidebarProps {
  roundId: string
  currentIssue: Issue | null
  isIssueLoading: boolean
}

export function RoundSidebar({ roundId, currentIssue, isIssueLoading }: RoundSidebarProps): JSX.Element {
  if (isIssueLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px] h-full">
        <Icons.spinner className="animate-spin h-8 w-8 text-gray-500" />
      </div>
    )
  }

  if (!currentIssue) {
    return <div>No issue data available</div>
  }

  return (
    <>
      <Estimate roundId={roundId} issue={currentIssue} />
      <Votes />
      <Stats />
    </>
  )
}
