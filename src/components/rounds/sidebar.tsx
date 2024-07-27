import React from 'react'

import { Estimate } from '@aces/components/estimate'
import { Icons } from '@aces/components/icons'
import { Stats } from '@aces/components/ui/stats'
import { Votes } from '@aces/components/votes'
import { useIssues } from '@aces/lib/hooks/issues/issues-context'
import useWebSocketIssue from '@aces/lib/hooks/issues/use-websocket-issue'
import { useUser } from '@aces/lib/hooks/user-context'


interface RoundSidebarProps {
  roundId: string
}

export function RoundSidebar({ roundId }: RoundSidebarProps): JSX.Element {
  const { state: issuesState } = useIssues()
  const { user } = useUser()
  const { isLoading, issues, currentIssueIndex } = issuesState
  const { issue: socketIssue } = useWebSocketIssue(roundId)
  let currentIssue = null
  if (!user) {
    currentIssue = socketIssue
  }
  else {
    currentIssue = issues[currentIssueIndex]
  }

  if (isLoading || !currentIssue) {
    return (
      <div className="flex justify-center items-center min-h-[200px] h-full">
        <Icons.spinner className="animate-spin h-8 w-8 text-gray-500" />
      </div>
    )
  }

  return (
    <>
      <Estimate roundId={roundId} issue={currentIssue} />
      <Votes />
      <Stats />
    </>
  )
}
